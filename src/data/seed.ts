import type { Availability } from '../interfaces/availability'
import type { Plan } from '../interfaces/plan'
import { ALL_DAY, span } from '../utils/availability'

const h = (hours: number) => hours * 60

export const seedPlan: Plan = {
  id: 'mooks-birthday',
  name: 'Mook’s Birthday',
  start: '2026-10-19',
  end: '2026-11-01',
  holidays: [{ date: '2026-10-23', name: 'Chulalongkorn Day' }],
}

/** Matches design/mark-free.png. */
export const seedFree: Availability = {
  mode: 'free',
  primary: [
    { range: ALL_DAY, dates: ['2026-10-24', '2026-10-25', '2026-10-31'] },
    { range: span(h(18), h(23)), dates: ['2026-10-19', '2026-10-20'] },
    { range: span(h(19.5), h(26)), dates: ['2026-10-30'] },
  ],
  ifNeeded: [{ range: ALL_DAY, dates: ['2026-10-21', '2026-10-23', '2026-10-27'] }],
}

/** Matches design/mark-busy.png. Only there to check the busy screen against its render. */
export const seedBusy: Availability = {
  mode: 'busy',
  primary: [
    { range: ALL_DAY, dates: ['2026-10-22', '2026-10-26'] },
    { range: span(h(9), h(18)), dates: ['2026-10-27', '2026-10-28', '2026-10-29'] },
    { range: span(h(20), h(24)), dates: ['2026-10-21'] },
  ],
  ifNeeded: [{ range: ALL_DAY, dates: ['2026-10-23'] }],
}
