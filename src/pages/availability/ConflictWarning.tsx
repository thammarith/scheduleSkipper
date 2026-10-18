import type { Tone } from '../../interfaces/availability'
import type { IsoDate } from '../../interfaces/plan'
import { Icon } from '../../ui/Icon'
import { dayLabel } from '../../utils/date'
import { TONE_PHRASE } from './tone'

interface ConflictWarningProps {
  tone: Tone
  otherTone: Tone
  /** Dates where saving takes time away from the other list; nothing shows when empty. */
  dates: IsoDate[]
}

/** Warns before a save moves time out of the other list. Always rendered, so it announces as it appears. */
export function ConflictWarning({ tone, otherTone, dates }: ConflictWarningProps) {
  return (
    <output className="sheet-warning">
      {dates.length > 0 && (
        <>
          <Icon name="warning" size={16} stroke={2.2} />
          <span className="footnote">
            Overlaps your {TONE_PHRASE[otherTone]} time on {dates.map(dayLabel).join(', ')}. Saving makes that time{' '}
            {TONE_PHRASE[tone]}.
          </span>
        </>
      )}
    </output>
  )
}
