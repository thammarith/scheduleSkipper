import type { TimeRange } from '../interfaces/availability'
import type { IsoDate, Plan } from '../interfaces/plan'
import { DAY, STEP } from './availability'
import { dayLabel } from './date'

const pad = (n: number) => String(n).padStart(2, '0')

/** "18:00", wrapping past midnight ("26:00" reads "02:00"). */
export const clock = (minutes: number) => {
  const m = minutes % DAY
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

/** Minutes from midnight for a time input's `HH:MM` value, down to the 15-minute step; null when empty. */
export function parseClock(value: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  return match ? Math.floor((Number(match[1]) * 60 + Number(match[2])) / STEP) * STEP : null
}

/** "All day", "From 20:00" or "18:00 – 23:00". */
export function rangeLabel(range: TimeRange): string {
  if (range.kind === 'allDay') return 'All day'
  if (range.end === DAY) return `From ${clock(range.start)}`
  return `${clock(range.start)} – ${clock(range.end)}`
}

/** The same as `rangeLabel`, worded for screen readers: "all day", "from 20:00", "18:00 to 23:00". */
export function rangeSpoken(range: TimeRange): string {
  if (range.kind === 'allDay') return 'all day'
  if (range.end === DAY) return `from ${clock(range.start)}`
  return `${clock(range.start)} to ${clock(range.end)}${endsNextDay(range) ? ' the next day' : ''}`
}

export const endsNextDay = (range: TimeRange) => range.kind === 'span' && range.end > DAY

export const pluralDays = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

/** "6 days · Mon 19, Tue 20, Sat 24 +3", for dates already unique and in date order. */
export function summary(dates: IsoDate[]): string {
  if (dates.length === 0) return 'No days yet'
  const shown = dates.slice(0, 3).map(dayLabel).join(', ')
  return `${pluralDays(dates.length)} · ${shown}${dates.length > 3 ? ` +${dates.length - 3}` : ''}`
}

const pluralSlots = (n: number) => `${n} ${n === 1 ? 'slot' : 'slots'}`

/** "2 slots · 18:00 – 20:00, 19:00 – 21:00 · 1 day differs", or why there are none. */
export function slotsSummary(plan: Plan, short = false): string {
  if (plan.slots.length === 0) return 'None · guests enter their own times'
  if (short) return `${pluralSlots(plan.slots.length)} · every possible day`
  const differs = Object.keys(plan.overrides).length
  return [
    pluralSlots(plan.slots.length),
    plan.slots.map(rangeLabel).join(', '),
    differs > 0 && `${pluralDays(differs)} ${differs === 1 ? 'differs' : 'differ'}`,
  ]
    .filter(Boolean)
    .join(' · ')
}
