interface SimulateControlsProps {
  factor: number
  onNudge: (percent: number) => void
  onReset: () => void
}

export default function SimulateControls({ factor, onNudge, onReset }: SimulateControlsProps) {
  const active = Math.abs(factor - 1) > 1e-9
  const pct = ((factor - 1) * 100).toFixed(2)

  const buttonClass =
    'cursor-pointer rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-white/70 transition hover:border-[#2FE6A6]/40 hover:text-white'

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-white/40">Test alerts instantly</span>
      <button onClick={() => onNudge(0.3)} className={buttonClass}>
        Simulate +0.3%
      </button>
      <button onClick={() => onNudge(-0.3)} className={buttonClass}>
        Simulate -0.3%
      </button>
      {active && (
        <>
          <button onClick={onReset} className={buttonClass}>
            Reset
          </button>
          <span className="text-amber-300">
            Simulated: {factor > 1 ? '+' : ''}
            {pct}% vs real prices
          </span>
        </>
      )}
    </div>
  )
}