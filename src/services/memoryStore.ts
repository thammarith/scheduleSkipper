import type { Availability } from '../interfaces/availability'
import type { Plan } from '../interfaces/plan'
import type { AvailabilityStore } from '../interfaces/store'

/** An in-memory `AvailabilityStore`, seeded with one plan. */
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
    async savePlan(next) {
      plans.set(next.id, structuredClone(next))
      console.info('Saved plan', next.id, next)
    },
    async saveAvailability(planId, next) {
      availabilities.set(planId, structuredClone(next))
      console.info('Saved availability', planId, next)
    },
  }
}
