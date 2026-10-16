export const COIN_COLORS: Record<string, string> = {
  bitcoin: '#F7931A',
  ethereum: '#8C9EFF',
  binancecoin: '#F3BA2F',
  ripple: '#38BDF8',
  solana: '#2FE6A6',
  dogecoin: '#F472B6',
}

export const FALLBACK_COLOR = '#94A3B8'

// coins we don't have a set color for get their own stable color
export function coinColor(id: string): string {
  const known = COIN_COLORS[id]
  if (known) return known

  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360
  }
  return `hsl(${hash}, 70%, 65%)`
}