import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Availability } from './interfaces/availability'
import { seedBusy, seedFree, seedPlan, seedSetupPlan } from './data/seed'
import { createMemoryStore } from './services/memoryStore'
import { App } from './App'
import './styles/global.css'

// Starts with no times. `?seed=free` or `?seed=busy` loads a sample, only to check the screens against their renders;
// `?seed=setup` loads the organiser's sample (possible days and time slots) instead.
const samples: Record<string, Availability> = { free: seedFree, busy: seedBusy }
const seed = new URLSearchParams(location.search).get('seed') ?? ''
const plan = seed === 'setup' ? seedSetupPlan : seedPlan
const store = createMemoryStore(plan, samples[seed] ?? { mode: 'free', primary: [], ifNeeded: [] })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} planId={plan.id} />
  </StrictMode>,
)
