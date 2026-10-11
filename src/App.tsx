import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { fetchCoins, fetchHistory } from './lib/api'
import { useHoldings } from './lib/useHoldings'
import CoinCard from './components/CoinCard'
import PriceChart from './components/PriceChart'
import HoldingsPanel from './components/HoldingsPanel'

const DOT_SIZE = '28px 28px'
const SPOTLIGHT_MASK = 'radial-gradient(300px circle at var(--x) var(--y), black, transparent)'

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState('bitcoin')
  const { holdings, addHolding, removeHolding } = useHoldings()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['coins'],
    queryFn: fetchCoins,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const history = useQuery({
    queryKey: ['history', selectedId],
    queryFn: () => fetchHistory(selectedId),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const selectedCoin = data?.find((c) => c.id === selectedId)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = rootRef.current
    if (!el) return
    el.style.setProperty('--x', `${e.clientX}px`)
    el.style.setProperty('--y', `${e.clientY}px`)
  }

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      style={{ '--x': '50%', '--y': '30%' } as CSSProperties}
      className="relative min-h-screen overflow-hidden bg-[#070B14] text-[#EAF2EE]"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.14),transparent_60%)]" />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
          backgroundSize: DOT_SIZE,
        }}
      />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(125,211,252,0.95) 1.5px, transparent 1.5px)',
          backgroundSize: DOT_SIZE,
          maskImage: SPOTLIGHT_MASK,
          WebkitMaskImage: SPOTLIGHT_MASK,
        }}
      />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(420px circle at var(--x) var(--y), rgba(56,189,248,0.10), transparent 60%)',
        }}
      />

      <div className="relative z-10 p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#2FE6A6]">Pulse</h1>

        {isLoading && <p className="text-white/60">Loading prices…</p>}
        {isError && !data && <p className="text-red-400">Couldn't load prices.</p>}

        {data && selectedCoin && (
          <div className="mb-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{selectedCoin.name} · 7 days</h2>
                <span className="text-2xl font-bold">
                  ${selectedCoin.current_price.toLocaleString()}
                </span>
              </div>

              {history.isLoading && <p className="text-white/60">Loading chart…</p>}
              {history.isError && (
                <p className="text-red-400">Couldn't load the chart. Try again in a minute.</p>
              )}
              {history.data && (
                <PriceChart
                  data={history.data}
                  positive={(history.data.at(-1)?.value ?? 0) >= (history.data[0]?.value ?? 0)}
                />
              )}
            </motion.div>

            <HoldingsPanel
              coins={data}
              holdings={holdings}
              onAdd={addHolding}
              onRemove={removeHolding}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((coin, i) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              index={i}
              selected={coin.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}