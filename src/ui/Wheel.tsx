import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import './Wheel.css'

/** Row pitch, matching the design's 30 pt rows with 2 pt gaps. */
const ITEM = 32

interface WheelProps {
  label: string
  values: string[]
  index: number
  onChange: (index: number) => void
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** An iOS-style picker wheel: scroll-snapped, and a spin button for keyboards and screen readers. */
export function Wheel({ label, values, index, onChange }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const indexRef = useRef(index)
  const settle = useRef(0)
  const [position, setPosition] = useState(index)

  useEffect(() => {
    indexRef.current = index
    const wheel = ref.current
    if (wheel && Math.abs(wheel.scrollTop - index * ITEM) > 1) {
      wheel.scrollTo({ top: index * ITEM, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [index])

  // A wheel inside a closed sheet has no size; jump to the value once it gets one.
  useEffect(() => {
    const wheel = ref.current
    if (!wheel) return
    const observer = new ResizeObserver(() => {
      wheel.scrollTop = indexRef.current * ITEM
    })
    observer.observe(wheel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => window.clearTimeout(settle.current), [])

  const clamp = (i: number) => Math.min(values.length - 1, Math.max(0, i))

  const onScroll = () => {
    const wheel = ref.current
    if (!wheel) return
    setPosition(wheel.scrollTop / ITEM)
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const settled = clamp(Math.round(wheel.scrollTop / ITEM))
      if (settled !== indexRef.current) onChange(settled)
    }, 120)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const next = { ArrowUp: index + 1, ArrowDown: index - 1, Home: 0, End: values.length - 1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange(clamp(next))
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
        if (item) onChange(Number(item.dataset.index))
      }}
    >
      {values.map((value, i) => {
        const distance = Math.abs(i - position)
        return (
          <div
            key={value}
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
