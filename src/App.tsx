import { useSyncExternalStore } from 'react'
import type { AvailabilityStore } from './interfaces/store'
import { AvailabilityPage } from './pages/availability/AvailabilityPage'
import { HomePage } from './pages/home/HomePage'
import { SetupPage } from './pages/setup/SetupPage'

const subscribe = (notify: () => void) => {
  addEventListener('hashchange', notify)
  return () => removeEventListener('hashchange', notify)
}

const go = (hash: string) => () => {
  location.hash = hash
}

/**
 * Routes, by hash: `#/` is home, `#/plan/ID` marks times in a plan and `#/plan/ID/setup` sets it up.
 */
export function App({ store }: { store: AvailabilityStore }) {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  const [, plan, id, page] = hash.split('/')

  if (plan === 'plan' && id && page === 'setup') {
    // A plan with no days has nowhere to go back to but home.
    return <SetupPage store={store} planId={id} onBack={(isNew) => go(isNew ? '#/' : `#/plan/${id}`)()} onSaved={go(`#/plan/${id}`)} />
  }
  if (plan === 'plan' && id) {
    return <AvailabilityPage store={store} planId={id} onBack={go('#/')} onEdit={go(`#/plan/${id}/setup`)} />
  }
  return (
    <HomePage
      store={store}
      onNew={() => store.createPlan().then((created) => go(`#/plan/${created.id}/setup`)())}
      onOpen={(opened) => go(opened.possibleDays.length === 0 ? `#/plan/${opened.id}/setup` : `#/plan/${opened.id}`)()}
    />
  )
}
