import { useCallback, useEffect, useRef, useState } from 'react'
import type { Availability, ListKey, Mode, TimeRange } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import type { AvailabilityStore } from '../../interfaces/store'
import { clearPrimary, datesOf, findGroup, flip, normalise, otherList, otherMode, replaceGroup } from '../../utils/availability'
import { dayLabel, planRangeLabel } from '../../utils/date'
import { rangeSpoken, summary } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { Sheet } from '../../ui/Sheet'
import { DayMenu } from './DayMenu'
import { DAY_PICKER_TITLE, DayPicker } from './DayPickerSheet'
import { ListCard, type GroupActions } from './ListCard'
import { SWITCH_TITLE, SwitchMode } from './SwitchModeSheet'
import { TIME_EDITOR_TITLE, TimeEditor } from './TimeEditorSheet'
import { LIST_TITLE, toneOf } from './tone'
import './AvailabilityPage.css'
import './sheets.css'

interface AvailabilityPageProps {
  store: AvailabilityStore
  planId: string
}

/** "When are you free?": one person marks when they can make it within a plan. */
export function AvailabilityPage({ store, planId }: AvailabilityPageProps) {
  const [loaded, setLoaded] = useState<{ plan: Plan; availability: Availability }>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let live = true
    Promise.all([store.getPlan(planId), store.getAvailability(planId)])
      .then(([plan, availability]) => live && setLoaded({ plan, availability: normalise(availability, plan) }))
      .catch((reason: unknown) => live && setError(String(reason)))
    return () => {
      live = false
    }
  }, [store, planId])

  if (error) return <p className="page-error body secondary">Couldn’t load this plan. {error}</p>
  if (!loaded) return null
  return (
    <AvailabilityEditor
      plan={loaded.plan}
      initial={loaded.availability}
      onSave={(availability) => store.saveAvailability(planId, availability)}
    />
  )
}

type SheetState =
  | { kind: 'time'; list: ListKey; range: TimeRange | null; dates: IsoDate[] }
  | { kind: 'days'; list: ListKey; range: TimeRange }
  | { kind: 'switch'; from: Mode; to: Mode; markedDays: number; flippedDays: number }

interface MenuState {
  list: ListKey
  range: TimeRange
  date: IsoDate
  anchor: HTMLElement
}

interface AvailabilityEditorProps {
  plan: Plan
  initial: Availability
  onSave: (availability: Availability) => Promise<void>
}

function AvailabilityEditor({ plan, initial, onSave }: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState(initial)
  const [expanded, setExpanded] = useState<Record<ListKey, boolean>>({ primary: true, ifNeeded: false })
  // The sheet's content outlives `sheetOpen` so it can animate out; `id` remounts it with a fresh draft.
  const [sheet, setSheet] = useState<SheetState & { id: number }>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menu, setMenu] = useState<MenuState>()
  const [toast, setToast] = useState<{ id: number; text: string }>()
  const nextId = useRef(0)

  const { mode } = availability

  const showSheet = (next: SheetState) => {
    setSheet({ ...next, id: ++nextId.current })
    setSheetOpen(true)
  }
  const closeSheet = () => setSheetOpen(false)
  const closeMenu = useCallback(() => setMenu(undefined), [])

  const changeMode = (to: Mode) => {
    if (to === mode) return closeSheet()
    if (availability.primary.length === 0) return setAvailability(clearPrimary)
    showSheet({
      kind: 'switch',
      from: mode,
      to,
      markedDays: datesOf(availability.primary).length,
      flippedDays: datesOf(flip(availability, plan).primary).length,
    })
  }

  const actionsFor = (list: ListKey): GroupActions => ({
    onEditGroup: (range) =>
      showSheet({ kind: 'time', list, range, dates: findGroup(availability, list, range)?.dates ?? [] }),
    onAddDays: (range) => showSheet({ kind: 'days', list, range }),
    onDayMenu: (range, date, anchor) => setMenu({ list, range, date, anchor }),
    onAddGroup: () => showSheet({ kind: 'time', list, range: null, dates: [] }),
  })

  const save = async () => {
    await onSave(availability)
    setToast({ id: ++nextId.current, text: 'Your times are saved' })
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(undefined), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const segmentMode = sheetOpen && sheet?.kind === 'switch' ? sheet.to : mode
  const rest = otherMode(mode)

  return (
    <main className="page">
      <nav className="nav" aria-label="Page">
        {/* Nowhere to go back to yet. */}
        <button type="button" className="nav-back" aria-label="Back" onClick={() => {}}>
          <Icon name="chevronLeft" size={22} stroke={2.4} />
        </button>
        <button type="button" className="nav-done" aria-label="Done" onClick={save}>
          <Icon name="check" size={20} stroke={2.6} />
        </button>
      </nav>

      <header className="page-header">
        <p className="footnote semibold secondary caps">
          {plan.name} · {planRangeLabel(plan)}
        </p>
        <h1 className="title1">When are you free?</h1>
      </header>

      <div className="page-content">
        <SegmentedControl
          label="How to mark your times"
          value={segmentMode}
          onChange={changeMode}
          segments={[
            { value: 'free', tone: 'free', label: 'I’ll mark free times', icon: <Icon name="check" size={13} stroke={3} /> },
            { value: 'busy', tone: 'busy', label: 'I’ll mark busy times', icon: <Icon name="xmark" size={13} stroke={3} /> },
          ]}
        />

        {(['primary', 'ifNeeded'] as const).map((list) => {
          const tone = toneOf(mode, list)
          return (
            <ListCard
              key={list}
              tone={tone}
              title={LIST_TITLE[tone]}
              summary={summary(datesOf(availability[list]))}
              open={expanded[list]}
              onToggle={() => setExpanded((current) => ({ ...current, [list]: !current[list] }))}
              groups={availability[list]}
              {...actionsFor(list)}
            />
          )
        })}

        <p className="rest-note caption1 secondary">
          <Icon name="info" size={14} stroke={2.2} />
          <span>
            Everything else counts as{' '}
            <strong className="semibold" data-tone={rest}>
              {rest}
            </strong>
          </span>
        </p>
      </div>

      <Sheet open={sheetOpen && sheet?.kind === 'time'} onClose={closeSheet} labelledBy={TIME_EDITOR_TITLE}>
        {sheet?.kind === 'time' && (
          <TimeEditor
            key={sheet.id}
            plan={plan}
            tone={toneOf(mode, sheet.list)}
            range={sheet.range}
            dates={sheet.dates}
            onClose={closeSheet}
            onSave={(range, dates) => {
              setAvailability((a) => replaceGroup(a, plan, sheet.list, sheet.range, { range, dates }))
              closeSheet()
            }}
            onSaveAndAddAnother={(range, dates) => {
              setAvailability((a) => replaceGroup(a, plan, sheet.list, sheet.range, { range, dates }))
              showSheet({ kind: 'time', list: sheet.list, range: null, dates })
            }}
            onDelete={() => {
              setAvailability((a) => replaceGroup(a, plan, sheet.list, sheet.range, null))
              closeSheet()
            }}
          />
        )}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.kind === 'days'} onClose={closeSheet} labelledBy={DAY_PICKER_TITLE}>
        {sheet?.kind === 'days' && (
          <DayPicker
            key={sheet.id}
            plan={plan}
            tone={toneOf(mode, sheet.list)}
            range={sheet.range}
            dates={findGroup(availability, sheet.list, sheet.range)?.dates ?? []}
            otherTone={toneOf(mode, otherList(sheet.list))}
            otherDates={datesOf(availability[otherList(sheet.list)])}
            onClose={closeSheet}
            onSave={(dates) => {
              setAvailability((a) => replaceGroup(a, plan, sheet.list, sheet.range, { range: sheet.range, dates }))
              closeSheet()
            }}
          />
        )}
      </Sheet>

      <Sheet
        open={sheetOpen && sheet?.kind === 'switch'}
        onClose={closeSheet}
        labelledBy={SWITCH_TITLE}
        variant="action"
      >
        {sheet?.kind === 'switch' && (
          <SwitchMode
            from={sheet.from}
            to={sheet.to}
            markedDays={sheet.markedDays}
            flippedDays={sheet.flippedDays}
            onFlip={() => {
              setAvailability((a) => flip(a, plan))
              closeSheet()
            }}
            onStartAgain={() => {
              setAvailability(clearPrimary)
              closeSheet()
            }}
            onCancel={closeSheet}
          />
        )}
      </Sheet>

      {menu && (
        <DayMenu
          anchor={menu.anchor}
          label={`Remove ${dayLabel(menu.date)} from ${rangeSpoken(menu.range)}`}
          onClose={closeMenu}
          onRemove={() => {
            setAvailability((a) => {
              const group = findGroup(a, menu.list, menu.range)
              const dates = (group?.dates ?? []).filter((d) => d !== menu.date)
              return replaceGroup(a, plan, menu.list, menu.range, { range: menu.range, dates })
            })
            closeMenu()
          }}
        />
      )}

      <output className="toast-region" aria-live="polite">
        {toast && (
          <span key={toast.id} className="toast">
            <Icon name="check" size={16} stroke={3} />
            <span className="footnote semibold">{toast.text}</span>
          </span>
        )}
      </output>
    </main>
  )
}
