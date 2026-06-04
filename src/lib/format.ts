const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat("en");

export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}

export function formatNumber(value: number): string {
  return fullFormatter.format(value);
}
