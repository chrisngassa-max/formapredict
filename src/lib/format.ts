export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)} %`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}
