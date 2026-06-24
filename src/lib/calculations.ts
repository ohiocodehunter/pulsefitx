export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain" | "muscle";

export interface FitnessInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}

const activityMultiplier: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalAdjustment: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
  muscle: 300,
};

export function calcBMR({ age, gender, heightCm, weightKg }: FitnessInput): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "male" ? base + 5 : base - 161);
}

export function calcTDEE(input: FitnessInput): number {
  return Math.round(calcBMR(input) * activityMultiplier[input.activity]);
}

export interface FitnessTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterL: number;
  stepGoal: number;
}

export function calcTargets(input: FitnessInput): FitnessTargets {
  const bmr = calcBMR(input);
  const tdee = calcTDEE(input);
  const calories = Math.max(1200, tdee + goalAdjustment[input.goal]);

  // Protein: 1.8g/kg for muscle/gain, 2.0 for cut, 1.4 for maintain
  const proteinPerKg = input.goal === "lose" ? 2.0 : input.goal === "maintain" ? 1.4 : 1.8;
  const proteinG = Math.round(input.weightKg * proteinPerKg);

  // Fats: 25% of calories
  const fatsG = Math.round((calories * 0.25) / 9);
  // Carbs: remainder
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatsG * 9) / 4));

  const waterL = Math.round(input.weightKg * 0.033 * 10) / 10;
  const stepGoal = input.goal === "lose" ? 10000 : input.goal === "maintain" ? 8000 : 8000;

  return { bmr, tdee, calories, proteinG, carbsG, fatsG, waterL, stepGoal };
}