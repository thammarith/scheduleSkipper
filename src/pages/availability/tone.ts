import { DAY, type ListKey, type Mode, type TimeRange } from '../../domain/availability'
import type { IconName } from '../../ui/Icon'

/** Each list's colour: the primary list takes the mode's tone, the "can be free" list is always amber. */
export type Tone = 'free' | 'busy' | 'maybe'

export const toneOf = (mode: Mode, list: ListKey): Tone => (list === 'maybe' ? 'maybe' : mode)

export const LIST_TITLE: Record<Tone, string> = {
  free: 'I’m free on these days',
  busy: 'I’m busy on these days',
  maybe: 'I can be free on these days',
}

export const TONE_NAME: Record<Tone, string> = { free: 'Free', busy: 'Busy', maybe: 'Can be free' }

export function rangeIcon(range: TimeRange): IconName {
  if (range.kind === 'allDay') return 'clock'
  if (range.end > DAY || range.start >= 20 * 60) return 'moon'
  if (range.start < 17 * 60) return 'sun'
  return 'sunset'
}
