import type { Availability } from './availability'
import type { Plan } from './plan'

/** A plan as the home page lists it. */
export interface PlanEntry {
  plan: Plan
  /** Whether the person has marked any times yet. */
  answered: boolean
}

/** Where plans and a person's availability come from. A real API replaces the in-memory version. */
export interface AvailabilityStore {
  listPlans(): Promise<PlanEntry[]>
  /** Starts a plan the person organises, with no days yet. */
  createPlan(): Promise<Plan>
  getPlan(planId: string): Promise<Plan>
  getAvailability(planId: string): Promise<Availability>
  savePlan(plan: Plan): Promise<void>
  saveAvailability(planId: string, availability: Availability): Promise<void>
}
