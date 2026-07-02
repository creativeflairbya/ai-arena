export type PlanKey = "free" | "pro" | "studio" | "enterprise";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  monthlyCredits: number;
  pkrPrice: number; // in PKR
  usdPrice: number; // in USD
  features: string[];
  highlight?: boolean;
  badge?: string;
}

export const PLANS: PlanDefinition[] = [
  {
    key: "free",
    name: "Free",
    tagline: "Try every tool, on the house.",
    monthlyCredits: 50,
    pkrPrice: 0,
    usdPrice: 0,
    features: [
      "50 credits every month",
      "Text → Image (unlimited quality)",
      "3 free videos on signup",
      "Standard generation speed",
      "Personal commercial license",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For creators shipping daily.",
    monthlyCredits: 1500,
    pkrPrice: 2499,
    usdPrice: 9,
    badge: "Most popular",
    highlight: true,
    features: [
      "1,500 credits / month",
      "Veo · Seedance · Kling models",
      "Up to 1080p video & 4K image",
      "Priority queue (3× faster)",
      "Email + chat support",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    tagline: "Studios & small teams.",
    monthlyCredits: 6000,
    pkrPrice: 7999,
    usdPrice: 29,
    features: [
      "6,000 credits / month",
      "All Pro features included",
      "Up to 4K video, 8K image",
      "5 team seats",
      "Brand kits & presets",
      "API access (sandbox)",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "Custom limits & SLAs.",
    monthlyCredits: 25000,
    pkrPrice: 24999,
    usdPrice: 89,
    features: [
      "25,000 credits / month",
      "Unlimited team seats",
      "Dedicated GPU lane",
      "Custom model fine-tuning",
      "SLA + 24/7 priority support",
      "On-prem option available",
    ],
  },
];

export function getPlan(key: PlanKey): PlanDefinition {
  const p = PLANS.find((x) => x.key === key);
  if (!p) throw new Error(`Unknown plan: ${key}`);
  return p;
}

export const PAKISTAN_METHODS = [
  {
    key: "jazzcash",
    name: "JazzCash",
    description: "Pay with your JazzCash mobile wallet",
    icon: "JC",
  },
  {
    key: "easypaisa",
    name: "EasyPaisa",
    description: "Pay with your EasyPaisa mobile wallet",
    icon: "EP",
  },
  {
    key: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct deposit to our HBL / Meezan account",
    icon: "BT",
  },
] as const;

export const INTERNATIONAL_METHODS = [
  {
    key: "stripe",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex via Stripe",
    icon: "💳",
  },
  {
    key: "stripe_paypal",
    name: "PayPal",
    description: "Pay securely with your PayPal balance",
    icon: "🅿️",
  },
] as const;
