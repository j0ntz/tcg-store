// Store-wide constants. The name is a placeholder and lives only here.
export const STORE_NAME = "TCG Store";

export const FREE_SHIPPING_THRESHOLD = 75;

export const PROMISE_BAR =
  "Free tracked shipping on orders over $75 · Ships in 1 business day · Every single sleeved and toploaded";

export const TRADEMARK_NOTICE =
  "Pokémon and Pokémon character names are trademarks of Nintendo, Creatures, and GAME FREAK. This store is not affiliated with or endorsed by them.";

export type ConditionCode = "NM" | "LP" | "MP" | "HP";

export interface Condition {
  code: ConditionCode;
  name: string;
  short: string;
}

export const CONDITIONS: Condition[] = [
  { code: "NM", name: "Near Mint", short: "Clean front and back, sharp corners." },
  { code: "LP", name: "Lightly Played", short: "Minor edge wear or light scratches." },
  { code: "MP", name: "Moderately Played", short: "Visible wear, no creases or water damage." },
  { code: "HP", name: "Heavily Played", short: "Heavy wear or a crease. Plays in a sleeve." },
];

export function conditionName(code: string): string {
  return CONDITIONS.find((c) => c.code === code)?.name ?? code;
}

export const SEALED_KIND_LABEL: Record<string, string> = {
  etb: "Elite Trainer Box",
  bundle: "Booster Bundle",
  box: "Booster Box",
  pack: "Booster Pack",
};

export interface ShippingMethod {
  id: "tracked" | "priority" | "envelope";
  name: string;
  detail: string;
  // Returns the price for a subtotal, or null when the method is not offered for it.
  priceFor: (subtotal: number) => number | null;
  unavailableReason: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "tracked",
    name: "Tracked · USPS Ground Advantage",
    detail: "2 to 5 business days",
    priceFor: (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.95),
    unavailableReason: "",
  },
  {
    id: "priority",
    name: "Priority · USPS Priority Mail",
    detail: "1 to 3 business days",
    priceFor: () => 9.95,
    unavailableReason: "",
  },
  {
    id: "envelope",
    name: "Plain white envelope, untracked",
    detail: "Only for orders under $20",
    priceFor: (subtotal) => (subtotal < 20 ? 1.25 : null),
    unavailableReason: "Not offered for orders of $20 or more",
  },
];

export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit != null && explicit !== "") return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel != null && vercel !== "") return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
