import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import './Wheel.css'

/** Row pitch, matching the design's 30 pt rows with 2 pt gaps. */
const ITEM = 32
/** The values are drawn three times so the wheel loops; it always settles back in the middle copy. */
const COPIES = 3

interface WheelProps {
  label: string
  values: string[]
  index: number
  onChange: (index: number) => void
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** An iOS-style looping picker wheel: scroll-snapped, and a spin button for keyboards and screen readers. */
export function Wheel({ label, values, index, onChange }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const indexRef = useRef(index)
  const settle = useRef(0)
  const count = values.length
  const middle = (i: number) => (count + i) * ITEM
  const [position, setPosition] = useState(count + index)

  useEffect(() => {
    indexRef.current = index
    const wheel = ref.current
    if (!wheel) return
    const current = Math.round(wheel.scrollTop / ITEM)
    if (current % count === index) return
    // Take the short way round, from wherever the wheel is now.
    const forward = (index - (current % count) + count) % count
    const target = (current + (forward <= count / 2 ? forward : forward - count)) * ITEM
    wheel.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [index, count])

  // A wheel inside a closed sheet has no size; jump to the value once it gets one.
  useEffect(() => {
    const wheel = ref.current
    if (!wheel) return
    const observer = new ResizeObserver(() => {
      wheel.scrollTop = (count + indexRef.current) * ITEM
    })
    observer.observe(wheel)
    return () => observer.disconnect()
  }, [count])

  useEffect(() => () => window.clearTimeout(settle.current), [])

  const onScroll = () => {
    const wheel = ref.current
    if (!wheel) return
    setPosition(wheel.scrollTop / ITEM)
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const settled = Math.round(wheel.scrollTop / ITEM) % count
      // Recentre on the middle copy so there is always room to keep turning.
      if (Math.abs(wheel.scrollTop - middle(settled)) > 1) wheel.scrollTop = middle(settled)
      if (settled !== indexRef.current) onChange(settled)
    }, 120)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowUp: 1, ArrowDown: -1 }[event.key]
    const next = step !== undefined ? index + step : { Home: 0, End: count - 1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange((next + count) % count)
  }

  return (
    <div
      ref={ref}
      className="wheel"
      // A wheel, not a text field, that behaves as a spin button.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={Number(values[index])}
      aria-valuemin={Number(values[0])}
      aria-valuemax={Number(values.at(-1))}
      aria-valuetext={values[index]}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        const item = (event.target as HTMLElement).closest<HTMLElement>('[data-index]')
        if (item) onChange(Number(item.dataset.index) % count)
      }}
    >
      {Array.from({ length: COPIES * count }, (_, i) => {
        const value = values[i % count]
        const distance = Math.abs(i - position)
        return (
          <div
            key={i}
            className="wheel-item"
            data-index={i}
            data-distance={distance < 0.5 ? 0 : distance < 1.5 ? 1 : 2}
            aria-hidden="true"
          >
            {value}
          </div>
        )
      })}
    </div>
  )
}
