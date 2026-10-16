import { motion } from 'framer-motion'
import { coinColor } from '../lib/colors'

interface Slice {
  id: string
  value: number
}

interface AllocationDonutProps {
  slices: Slice[]
  size?: number
}

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3

export default function AllocationDonut({ slices, size = 96 }: AllocationDonutProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  const arcs = slices.reduce<{ id: string; length: number; offset: number }[]>(
    (acc, s) => {
      const length = total > 0 ? (s.value / total) * CIRCUMFERENCE : 0
      const prev = acc[acc.length - 1]
      const offset = prev ? prev.offset - prev.length : 0
      acc.push({ id: s.id, length, offset })
      return acc
    },
    [],
  )

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Portfolio allocation by coin"
      className="shrink-0"
    >
      <g transform="rotate(-90 50 50)">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        {arcs.map((arc) => {
          const visible = Math.max(arc.length - GAP, 0)
          return (
            <motion.circle
              key={arc.id}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={coinColor(arc.id)}
              strokeWidth="12"
              initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: arc.offset }}
              animate={{
                strokeDasharray: `${visible} ${CIRCUMFERENCE - visible}`,
                strokeDashoffset: arc.offset,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )
        })}
      </g>
    </svg>
  )
}