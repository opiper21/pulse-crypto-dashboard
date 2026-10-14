import { useEffect, useState } from 'react'

export interface Holding {
  coinId: string
  amount: number
  buyPrice?: number
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

  function addHolding(coinId: string, amount: number, buyPrice: number) {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.coinId === coinId)
      if (!existing) return [...prev, { coinId, amount, buyPrice }]

      const totalAmount = existing.amount + amount
      // adding more of the same coin averages the buy price
      const averagePrice =
        existing.buyPrice !== undefined
          ? (existing.amount * existing.buyPrice + amount * buyPrice) / totalAmount
          : undefined

      return prev.map((h) =>
        h.coinId === coinId ? { ...h, amount: totalAmount, buyPrice: averagePrice } : h,
      )
    })
  }

  function removeHolding(coinId: string) {
    setHoldings((prev) => prev.filter((h) => h.coinId !== coinId))
  }

  return { holdings, addHolding, removeHolding }
}