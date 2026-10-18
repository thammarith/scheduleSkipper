import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Availability } from './interfaces/availability'
import { seedBusy, seedFree, seedPlan } from './data/seed'
import { createMemoryStore } from './services/memoryStore'
import { AvailabilityPage } from './pages/availability/AvailabilityPage'
import './styles/global.css'

// Starts with no times. `?seed=free` or `?seed=busy` loads a sample, only to check the screens against their renders.
const samples: Record<string, Availability> = { free: seedFree, busy: seedBusy }
const seed = new URLSearchParams(location.search).get('seed') ?? ''
const store = createMemoryStore(seedPlan, samples[seed] ?? { mode: 'free', primary: [], ifNeeded: [] })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AvailabilityPage store={store} planId={seedPlan.id} />
  </StrictMode>,
)
