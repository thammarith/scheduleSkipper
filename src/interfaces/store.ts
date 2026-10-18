import type { Availability } from './availability'
import type { Plan } from './plan'

/** Where plans and a person's availability come from. A real API replaces the in-memory version. */
export interface AvailabilityStore {
  getPlan(planId: string): Promise<Plan>
  getAvailability(planId: string): Promise<Availability>
  saveAvailability(planId: string, availability: Availability): Promise<void>
}
