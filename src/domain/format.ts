import { DAY, type TimeRange } from './availability'
import { dayLabel, type IsoDate } from './plan'

const pad = (n: number) => String(n).padStart(2, '0')

/** "18:00", wrapping past midnight ("26:00" reads "02:00"). */
export const clock = (minutes: number) => {
  const m = minutes % DAY
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
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
