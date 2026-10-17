const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(value: number): string {
  return usd.format(value);
}

export function stockPhrase(quantity: number): string {
  if (quantity <= 0) return "Sold out";
  if (quantity <= 3) return `${quantity} left`;
  return "In stock";
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export function releaseLabel(isoDate: string): string {
  return monthYear.format(new Date(`${isoDate}T00:00:00Z`));
}
