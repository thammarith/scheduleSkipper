import { useSyncExternalStore } from 'react'
import type { AvailabilityStore } from './interfaces/store'
import { AvailabilityPage } from './pages/availability/AvailabilityPage'
import { SetupPage } from './pages/setup/SetupPage'

const subscribe = (notify: () => void) => {
  addEventListener('hashchange', notify)
  return () => removeEventListener('hashchange', notify)
}

/** `#/setup` is the organiser's page; anything else is the guest's. Setup's Done and the guest page's Back link them. */
export function App({ store, planId }: { store: AvailabilityStore; planId: string }) {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  const go = (to: '#/' | '#/setup') => () => {
    location.hash = to
  }
  // The organiser sets the plan up, and Done lands on the page guests answer; Back there returns to setup.
  return hash === '#/setup' ? (
    <SetupPage store={store} planId={planId} onBack={go('#/')} onSaved={go('#/')} />
  ) : (
    <AvailabilityPage store={store} planId={planId} onBack={go('#/setup')} />
  )
}
