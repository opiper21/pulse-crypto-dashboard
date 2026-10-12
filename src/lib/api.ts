export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
}

export interface PricePoint {
  time: number
  value: number
}

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin', 'binancecoin']
const HISTORY_MAX_AGE = 30 * 60_000 // reuse saved chart data for 30 minutes

interface CacheEntry<T> {
  time: number
  data: T
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ time: Date.now(), data }))
  } catch {
    // storage full or blocked, safe to ignore
  }
}

export async function fetchCoins(): Promise<Coin[]> {
  const cached = readCache<Coin[]>('pulse:coins')
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS.join(',')}&price_change_percentage=24h`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const data: Coin[] = await res.json()
    writeCache('pulse:coins', data)
    return data
  } catch (err) {
    if (cached) return cached.data // show the last known prices instead of an error
    throw err
  }
}

export async function fetchHistory(id: string): Promise<PricePoint[]> {
  const key = `pulse:history:${id}`
  const cached = readCache<PricePoint[]>(key)

  if (cached && Date.now() - cached.time < HISTORY_MAX_AGE) return cached.data

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const json: { prices: [number, number][] } = await res.json()

    // the chart needs seconds, in ascending order, with no duplicate times
    const seen = new Set<number>()
    const points: PricePoint[] = []
    for (const [ms, price] of json.prices) {
      const time = Math.floor(ms / 1000)
      if (seen.has(time)) continue
      seen.add(time)
      points.push({ time, value: price })
    }
    points.sort((a, b) => a.time - b.time)

    writeCache(key, points)
    return points
  } catch (err) {
    if (cached) return cached.data // old data beats an error banner
    throw err
  }
}