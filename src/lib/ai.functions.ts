import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Free-tier Gemini models, tried in order. When one is busy/rate-limited, fall back to the next.
const FREE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
];

const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

function isRetriable(status: number, message: string): boolean {
  return (
    status === 503 ||
    status === 429 ||
    /unavailable|high demand|rate limit|too many requests|resource exhausted/i.test(message)
  );
}

async function callGemini(prompt: string, system?: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  let lastError: Error | undefined;

  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };
    try {
      const res = await fetch(GEMINI_URL(model, key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        const err = new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
        if (isRetriable(res.status, errText)) {
          lastError = err;
          // Brief pause before trying the next free model
          if (i < FREE_MODELS.length - 1) await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        throw err;
      }
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (isRetriable(0, err.message)) {
        lastError = err;
        if (i < FREE_MODELS.length - 1) await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("All Gemini models are busy. Please try again later.");
}

/** Chat with the AI fitness coach. */
export const chatWithCoach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        message: z.string().min(1).max(2000),
        context: z
          .object({
            name: z.string().optional(),
            goal: z.string().optional(),
            calories: z.number().optional(),
            proteinG: z.number().optional(),
            stepGoal: z.number().optional(),
            todayCalories: z.number().optional(),
            todaySteps: z.number().optional(),
            todayProtein: z.number().optional(),
          })
          .optional(),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() }))
          .max(20)
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const ctx = data.context;
    const system = `You are PulsefitX, a sharp, encouraging AI fitness coach.
Be concise (3-6 sentences), specific, and action-oriented. Never give generic motivational fluff.
Use the user's actual numbers when relevant. If you suggest a change, name the exact amount.

User profile: ${ctx ? JSON.stringify(ctx) : "unknown"}.`;
    const transcript = (data.history ?? [])
      .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`)
      .join("\n");
    const prompt = `${transcript ? transcript + "\n" : ""}User: ${data.message}\nCoach:`;
    const reply = await callGemini(prompt, system);
    return { reply: reply.trim() };
  });

/** Generate a one-day meal plan based on available foods + targets. */
export const generateMealPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        foods: z.array(z.string()).min(1).max(40),
        calories: z.number().int().min(1000).max(5000),
        proteinG: z.number().int().min(40).max(300),
        diet: z.enum(["vegetarian", "non_vegetarian", "vegan"]),
        lifestyle: z.enum(["hostel", "home", "office", "solo"]),
        budget: z.enum(["low", "medium", "high"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const system = `You are a nutrition planner. Return STRICT JSON only — no markdown, no commentary.
Schema:
{
  "summary": string,
  "meals": [
    {"name": "Breakfast"|"Lunch"|"Snack"|"Dinner", "time": string, "items": [{"food": string, "portion": string, "calories": number, "proteinG": number}], "totalCalories": number, "totalProteinG": number}
  ],
  "tips": [string]
}`;
    const prompt = `Build a realistic 1-day meal plan.
Available foods: ${data.foods.join(", ")}
Target calories: ${data.calories} kcal
Target protein: ${data.proteinG} g
Diet: ${data.diet}
Lifestyle: ${data.lifestyle}
Budget: ${data.budget}

Use ONLY the available foods. Include 4 meals (Breakfast, Lunch, Snack, Dinner). Keep portions practical for the lifestyle and budget. Return JSON only.`;
    const raw = await callGemini(prompt, system);
    // Strip code fences if present
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned) as {
        summary: string;
        meals: Array<{
          name: string;
          time: string;
          items: Array<{ food: string; portion: string; calories: number; proteinG: number }>;
          totalCalories: number;
          totalProteinG: number;
        }>;
        tips: string[];
      };
    } catch {
      throw new Error("AI returned an invalid meal plan. Try again.");
    }
  });

/** Generate a smart coach recommendation given today's logs. */
export const generateCoachInsight = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        calorieGoal: z.number(),
        proteinGoal: z.number(),
        stepGoal: z.number(),
        waterGoal: z.number(),
        todayCalories: z.number(),
        todayProtein: z.number(),
        todaySteps: z.number(),
        todayWater: z.number(),
        goal: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const system =
      "You are a fitness coach. Give ONE specific, numeric, actionable recommendation in 1-2 sentences based on the gap to today's goals. No generic motivation.";
    const prompt = `Goal: ${data.goal}
Today so far:
- Calories: ${data.todayCalories}/${data.calorieGoal} kcal
- Protein: ${data.todayProtein}/${data.proteinGoal} g
- Steps: ${data.todaySteps}/${data.stepGoal}
- Water: ${data.todayWater}/${data.waterGoal} L

Suggest one specific action for the rest of today.`;
    const text = await callGemini(prompt, system);
    return { insight: text.trim() };
  });