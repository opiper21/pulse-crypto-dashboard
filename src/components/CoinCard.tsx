import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Coin } from '../lib/api'

interface CoinCardProps {
  coin: Coin
  index: number
  selected: boolean
  onSelect: (id: string) => void
  onRemove?: (id: string) => void
}

export default function CoinCard({ coin, index, selected, onSelect, onRemove }: CoinCardProps) {
  const [prevPrice, setPrevPrice] = useState(coin.current_price)
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)

  if (coin.current_price !== prevPrice) {
    setDirection(coin.current_price > prevPrice ? 'up' : 'down')
    setPrevPrice(coin.current_price)
  }

  const flashColor =
    direction === 'up' ? '#2FE6A6' : direction === 'down' ? '#F87171' : '#EAF2EE'

  const isUp = coin.price_change_percentage_24h >= 0

  return (
    <motion.div
      onClick={() => onSelect(coin.id)}
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.08, duration: 0.5, ease: 'easeOut' },
      }}
      whileHover={{
        y: -6,
        transition: { type: 'spring', stiffness: 500, damping: 30, delay: 0 },
      }}
      className={`relative cursor-pointer rounded-2xl border bg-white/[0.07] p-5 backdrop-blur-xl transition-colors duration-150 hover:border-[#2FE6A6]/40 ${
        selected ? 'border-[#2FE6A6]/70' : 'border-white/10'
      }`}
    >
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(coin.id)
          }}
          aria-label={`Remove ${coin.name} from watchlist`}
          className="absolute right-3 top-3 cursor-pointer text-xs text-white/40 transition hover:text-red-400"
        >
          ✕
        </button>
      )}

      <div className="mb-4 flex items-center gap-3">
        <img src={coin.image} alt={coin.name} className="h-8 w-8" />
        <span className="font-semibold">{coin.name}</span>
        <span className="text-xs uppercase text-white/50">{coin.symbol}</span>
      </div>

      <motion.p
        key={coin.current_price}
        initial={{ color: flashColor, scale: 1.06 }}
        animate={{ color: '#EAF2EE', scale: 1 }}
        transition={{ duration: 1.2 }}
        className="origin-left text-2xl font-bold"
      >
        ${coin.current_price.toLocaleString()}
      </motion.p>

      <p className={isUp ? 'text-[#2FE6A6]' : 'text-red-400'}>
        {coin.price_change_percentage_24h.toFixed(2)}% (24h)
      </p>
    </motion.div>
  )
}