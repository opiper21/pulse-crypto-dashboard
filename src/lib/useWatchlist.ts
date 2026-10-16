import { useEffect, useState } from 'react'
import { DEFAULT_COIN_IDS } from './api'

const KEY = 'pulse:extra-coins'
export const MAX_EXTRA_COINS = 6

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((v): v is string => typeof v === 'string')
      .slice(0, MAX_EXTRA_COINS)
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [extraIds, setExtraIds] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(extraIds))
    } catch {
      // storage blocked or full, safe to ignore
    }
  }, [extraIds])

  const ids = [...DEFAULT_COIN_IDS, ...extraIds]
  const atLimit = extraIds.length >= MAX_EXTRA_COINS

  function addCoin(id: string) {
    setExtraIds((prev) => {
      if (DEFAULT_COIN_IDS.includes(id) || prev.includes(id)) return prev
      if (prev.length >= MAX_EXTRA_COINS) return prev
      return [...prev, id]
    })
  }

  function removeCoin(id: string) {
    setExtraIds((prev) => prev.filter((x) => x !== id))
  }

  return { ids, extraIds, atLimit, addCoin, removeCoin }
}