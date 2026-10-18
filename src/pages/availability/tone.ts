import type { ListKey, Mode, TimeRange, Tone } from '../../interfaces/availability'
import { DAY } from '../../utils/availability'
import type { IconName } from '../../ui/Icon'

export const toneOf = (mode: Mode, list: ListKey): Tone => (list === 'ifNeeded' ? 'ifNeeded' : mode)

export const LIST_TITLE: Record<Tone, string> = {
  free: 'I’m free on these days',
  busy: 'I’m busy on these days',
  ifNeeded: 'I can be free on these days',
}

/** How a tone reads inside a sentence: "your free time", "your “can be free” time". */
export const TONE_PHRASE: Record<Tone, string> = { free: 'free', busy: 'busy', ifNeeded: '“can be free”' }

export const TONE_NAME: Record<Tone, string> = { free: 'Free', busy: 'Busy', ifNeeded: 'Can be free' }

export function rangeIcon(range: TimeRange): IconName {
  if (range.kind === 'allDay') return 'clock'
  if (range.end > DAY || range.start >= 20 * 60) return 'moon'
  if (range.start < 17 * 60) return 'sun'
  return 'sunset'
}
