import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

const format = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    node.textContent = format(prev.current)

    const controls = animate(prev.current, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = format(v)
      },
      onComplete: () => {
        node.textContent = format(value)
      },
    })

    prev.current = value
    return () => controls.stop()
  }, [value])

  return <span ref={ref} />
}