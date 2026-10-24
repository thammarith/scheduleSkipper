import type { IsoDate, Plan } from '../interfaces/plan'

const DAY_MS = 86_400_000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

const toUtc = (date: IsoDate) => Date.parse(`${date}T00:00:00Z`)

export const addDays = (date: IsoDate, days: number): IsoDate =>
  new Date(toUtc(date) + days * DAY_MS).toISOString().slice(0, 10)

/** Today, on the person's own calendar. */
export const today = (): IsoDate => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function planDates(plan: Pick<Plan, 'start' | 'end'>): IsoDate[] {
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

/** A month as `YYYY-MM`. */
export type YearMonth = string

export const monthOf = (date: IsoDate): YearMonth => date.slice(0, 7)

/** Every date of a month, in order. */
export function datesInMonth(month: YearMonth): IsoDate[] {
  const dates: IsoDate[] = []
  for (let date = `${month}-01`; monthOf(date) === month; date = addDays(date, 1)) dates.push(date)
  return dates
}

/** The month `count` months after (or before, if negative) `month`. */
export function shiftMonth(month: YearMonth, count: number): YearMonth {
  const index = Number(month.slice(0, 4)) * 12 + Number(month.slice(5)) - 1 + count
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

const shortMonth = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' })
const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** "Nov" */
export const monthShort = (date: IsoDate) => shortMonth.format(toUtc(date))

/** "October 2026" */
export const monthLabel = (month: YearMonth) => monthName.format(toUtc(`${month}-01`))
