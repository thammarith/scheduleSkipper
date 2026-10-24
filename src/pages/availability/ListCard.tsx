import type { Group, TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate } from '../../interfaces/plan'
import { rangeKey } from '../../utils/availability'
import { dayLabel, dayLabelLong } from '../../utils/date'
import { endsNextDay, rangeLabel, rangeSpoken } from '../../utils/format'
import { Disclosure } from '../../ui/Disclosure'
import { Icon } from '../../ui/Icon'
import { Badge, Mark } from './Mark'
import { rangeIcon, TONE_NAME } from './tone'
import './ListCard.css'

export interface GroupActions {
  onEditGroup: (range: TimeRange) => void
  onAddDays: (range: TimeRange) => void
  onDayMenu: (range: TimeRange, date: IsoDate, anchor: HTMLElement) => void
  onAddGroup: () => void
}

interface ListCardProps extends GroupActions {
  tone: Tone
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  groups: Group[]
}

/** A list of days grouped by time, behind a disclosure header. */
export function ListCard({ tone, title, summary, open, onToggle, groups, ...actions }: ListCardProps) {
  return (
    <Disclosure tone={tone} badge={<Badge tone={tone} />} title={title} summary={summary} open={open} onToggle={onToggle}>
      <ul className="groups">
        {groups.map((group) => (
          <li key={rangeKey(group.range)}>
            <TimeGroup tone={tone} group={group} {...actions} />
          </li>
        ))}
      </ul>
      <button type="button" className="another" onClick={actions.onAddGroup}>
        <Icon name="plus" size={14} stroke={2.6} />
        <span className="footnote semibold">{groups.length > 0 ? 'Another time' : 'Add a time'}</span>
      </button>
    </Disclosure>
  )
}

function TimeGroup({ tone, group, onEditGroup, onAddDays, onDayMenu }: { tone: Tone; group: Group } & GroupActions) {
  const { range, dates } = group
  // The list's name tells apart the same time in the other list.
  const spoken = `${rangeSpoken(range)}, ${TONE_NAME[tone].toLowerCase()}`
  return (
    <div className="group">
      <button type="button" className="group-head" aria-label={`Edit ${spoken}`} onClick={() => onEditGroup(range)}>
        <Icon name={rangeIcon(range)} size={15} stroke={2.4} />
        <span className="headline tabular group-label">{rangeLabel(range)}</span>
        {endsNextDay(range) && <span className="caption2 semibold secondary caps">Ends next day</span>}
        <Icon name="chevronRight" size={12} stroke={2.6} className="group-chevron" />
      </button>
      <ul className="chips" aria-label={`Days, ${spoken}`}>
        {dates.map((date) => (
          <li key={date}>
            <button
              type="button"
              className="chip hit"
              aria-haspopup="menu"
              aria-label={`${dayLabelLong(date)}, ${spoken}`}
              onClick={(event) => onDayMenu(range, date, event.currentTarget)}
            >
              <Mark tone={tone} size={10} />
              <span className="caption1 semibold">{dayLabel(date)}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="chip-add hit" aria-label={`Add days to ${spoken}`} onClick={() => onAddDays(range)}>
            <Icon name="plus" size={11} stroke={2.8} />
          </button>
        </li>
      </ul>
    </div>
  )
}
