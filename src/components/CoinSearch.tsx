import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchCoins } from '../lib/api'

interface CoinSearchProps {
  existingIds: string[]
  atLimit: boolean
  onPick: (id: string) => void
}

export default function CoinSearch({ existingIds, atLimit, onPick }: CoinSearchProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)

  // wait until you stop typing before calling the API
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 500)
    return () => clearTimeout(t)
  }, [query])

  const search = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchCoins(debounced),
    enabled: debounced.length >= 2,
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const showDropdown = open && query.trim().length >= 2
  const waiting = query.trim() !== debounced
  const busy = waiting || search.isFetching

  function handlePick(id: string) {
    onPick(id)
    setQuery('')
    setDebounced('')
    setOpen(false)
  }

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Search any coin…"
        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm outline-none backdrop-blur-xl focus:border-[#2FE6A6]"
      />

      {showDropdown && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-0 z-30 mt-2 w-full min-w-[260px] overflow-hidden rounded-xl border border-white/10 bg-[#0D1424] shadow-2xl"
        >
          {busy && <p className="px-3 py-2 text-sm text-white/50">Searching…</p>}

          {!busy && search.isError && (
            <p className="px-3 py-2 text-sm text-red-400">
              Search is busy, try again in a minute.
            </p>
          )}

          {!busy && search.data?.length === 0 && (
            <p className="px-3 py-2 text-sm text-white/50">No coins found.</p>
          )}

          {!busy &&
            search.data?.map((coin) => {
              const added = existingIds.includes(coin.id)
              const blocked = added || atLimit
              return (
                <button
                  key={coin.id}
                  disabled={blocked}
                  onClick={() => handlePick(coin.id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/[0.06] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <img src={coin.thumb} alt="" className="h-5 w-5 rounded-full" />
                  <span className="font-medium">{coin.name}</span>
                  <span className="text-xs uppercase text-white/50">{coin.symbol}</span>
                  <span className="ml-auto text-xs text-white/40">
                    {added
                      ? 'Added'
                      : atLimit
                        ? 'Limit reached'
                        : coin.market_cap_rank
                          ? `#${coin.market_cap_rank}`
                          : ''}
                  </span>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}