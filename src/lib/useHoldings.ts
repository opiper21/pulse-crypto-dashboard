import { useEffect, useState } from 'react'

export interface Holding {
  coinId: string
  amount: number
}

const KEY = 'pulse:holdings'

function load(): Holding[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Holding[]) : []
  } catch {
    return []
  }
}

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(holdings))
    } catch {
      // storage blocked or full, safe to ignore
    }
  }, [holdings])

  function addHolding(coinId: string, amount: number) {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.coinId === coinId)
      if (existing) {
        return prev.map((h) =>
          h.coinId === coinId ? { ...h, amount: h.amount + amount } : h,
        )
      }
      return [...prev, { coinId, amount }]
    })
  }

  function removeHolding(coinId: string) {
    setHoldings((prev) => prev.filter((h) => h.coinId !== coinId))
  }

  return { holdings, addHolding, removeHolding }
}