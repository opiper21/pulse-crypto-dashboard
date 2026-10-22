export function formatUsd(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: n >= 100 ? 2 : n >= 1 ? 4 : 6,
  })
}