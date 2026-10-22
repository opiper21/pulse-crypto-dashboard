import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Coin } from '../lib/api'
import type { AlertDirection, PriceAlert } from '../lib/useAlerts'
import { formatUsd } from '../lib/format'

interface AlertsPanelProps {
  coins: Coin[]
  alerts: PriceAlert[]
  onAdd: (coinId: string, direction: AlertDirection, target: number) => void
  onRemove: (id: string) => void
}

const QUICK_PERCENTS = [0.05, 0.1, 0.5]

export default function AlertsPanel({ coins, alerts, onAdd, onRemove }: AlertsPanelProps) {
  const [coinId, setCoinId] = useState(coins[0]?.id ?? '')
  const [direction, setDirection] = useState<AlertDirection>('above')
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')

  const active = coins.find((c) => c.id === coinId) ?? coins[0]

  // fills the target box with the current price moved up or down by a small percent
  function quickSet(percent: number) {
    if (!active) return
    const factor = direction === 'above' ? 1 + percent / 100 : 1 - percent / 100
    setTarget(String(Number((active.current_price * factor).toPrecision(6))))
    setError('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const n = parseFloat(target)

    if (!active || !Number.isFinite(n) || n <= 0) {
      setError('Enter a valid target price.')
      return
    }
    if (direction === 'above' && n <= active.current_price) {
      setError(`Target must be above the current price (${formatUsd(active.current_price)}).`)
      return
    }
    if (direction === 'below' && n >= active.current_price) {
      setError(`Target must be below the current price (${formatUsd(active.current_price)}).`)
      return
    }

    onAdd(active.id, direction, n)
    setTarget('')
    setError('')
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
       <div className="mb-5">
        <p className="text-sm text-white/60">Price alerts</p>
        <p className="mt-1 text-xs text-white/40">
          Get a banner when a coin crosses your target. Checked on every price update while this page is open.
        </p>
       </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-[380px] lg:shrink-0">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
            <select
              value={active?.id ?? ''}
              onChange={(e) => setCoinId(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="rounded-xl border border-white/10 bg-[#0D1424] px-3 py-2 text-sm outline-none focus:border-[#2FE6A6]"
            >
              {coins.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as AlertDirection)}
              style={{ colorScheme: 'dark' }}
              className="rounded-xl border border-white/10 bg-[#0D1424] px-3 py-2 text-sm outline-none focus:border-[#2FE6A6]"
            >
              <option value="above">Goes above</option>
              <option value="below">Goes below</option>
            </select>

            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                active ? `Target (now ${formatUsd(active.current_price)})` : 'Target price'
              }
              className="col-span-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm outline-none focus:border-[#2FE6A6]"
            />

            <button
              type="submit"
              className="col-span-2 cursor-pointer rounded-xl bg-[#2FE6A6] py-2 text-sm font-semibold text-[#052018] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,230,166,0.35)]"
            >
              Set alert
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40">Quick target</span>
            {QUICK_PERCENTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => quickSet(p)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70 transition hover:border-[#2FE6A6]/40 hover:text-white"
              >
                {direction === 'above' ? '+' : '-'}
                {p}%
              </button>
            ))}
          </div>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs text-white/40">Your alerts</p>

                   {alerts.length === 0 && (
            <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center text-sm text-white/40">
              No alerts yet. Set one using the form.
            </div>
          )}

          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {alerts.map((alert) => {
                const coin = coins.find((c) => c.id === alert.coinId)
                const done = alert.triggeredAt !== undefined

                return (
                  <motion.li
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                      done
                        ? 'border-[#2FE6A6]/40 bg-[#2FE6A6]/10'
                        : 'border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    <span className="font-medium">{coin?.name ?? alert.coinId}</span>
                    <span className="text-white/60">
                      {alert.direction} {formatUsd(alert.target)}
                    </span>
                    <span
                      className={
                        done
                          ? 'text-xs font-semibold text-[#2FE6A6]'
                          : 'animate-pulse text-xs text-white/50'
                      }
                    >
                      {done ? 'Triggered ✓' : 'Watching…'}
                    </span>
                    <button
                      onClick={() => onRemove(alert.id)}
                      aria-label="Remove alert"
                      className="cursor-pointer text-xs text-white/40 transition hover:text-red-400"
                    >
                      ✕
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  )
}