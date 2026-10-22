import { useCallback, useEffect, useState } from 'react'

export type AlertDirection = 'above' | 'below'

export interface PriceAlert {
  id: string
  coinId: string
  direction: AlertDirection
  target: number
  triggeredAt?: number
}

const KEY = 'pulse:alerts'

function load(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as PriceAlert[]) : []
  } catch {
    return []
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(alerts))
    } catch {
      // storage blocked or full, safe to ignore
    }
  }, [alerts])

  function addAlert(coinId: string, direction: AlertDirection, target: number) {
    setAlerts((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        coinId,
        direction,
        target,
      },
    ])
  }

  function removeAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const markTriggered = useCallback((ids: string[]) => {
    const now = Date.now()
    setAlerts((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, triggeredAt: now } : a)),
    )
  }, [])

  return { alerts, addAlert, removeAlert, markTriggered }
}