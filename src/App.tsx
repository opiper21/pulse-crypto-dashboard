import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchCoins, fetchHistory } from './lib/api'
import { useHoldings } from './lib/useHoldings'
import { useWatchlist } from './lib/useWatchlist'
import { useAlerts } from './lib/useAlerts'
import { formatUsd } from './lib/format'
import CoinCard from './components/CoinCard'
import CoinSearch from './components/CoinSearch'
import PriceChart from './components/PriceChart'
import HoldingsPanel from './components/HoldingsPanel'
import AlertsPanel from './components/AlertsPanel'
import AlertToasts from './components/AlertToasts'
import type { Toast } from './components/AlertToasts'
import CardControls from './components/CardControls'
import type { FilterKey, SortKey } from './components/CardControls'
import UpdateStatus from './components/UpdateStatus'
import SimulateControls from './components/SimulateControls'

const DOT_SIZE = '28px 28px'
const SPOTLIGHT_MASK = 'radial-gradient(300px circle at var(--x) var(--y), black, transparent)'

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState('bitcoin')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [sortBy, setSortBy] = useState<SortKey>('default')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [simFactor, setSimFactor] = useState(1) // 1 = real prices, resets on refresh
  const { holdings, addHolding, removeHolding } = useHoldings()
  const { ids, extraIds, atLimit, addCoin, removeCoin } = useWatchlist()
  const { alerts, addAlert, removeAlert, markTriggered } = useAlerts()

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['coins', ids],
    queryFn: () => fetchCoins(ids),
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: keepPreviousData,
  })

  // everything on screen uses these prices, which are the real ones unless a simulation is on
  const displayData = useMemo(
    () => data?.map((c) => ({ ...c, current_price: c.current_price * simFactor })),
    [data, simFactor],
  )
  const simulated = Math.abs(simFactor - 1) > 1e-9

  // until a newly added coin's price arrives, keep showing the current one
  const selectedCoin = displayData?.find((c) => c.id === selectedId) ?? displayData?.[0]
  const activeId = selectedCoin?.id

  const history = useQuery({
    queryKey: ['history', activeId],
    queryFn: () => fetchHistory(activeId as string),
    enabled: Boolean(activeId),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // every time prices change, check whether any alert has been crossed
  useEffect(() => {
    if (!displayData) return

    const fired = alerts.filter((a) => {
      if (a.triggeredAt !== undefined) return false
      const coin = displayData.find((c) => c.id === a.coinId)
      if (!coin) return false
      return a.direction === 'above'
        ? coin.current_price >= a.target
        : coin.current_price <= a.target
    })

    if (fired.length === 0) return

    markTriggered(fired.map((a) => a.id))
    setToasts((prev) => [
      ...prev,
      ...fired.map((a) => {
        const coin = displayData.find((c) => c.id === a.coinId)
        return {
          id: `${a.id}-toast`,
          message: `${coin?.name ?? a.coinId} went ${a.direction} ${formatUsd(a.target)}. Now ${formatUsd(coin?.current_price ?? a.target)}.`,
        }
      }),
    ])
  }, [displayData, alerts, markTriggered])

  // apply the filter first, then the sort (filter makes a new list, so sorting it is safe)
  const visibleCoins = (displayData ?? [])
    .filter((c) => {
      if (filter === 'gainers') return c.price_change_percentage_24h >= 0
      if (filter === 'losers') return c.price_change_percentage_24h < 0
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.current_price - a.current_price
      if (sortBy === 'change')
        return b.price_change_percentage_24h - a.price_change_percentage_24h
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  function handlePick(id: string) {
    addCoin(id)
    setSelectedId(id)
  }

  function handleRemove(id: string) {
    removeCoin(id)
    if (selectedId === id) setSelectedId('bitcoin')
  }

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
      <AlertToasts toasts={toasts} onDismiss={dismissToast} />

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
        <div className="relative z-20 mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2FE6A6]">Pulse</h1>
            <div className="mt-1">
              <UpdateStatus
                updatedAt={dataUpdatedAt}
                fetching={isFetching}
                failed={isError}
                simulated={simulated}
                onRefresh={() => refetch()}
              />
            </div>
          </div>
          <CoinSearch existingIds={ids} atLimit={atLimit} onPick={handlePick} />
        </div>

        {isLoading && <p className="text-white/60">Loading prices…</p>}
        {isError && !data && <p className="text-red-400">Couldn't load prices.</p>}

        {displayData && selectedCoin && (
          <div className="mb-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <motion.div
              key={selectedCoin.id}
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
              coins={displayData}
              holdings={holdings}
              onAdd={addHolding}
              onRemove={removeHolding}
            />
          </div>
        )}

        {displayData && (
          <div className="mb-6">
            <AlertsPanel
              coins={displayData}
              alerts={alerts}
              onAdd={addAlert}
              onRemove={removeAlert}
            />
            <SimulateControls
              factor={simFactor}
              onNudge={(percent) => setSimFactor((f) => f * (1 + percent / 100))}
              onReset={() => setSimFactor(1)}
            />
          </div>
        )}

        {displayData && (
          <CardControls
            sortBy={sortBy}
            filter={filter}
            onSort={setSortBy}
            onFilter={setFilter}
          />
        )}

        {displayData && visibleCoins.length === 0 && (
          <p className="mb-4 text-sm text-white/50">No coins match this filter right now.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCoins.map((coin, i) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              index={i}
              selected={coin.id === selectedCoin?.id}
              onSelect={setSelectedId}
              onRemove={extraIds.includes(coin.id) ? handleRemove : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}