import type { IsoDate, Plan } from '../interfaces/plan'

const DAY_MS = 86_400_000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

const toUtc = (date: IsoDate) => Date.parse(`${date}T00:00:00Z`)

export const addDays = (date: IsoDate, days: number): IsoDate =>
  new Date(toUtc(date) + days * DAY_MS).toISOString().slice(0, 10)

export function planDates(plan: Plan): IsoDate[] {
  const dates: IsoDate[] = []
  for (let date = plan.start; date <= plan.end; date = addDays(date, 1)) dates.push(date)
  return dates
}

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (date: IsoDate) => new Date(toUtc(date)).getUTCDay()

/** 0 = Monday … 6 = Sunday, for Monday-first grids. */
export const weekdayMondayFirst = (date: IsoDate) => (weekday(date) + 6) % 7

export const isWeekend = (date: IsoDate) => weekday(date) === 0 || weekday(date) === 6

export const holidayOn = (plan: Plan, date: IsoDate) => plan.holidays.find((h) => h.date === date)

const dayOfMonth = (date: IsoDate) => Number(date.slice(8, 10))

/** "Mon 19" */
export const dayLabel = (date: IsoDate) => `${WEEKDAYS[weekday(date)]} ${dayOfMonth(date)}`

const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' })

/** "Monday", for headings. */
export const weekdayLong = (date: IsoDate) => WEEKDAYS_LONG[weekday(date)]

/** "Monday 19 October", for screen readers. */
export const dayLabelLong = (date: IsoDate) => `${weekdayLong(date)} ${longDate.format(toUtc(date))}`

/** "19 Oct – 1 Nov" */
export const planRangeLabel = (plan: Plan) =>
  `${shortDate.format(toUtc(plan.start))} – ${shortDate.format(toUtc(plan.end))}`
