import type { ReactNode } from 'react'

export type SortKey = 'default' | 'price' | 'change' | 'name'
export type FilterKey = 'all' | 'gainers' | 'losers'

interface CardControlsProps {
  sortBy: SortKey
  filter: FilterKey
  onSort: (key: SortKey) => void
  onFilter: (key: FilterKey) => void
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: '24h change' },
  { key: 'name', label: 'A-Z' },
]

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers', label: 'Losers' },
]

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? 'border-[#2FE6A6] bg-[#2FE6A6] font-semibold text-[#052018]'
          : 'border-white/10 bg-white/[0.06] text-white/70 hover:border-[#2FE6A6]/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function CardControls({ sortBy, filter, onSort, onFilter }: CardControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/50">Sort</span>
        {SORTS.map((s) => (
          <Pill key={s.key} active={sortBy === s.key} onClick={() => onSort(s.key)}>
            {s.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/50">Show</span>
        {FILTERS.map((f) => (
          <Pill key={f.key} active={filter === f.key} onClick={() => onFilter(f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>
    </div>
  )
}