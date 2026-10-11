import { useEffect, useRef } from 'react'
import { createChart, AreaSeries, ColorType } from 'lightweight-charts'
import type { UTCTimestamp } from 'lightweight-charts'
import type { PricePoint } from '../lib/api'

interface PriceChartProps {
  data: PricePoint[]
  positive: boolean
}

export default function PriceChart({ data, positive }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const line = positive ? '#2FE6A6' : '#F87171'
    const top = positive ? 'rgba(47,230,166,0.35)' : 'rgba(248,113,113,0.35)'
    const bottom = positive ? 'rgba(47,230,166,0)' : 'rgba(248,113,113,0)'

    const chart = createChart(el, {
      width: el.clientWidth,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(234,242,238,0.6)',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: line,
      topColor: top,
      bottomColor: bottom,
      lineWidth: 2,
    })

    series.setData(data.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })))
    chart.timeScale().fitContent()

    const onResize = () => chart.applyOptions({ width: el.clientWidth })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      chart.remove()
    }
  }, [data, positive])

  return <div ref={containerRef} className="w-full" />
}