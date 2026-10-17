import { Icon } from '../../ui/Icon'
import type { Tone } from './tone'

/** The small ✓, ✕ or ? that marks a day as belonging to a list. Takes the tone's colour. */
export function Mark({ tone, size }: { tone: Tone; size: number }) {
  if (tone === 'maybe') {
    return (
      <span className="mark-maybe" style={{ fontSize: size, lineHeight: `${size + 1}px` }} aria-hidden="true">
        ?
      </span>
    )
  }
  return <Icon name={tone === 'free' ? 'check' : 'xmark'} size={size} stroke={3} />
}

export function Badge({ tone }: { tone: Tone }) {
  return (
    <span className="badge" data-tone={tone} aria-hidden="true">
      <Mark tone={tone} size={36 * 0.42} />
    </span>
  )
}
