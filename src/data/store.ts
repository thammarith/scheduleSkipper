import type { Availability } from '../domain/availability'
import type { Plan } from '../domain/plan'

/** Where plans and a person's availability come from. A real API replaces the in-memory version. */
export interface AvailabilityStore {
  getPlan(planId: string): Promise<Plan>
  getAvailability(planId: string): Promise<Availability>
  saveAvailability(planId: string, availability: Availability): Promise<void>
}

export function createMemoryStore(plan: Plan, availability: Availability): AvailabilityStore {
  const plans = new Map([[plan.id, structuredClone(plan)]])
  const availabilities = new Map([[plan.id, structuredClone(availability)]])
  const find = <T>(map: Map<string, T>, planId: string) => {
    const found = map.get(planId)
    if (!found) return Promise.reject(new Error(`No plan ${planId}`))
    return Promise.resolve(structuredClone(found))
  }
  return {
    getPlan: (planId) => find(plans, planId),
    getAvailability: (planId) => find(availabilities, planId),
    async saveAvailability(planId, next) {
      availabilities.set(planId, structuredClone(next))
      console.info('Saved availability', planId, next)
    },
  }
}
