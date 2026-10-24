import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Availability } from './interfaces/availability'
import { seedBusy, seedDinner, seedFree, seedPlan, seedSetupPlan, seedTrip } from './data/seed'
import { createMemoryStore } from './services/memoryStore'
import { App } from './App'
import './styles/global.css'

// `?seed=free`, `?seed=busy` or `?seed=setup` loads a sample for Mook's Birthday, only to check the screens
// against their designs.
const samples: Record<string, Availability> = { free: seedFree, busy: seedBusy }
const seed = new URLSearchParams(location.search).get('seed') ?? ''
const mook = seed === 'setup' ? seedSetupPlan : seedPlan
const store = createMemoryStore({
  plans: [mook, seedDinner, seedTrip],
  availabilities: samples[seed] ? { [mook.id]: samples[seed] } : {},
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
)
