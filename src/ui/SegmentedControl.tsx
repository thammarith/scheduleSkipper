import { useId, type CSSProperties, type ReactNode } from 'react'
import './SegmentedControl.css'

export interface Segment<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  /** Sets `data-tone` so the selected icon can take the tone's colour. */
  tone?: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  segments: Segment<T>[]
  value: T
  onChange: (value: T) => void
}

/** An iOS segmented control with a sliding thumb. Native radios bring arrow keys and focus handling. */
export function SegmentedControl<T extends string>({ label, segments, value, onChange }: SegmentedControlProps<T>) {
  const name = useId()
  const selected = segments.findIndex((s) => s.value === value)
  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      style={{ '--count': segments.length, '--index': selected } as CSSProperties}
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {segments.map((segment) => (
        <label key={segment.value} className="segmented-option" data-tone={segment.tone}>
          <input
            type="radio"
            className="visually-hidden"
            name={name}
            value={segment.value}
            checked={segment.value === value}
            onChange={() => onChange(segment.value)}
          />
          {segment.icon}
          {segment.label}
        </label>
      ))}
    </div>
  )
}
