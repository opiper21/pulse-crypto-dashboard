import { useEffect, useState } from 'react'

interface UpdateStatusProps {
  updatedAt: number
  fetching: boolean
  failed: boolean
  simulated: boolean
  onRefresh: () => void
}

export default function UpdateStatus({
  updatedAt,
  fetching,
  failed,
  simulated,
  onRefresh,
}: UpdateStatusProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const seconds = updatedAt > 0 ? Math.max(0, Math.round((now - updatedAt) / 1000)) : 0

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
      <span className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            failed ? 'bg-red-400' : 'animate-pulse bg-[#2FE6A6]'
          }`}
        />
        {failed
          ? "Couldn't refresh, showing last prices"
          : fetching
            ? 'Updating…'
            : `Updated ${seconds}s ago`}
      </span>
      <button
        onClick={onRefresh}
        disabled={fetching}
        className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-white/70 transition hover:border-[#2FE6A6]/40 hover:text-white disabled:cursor-default disabled:opacity-50"
      >
        Refresh now
      </button>
      {simulated && (
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-300">
          Simulated prices
        </span>
      )}
    </div>
  )
}