import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ja";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.features": "Features",
  "nav.how": "How It Works",
  "nav.plans": "Plans",
  "nav.about": "About Us",
  "nav.login": "Log in",
  "nav.getStarted": "Get Started",

  "hero.badge": "AI Powered Fitness Coach",
  "hero.title1": "Train Smart.",
  "hero.title2": "Eat Right.",
  "hero.title3": "Live Better.",
  "hero.subtitle": "Your AI fitness coach that builds personalized plans, tracks progress and helps you become the best version of yourself.",
  "hero.cta.primary": "Start Your Journey",
  "hero.cta.secondary": "See How It Works",
  "hero.social": "Loved by 10,000+ users",

  "pills.meal.label": "AI Meal Plans",
  "pills.meal.sub": "Personalized for you",
  "pills.tracking.label": "Real-time Tracking",
  "pills.tracking.sub": "Steps, calories & more",
  "pills.analytics.label": "Smart Analytics",
  "pills.analytics.sub": "Track progress easily",
  "pills.anywhere.label": "Works Anywhere",
  "pills.anywhere.sub": "Home, Office, Gym",

  "features.eyebrow": "Everything You Need",
  "features.title": "All-in-One Fitness Solution",
  "features.subtitle": "PulsefitX combines AI technology with proven fitness science to deliver personalized guidance that actually works.",
  "features.nutrition.title": "AI Nutrition Plans",
  "features.nutrition.desc": "Personalized meal plans based on your goal, lifestyle and available foods.",
  "features.activity.title": "Activity Tracking",
  "features.activity.desc": "Track steps, workouts, calories, water intake and sleep in real-time.",
  "features.progress.title": "Progress Analytics",
  "features.progress.desc": "Beautiful charts and insights to help you understand your progress.",
  "features.coach.title": "AI Coach",
  "features.coach.desc": "Get smart recommendations and daily motivation from your AI coach.",
  "features.learnMore": "Learn more",

  "cta.title": "Start your fitness journey today",
  "cta.subtitle": "Join thousands of people transforming their lives with PulsefitX.",
  "cta.button": "Get Started — It's Free",
  "cta.noCard": "No credit card required",

  "how.eyebrow": "How It Works",
  "how.title": "Simple Steps to a Healthier You",
  "how.s1.title": "Tell us about you",
  "how.s1.desc": "Share your goals, lifestyle and available foods in a 2-minute onboarding.",
  "how.s2.title": "Get your AI plan",
  "how.s2.desc": "Receive a personalized nutrition, workout and activity plan instantly.",
  "how.s3.title": "Track and adapt",
  "how.s3.desc": "Log meals and activity — your coach adapts your plan as you progress.",

  "footer.free.label": "100% Free",
  "footer.free.sub": "All features, always free",
  "footer.ai.label": "AI Powered",
  "footer.ai.sub": "Smart plans that adapt to you",
  "footer.privacy.label": "Privacy First",
  "footer.privacy.sub": "Your data is safe and secure",
  "footer.global.label": "Available Everywhere",
  "footer.global.sub": "Web, iOS & Android",
  "footer.heart.label": "Built for the world",
  "footer.heart.sub": "For a healthier planet",
};

const ja: Dict = {
  "nav.home": "ホーム",
  "nav.features": "機能",
  "nav.how": "使い方",
  "nav.plans": "プラン",
  "nav.about": "私たちについて",
  "nav.login": "ログイン",
  "nav.getStarted": "今すぐ始める",

  "hero.badge": "AI搭載フィットネスコーチ",
  "hero.title1": "賢くトレーニング。",
  "hero.title2": "正しく食べる。",
  "hero.title3": "より良く生きる。",
  "hero.subtitle": "あなた専用のAIフィットネスコーチが、パーソナライズされたプランを作成し、進捗を記録し、最高の自分になるためのサポートをします。",
  "hero.cta.primary": "始めましょう",
  "hero.cta.secondary": "使い方を見る",
  "hero.social": "10,000人以上に愛されています",

  "pills.meal.label": "AI食事プラン",
  "pills.meal.sub": "あなたに合わせて",
  "pills.tracking.label": "リアルタイム計測",
  "pills.tracking.sub": "歩数・カロリーなど",
  "pills.analytics.label": "スマート分析",
  "pills.analytics.sub": "進捗を簡単に把握",
  "pills.anywhere.label": "どこでも利用可能",
  "pills.anywhere.sub": "自宅・職場・ジム",

  "features.eyebrow": "必要なすべてが揃う",
  "features.title": "オールインワンのフィットネス体験",
  "features.subtitle": "PulsefitXはAI技術と確かなフィットネス科学を組み合わせ、本当に効果のあるパーソナライズされたガイダンスを提供します。",
  "features.nutrition.title": "AI栄養プラン",
  "features.nutrition.desc": "目標・ライフスタイル・手に入る食材に基づくパーソナルな食事プラン。",
  "features.activity.title": "アクティビティ計測",
  "features.activity.desc": "歩数・運動・カロリー・水分・睡眠をリアルタイムで記録。",
  "features.progress.title": "進捗アナリティクス",
  "features.progress.desc": "美しいチャートとインサイトで進捗を可視化。",
  "features.coach.title": "AIコーチ",
  "features.coach.desc": "AIコーチから毎日のアドバイスとモチベーションを。",
  "features.learnMore": "詳しく見る",

  "cta.title": "今日からフィットネスを始めよう",
  "cta.subtitle": "PulsefitXで人生を変えている何千人もの仲間に加わりましょう。",
  "cta.button": "無料で始める",
  "cta.noCard": "クレジットカード不要",

  "how.eyebrow": "使い方",
  "how.title": "健康への簡単なステップ",
  "how.s1.title": "あなたについて教えてください",
  "how.s1.desc": "目標・ライフスタイル・食材を2分のオンボーディングで共有。",
  "how.s2.title": "AIプランを受け取る",
  "how.s2.desc": "栄養・運動・アクティビティのパーソナルプランをすぐに作成。",
  "how.s3.title": "記録して進化する",
  "how.s3.desc": "食事や運動を記録すると、コーチがプランを最適化していきます。",

  "footer.free.label": "完全無料",
  "footer.free.sub": "すべての機能がずっと無料",
  "footer.ai.label": "AI搭載",
  "footer.ai.sub": "あなたに合わせて進化するプラン",
  "footer.privacy.label": "プライバシー重視",
  "footer.privacy.sub": "データは安全に管理されます",
  "footer.global.label": "どこでも利用可能",
  "footer.global.sub": "Web・iOS・Android対応",
  "footer.heart.label": "世界中のために",
  "footer.heart.sub": "より健康な地球のために",
};

const dicts: Record<Lang, Dict> = { en, ja };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("lang") as Lang | null;
  if (saved === "en" || saved === "ja") return saved;
  const nav = window.navigator.language.toLowerCase();
  return nav.startsWith("ja") ? "ja" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const initial = detect();
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  };
  const t = (k: string) => dicts[lang][k] ?? dicts.en[k] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext);
}