import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Coin } from '../lib/api'
import type { Holding } from '../lib/useHoldings'
import { COIN_COLORS, FALLBACK_COLOR } from '../lib/colors'
import AnimatedNumber from './AnimatedNumber'
import AllocationDonut from './AllocationDonut'

interface HoldingsPanelProps {
  coins: Coin[]
  holdings: Holding[]
  onAdd: (coinId: string, amount: number, buyPrice: number) => void
  onRemove: (coinId: string) => void
}

interface Row {
  holding: Holding
  coin: Coin
  value: number
  cost?: number
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const signedUsd = (n: number) => `${n >= 0 ? '+' : '-'}${usd(Math.abs(n))}`
const signedPct = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(2)}%`

export default function HoldingsPanel({ coins, holdings, onAdd, onRemove }: HoldingsPanelProps) {
  const [coinId, setCoinId] = useState(coins[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')

  const rows: Row[] = []
  for (const holding of holdings) {
    const coin = coins.find((c) => c.id === holding.coinId)
    if (!coin) continue
    rows.push({
      holding,
      coin,
      value: holding.amount * coin.current_price,
      cost: holding.buyPrice !== undefined ? holding.amount * holding.buyPrice : undefined,
    })
  }

  const total = rows.reduce((sum, r) => sum + r.value, 0)

  const tracked = rows.filter((r) => r.cost !== undefined)
  const trackedCost = tracked.reduce((sum, r) => sum + (r.cost ?? 0), 0)
  const trackedValue = tracked.reduce((sum, r) => sum + r.value, 0)
  const totalPnl = trackedValue - trackedCost
  const totalPct = trackedCost > 0 ? (totalPnl / trackedCost) * 100 : 0
  const totalUp = Math.round(totalPnl * 100) >= 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const n = parseFloat(amount)
    const coin = coins.find((c) => c.id === coinId)
    if (!coin || !Number.isFinite(n) || n <= 0) return

    let buy = coin.current_price
    if (buyPrice.trim() !== '') {
      buy = parseFloat(buyPrice)
      if (!Number.isFinite(buy) || buy <= 0) return
    }

    onAdd(coinId, n, buy)
    setAmount('')
    setBuyPrice('')
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">My holdings</p>
          <p className="text-4xl font-bold text-[#2FE6A6]">
            <AnimatedNumber value={total} />
          </p>
          {tracked.length > 0 && (
            <p
              className={`mt-1 text-sm font-semibold ${
                totalUp ? 'text-[#2FE6A6]' : 'text-red-400'
              }`}
            >
              {totalUp ? '+' : '-'}
              <AnimatedNumber value={Math.abs(totalPnl)} /> ({signedPct(totalPct)})
            </p>
          )}
        </div>
        <AllocationDonut slices={rows.map((r) => ({ id: r.coin.id, value: r.value }))} />
      </div>

      <form onSubmit={handleSubmit} className="mb-5 grid grid-cols-2 gap-2">
        <select
          value={coinId}
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
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm outline-none focus:border-[#2FE6A6]"
        />
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Buy price in USD (blank = today's price)"
          className="col-span-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm outline-none focus:border-[#2FE6A6]"
        />
        <button
          type="submit"
          className="col-span-2 cursor-pointer rounded-xl bg-[#2FE6A6] py-2 text-sm font-semibold text-[#052018] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,230,166,0.35)]"
        >
          Add holding
        </button>
      </form>

      {rows.length === 0 && (
        <p className="text-sm text-white/50">No holdings yet. Add a coin above.</p>
      )}

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {rows.map(({ holding, coin, value, cost }) => {
            const pnl = cost !== undefined ? value - cost : undefined
            const pnlPct =
              cost !== undefined && cost > 0 ? ((value - cost) / cost) * 100 : undefined
            const rowUp = pnl !== undefined && Math.round(pnl * 100) >= 0

            return (
              <motion.li
                key={holding.coinId}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="h-6 w-6" />
                  <div>
                    <p className="text-sm font-medium">{coin.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-white/50">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COIN_COLORS[coin.id] ?? FALLBACK_COLOR }}
                      />
                      {holding.amount} {coin.symbol.toUpperCase()} ·{' '}
                      {total > 0 ? Math.round((value / total) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{usd(value)}</p>
                    {pnl !== undefined && pnlPct !== undefined && (
                      <p className={`text-xs ${rowUp ? 'text-[#2FE6A6]' : 'text-red-400'}`}>
                        {signedUsd(pnl)} ({signedPct(pnlPct)})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(holding.coinId)}
                    aria-label={`Remove ${coin.name}`}
                    className="cursor-pointer text-xs text-white/40 transition hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}