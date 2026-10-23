import type { TimeRange } from '../interfaces/availability'
import type { IsoDate, Plan } from '../interfaces/plan'
import { compareRanges, isValidRange, rangeKey } from './availability'
import { planDates } from './date'

/** Valid windows, one of each, in the order they read: All day first, then by start time. */
export function tidySlots(slots: TimeRange[]): TimeRange[] {
  const unique = new Map(slots.filter(isValidRange).map((range) => [rangeKey(range), range]))
  return [...unique.values()].sort(compareRanges)
}

const sameSlots = (a: TimeRange[], b: TimeRange[]) => a.length === b.length && a.every((r, i) => rangeKey(r) === rangeKey(b[i]))

/**
 * Puts a plan into its canonical shape: possible days inside the range and in date order, windows tidy,
 * and overrides only where they differ from `slots` on a possible day (none at all without `slots`).
 */
export function normalisePlan(plan: Plan): Plan {
  const inRange = new Set(planDates(plan))
  const possibleDays = [...new Set(plan.possibleDays)].filter((d) => inRange.has(d)).sort()
  const slots = tidySlots(plan.slots)
  const overrides: Plan['overrides'] = {}
  for (const date of possibleDays) {
    const own = tidySlots(plan.overrides[date] ?? [])
    if (slots.length > 0 && own.length > 0 && !sameSlots(own, slots)) overrides[date] = own
  }
  return { ...plan, possibleDays, slots, overrides }
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

