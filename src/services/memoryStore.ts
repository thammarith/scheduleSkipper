import type { Availability } from '../interfaces/availability'
import type { Plan } from '../interfaces/plan'
import type { AvailabilityStore } from '../interfaces/store'
import { today } from '../utils/date'

const NO_TIMES: Availability = { mode: 'free', primary: [], ifNeeded: [] }

interface Seed {
  plans: Plan[]
  /** By plan id. A plan without one starts with no times. */
  availabilities: Record<string, Availability>
}

/** An in-memory `AvailabilityStore`, seeded with some plans. */
export function createMemoryStore(seed: Seed): AvailabilityStore {
  const plans = new Map(seed.plans.map((plan) => [plan.id, structuredClone(plan)]))
  const availabilities = new Map(seed.plans.map((plan) => [plan.id, structuredClone(seed.availabilities[plan.id] ?? NO_TIMES)]))
  const getPlan = (planId: string) => {
    const plan = plans.get(planId)
    return plan ? Promise.resolve(structuredClone(plan)) : Promise.reject(new Error(`No plan ${planId}`))
  }
  return {
    async listPlans() {
      return [...plans.values()].map((plan) => {
        const { primary, ifNeeded } = availabilities.get(plan.id) ?? NO_TIMES
        return { plan: structuredClone(plan), answered: primary.length + ifNeeded.length > 0 }
      })
    },
    async createPlan() {
      const start = today()
      const plan: Plan = {
        id: `plan-${plans.size + 1}-${Date.now().toString(36)}`,
        name: 'New plan',
        start,
        end: start,
        holidays: [],
        organiser: true,
        possibleDays: [],
        slots: [],
        overrides: {},
      }
      plans.set(plan.id, plan)
      availabilities.set(plan.id, structuredClone(NO_TIMES))
      return structuredClone(plan)
    },
    getPlan,
    async getAvailability(planId) {
      await getPlan(planId)
      return structuredClone(availabilities.get(planId) ?? NO_TIMES)
    },
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
