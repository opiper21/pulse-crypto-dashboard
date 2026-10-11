import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Coin } from '../lib/api'
import type { Holding } from '../lib/useHoldings'
import AnimatedNumber from './AnimatedNumber'

interface HoldingsPanelProps {
  coins: Coin[]
  holdings: Holding[]
  onAdd: (coinId: string, amount: number) => void
  onRemove: (coinId: string) => void
}

interface Row {
  holding: Holding
  coin: Coin
  value: number
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function HoldingsPanel({ coins, holdings, onAdd, onRemove }: HoldingsPanelProps) {
  const [coinId, setCoinId] = useState(coins[0]?.id ?? '')
  const [amount, setAmount] = useState('')

  const rows: Row[] = []
  for (const holding of holdings) {
    const coin = coins.find((c) => c.id === holding.coinId)
    if (coin) rows.push({ holding, coin, value: holding.amount * coin.current_price })
  }

  const total = rows.reduce((sum, r) => sum + r.value, 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const n = parseFloat(amount)
    if (!coinId || !Number.isFinite(n) || n <= 0) return
    onAdd(coinId, n)
    setAmount('')
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
      <p className="text-sm text-white/60">My holdings</p>
      <p className="mb-5 text-4xl font-bold text-[#2FE6A6]">
        <AnimatedNumber value={total} />
      </p>

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
          {rows.map(({ holding, coin, value }) => (
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
                  <p className="text-xs text-white/50">
                    {holding.amount} {coin.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{usd(value)}</span>
                <button
                  onClick={() => onRemove(holding.coinId)}
                  aria-label={`Remove ${coin.name}`}
                  className="cursor-pointer text-xs text-white/40 transition hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}