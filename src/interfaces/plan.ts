import type { TimeRange } from './availability'

/** A calendar date as `YYYY-MM-DD`, with no time zone attached. */
export type IsoDate = string

export interface Holiday {
  date: IsoDate
  name: string
}

export interface Plan {
  id: string
  name: string
  /** First and last day of the plan, both inclusive. They follow the possible days. */
  start: IsoDate
  end: IsoDate
  holidays: Holiday[]
  /** The days in the range the organiser allows, in date order. Guests can only answer for these. */
  possibleDays: IsoDate[]
  /** The time windows the organiser offers on every possible day. Empty means guests enter their own times. */
  slots: TimeRange[]
  /** Days that offer their own windows instead of `slots`. Only used on possible days, and while `slots` is not empty. */
  overrides: Record<IsoDate, TimeRange[]>
}
