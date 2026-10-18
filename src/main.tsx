import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { seedBusy, seedFree, seedPlan } from './data/seed'
import { createMemoryStore } from './services/memoryStore'
import { AvailabilityPage } from './pages/availability/AvailabilityPage'
import './styles/global.css'

// `?seed=busy` loads the busy-mode sample, only to check that screen against its render.
const seed = new URLSearchParams(location.search).get('seed') === 'busy' ? seedBusy : seedFree
const store = createMemoryStore(seedPlan, seed)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AvailabilityPage store={store} planId={seedPlan.id} />
  </StrictMode>,
)
