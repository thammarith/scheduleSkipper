import type { TimeRange } from '../interfaces/availability'
import type { IsoDate, Plan } from '../interfaces/plan'
import { compareRanges, isValidRange, rangeKey } from './availability'

/** Valid windows, one of each, in the order they read: All day first, then by start time. */
export function tidySlots(slots: TimeRange[]): TimeRange[] {
  const unique = new Map(slots.filter(isValidRange).map((range) => [rangeKey(range), range]))
  return [...unique.values()].sort(compareRanges)
}

const sameSlots = (a: TimeRange[], b: TimeRange[]) => a.length === b.length && a.every((r, i) => rangeKey(r) === rangeKey(b[i]))

/**
 * Puts a plan into its canonical shape: possible days unique and in date order, the range running from the
 * first possible day to the last (unchanged while there are none), windows tidy, and overrides only where
 * they differ from `slots`. An override on a day that is not possible, or while there are no `slots`, is kept
 * so it comes back with the day or the slots, but nothing uses it meanwhile.
 */
export function normalisePlan(plan: Plan): Plan {
  const possibleDays = [...new Set(plan.possibleDays)].sort()
  const slots = tidySlots(plan.slots)
  const overrides: Plan['overrides'] = {}
  for (const [date, ranges] of Object.entries(plan.overrides)) {
    const own = tidySlots(ranges)
    if (own.length > 0 && !sameSlots(own, slots)) overrides[date] = own
  }
  const range = possibleDays.length > 0 ? { start: possibleDays[0], end: possibleDays[possibleDays.length - 1] } : plan
  return { ...plan, start: range.start, end: range.end, possibleDays, slots, overrides }
}

/** The windows guests choose from on a date. */
export const slotsFor = (plan: Plan, date: IsoDate): TimeRange[] => plan.overrides[date] ?? plan.slots

export const togglePossibleDay = (plan: Plan, date: IsoDate): Plan =>
  normalisePlan({
    ...plan,
    possibleDays: plan.possibleDays.includes(date) ? plan.possibleDays.filter((d) => d !== date) : [...plan.possibleDays, date],
  })

export const setSlots = (plan: Plan, slots: TimeRange[]): Plan => normalisePlan({ ...plan, slots })

/** Gives a date its own windows, or (with null) takes them away again. */
export const setOverride = (plan: Plan, date: IsoDate, slots: TimeRange[] | null): Plan => {
  const { [date]: _removed, ...rest } = plan.overrides
  return normalisePlan({ ...plan, overrides: slots ? { ...rest, [date]: slots } : rest })
}


/** The days whose own slots guests see: overridden, possible, and with default slots to differ from. */
export const overriddenDays = (plan: Plan): IsoDate[] =>
  plan.slots.length === 0 ? [] : plan.possibleDays.filter((date) => date in plan.overrides)
