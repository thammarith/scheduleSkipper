import { useId } from 'react'
import type { Group, TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate } from '../../interfaces/plan'
import { rangeKey } from '../../utils/availability'
import { dayLabel, dayLabelLong } from '../../utils/date'
import { endsNextDay, rangeLabel, rangeSpoken } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import { Badge, Mark } from './Mark'
import { rangeIcon } from './tone'
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
  const id = useId()
  return (
    <section className="card" data-tone={tone} data-open={open} aria-labelledby={`${id}-title`}>
      <h2>
        <button type="button" className="card-head" aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
          <Badge tone={tone} />
          <span className="card-titles">
            <span className="headline" id={`${id}-title`}>
              {title}
            </span>
            <span className="caption1 secondary">{summary}</span>
          </span>
          <Icon name="chevronDown" size={14} stroke={2.6} className="card-chevron" />
        </button>
      </h2>
      <div className="card-body" id={`${id}-body`} inert={!open}>
        <div className="card-clip">
          <div className="card-content">
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
          </div>
        </div>
      </div>
    </section>
  )
}

function TimeGroup({ tone, group, onEditGroup, onAddDays, onDayMenu }: { tone: Tone; group: Group } & GroupActions) {
  const { range, dates } = group
  const spoken = rangeSpoken(range)
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
