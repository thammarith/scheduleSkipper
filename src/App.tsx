import { useSyncExternalStore } from 'react'
import type { AvailabilityStore } from './interfaces/store'
import { AvailabilityPage } from './pages/availability/AvailabilityPage'
import { SetupPage } from './pages/setup/SetupPage'

const subscribe = (notify: () => void) => {
  addEventListener('hashchange', notify)
  return () => removeEventListener('hashchange', notify)
}

/** `#/setup` is the organiser's page; anything else is the guest's. */
export function App({ store, planId }: { store: AvailabilityStore; planId: string }) {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  return hash === '#/setup' ? <SetupPage store={store} planId={planId} /> : <AvailabilityPage store={store} planId={planId} />
}
