import type { IsoDate } from './plan'

/**
 * A time of day. A span is minutes from midnight in 15-minute steps; `end` past 24:00 means it ends
 * the next day. All day is its own kind rather than 00:00–24:00.
 */
export type TimeRange = { kind: 'allDay' } | { kind: 'span'; start: number; end: number }

export type Mode = 'free' | 'busy'

/** `primary` is what the mode says (free or busy times); `ifNeeded` is "I can be free on these days". */
export type ListKey = 'primary' | 'ifNeeded'

export interface Group {
  range: TimeRange
  dates: IsoDate[]
}

export interface Availability {
  mode: Mode
  primary: Group[]
  ifNeeded: Group[]
}

export type SlotState = 'free' | 'ifNeeded' | 'busy'

/** Each list's colour: the primary list takes the mode's tone, the "can be free" list is always amber. */
export type Tone = 'free' | 'busy' | 'ifNeeded'
