import { STEP } from '../../utils/availability'
import { clock, parseClock } from '../../utils/format'

interface TimeFieldProps {
  label: string
  tag?: string
  /** The input's `HH:MM` value, or empty. */
  value: string
  onChange: (value: string) => void
}

export function TimeField({ label, tag, value, onChange }: TimeFieldProps) {
  // Typed minutes off the 15-minute step snap down once the field loses focus.
  const snap = () => {
    const minutes = parseClock(value)
    if (minutes !== null && clock(minutes) !== value) onChange(clock(minutes))
  }
  return (
    <label className="picker">
      <span className="picker-label caption1 semibold secondary caps">
        <span>{label}</span>
        {tag && <span className="caption2 semibold">{tag}</span>}
      </span>
      <input
        type="time"
        className="time-input"
        step={STEP * 60}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={snap}
      />
    </label>
  )
}
