import type { Availability, Group, ListKey, Mode, SlotState, TimeRange } from '../interfaces/availability'
import type { IsoDate, Plan } from '../interfaces/plan'
import { planDates } from './date'

/** Minutes in a day, a time step and the latest a range may end ("ends next day" at 24:00 the day after). */
export const DAY = 1440
export const STEP = 15
export const MAX_END = 2 * DAY
export const SLOTS_PER_DAY = DAY / STEP

export const ALL_DAY: TimeRange = { kind: 'allDay' }

export const span = (start: number, end: number): TimeRange => ({ kind: 'span', start, end })

export const otherMode = (mode: Mode): Mode => (mode === 'free' ? 'busy' : 'free')
export const otherList = (list: ListKey): ListKey => (list === 'primary' ? 'ifNeeded' : 'primary')

export const rangeKey = (range: TimeRange) => (range.kind === 'allDay' ? 'all-day' : `${range.start}-${range.end}`)

export const sameRange = (a: TimeRange, b: TimeRange) => rangeKey(a) === rangeKey(b)

export function isValidRange(range: TimeRange): boolean {
  if (range.kind === 'allDay') return true
  const { start, end } = range
  return (
    start % STEP === 0 && end % STEP === 0 && start >= 0 && start < DAY && end > start && end <= MAX_END
  )
}

/** Every date the groups cover, unique and in date order. */
export const datesOf = (groups: Group[]): IsoDate[] => [...new Set(groups.flatMap((g) => g.dates))].sort()

// ── Internals: per-date spans and per-slot masks ─────────────────────────────

/** [start, end) in minutes from the date's midnight. */
type Span = [number, number]
type DayMap = Map<IsoDate, Span[]>

const spanOf = (range: TimeRange): Span => (range.kind === 'allDay' ? [0, DAY] : [range.start, range.end])
const rangeOf = ([start, end]: Span): TimeRange => (start === 0 && end === DAY ? ALL_DAY : span(start, end))

function mergeSpans(spans: Span[]): Span[] {
  const merged: Span[] = []
  for (const [start, end] of [...spans].sort((a, b) => a[0] - b[0])) {
    const last = merged.at(-1)
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return merged
}

/** Spans per plan date, with overlapping or touching spans on the same date merged. */
function toDayMap(groups: Group[], dates: IsoDate[]): DayMap {
  const map: DayMap = new Map(dates.map((d) => [d, []]))
  for (const group of groups) {
    if (!isValidRange(group.range)) continue
    for (const date of group.dates) map.get(date)?.push(spanOf(group.range))
  }
  for (const [date, spans] of map) map.set(date, mergeSpans(spans))
  return map
}

const compareRanges = (a: TimeRange, b: TimeRange) => {
  const [as, ae] = a.kind === 'allDay' ? [-1, -1] : [a.start, a.end]
  const [bs, be] = b.kind === 'allDay' ? [-1, -1] : [b.start, b.end]
  return as - bs || ae - be
}

/** Groups dates by identical range: All day first, then by start time. */
function toGroups(map: DayMap, dates: IsoDate[]): Group[] {
  const groups = new Map<string, Group>()
  for (const date of dates) {
    for (const s of map.get(date) ?? []) {
      const range = rangeOf(s)
      const key = rangeKey(range)
      const group = groups.get(key) ?? groups.set(key, { range, dates: [] }).get(key)!
      group.dates.push(date)
    }
  }
  return [...groups.values()].sort((a, b) => compareRanges(a.range, b.range))
}

/** One flag per 15-minute slot across the plan, plus one spill-over day for spans that end next day. */
function toMask(map: DayMap, dates: IsoDate[]): Uint8Array {
  const mask = new Uint8Array((dates.length + 1) * SLOTS_PER_DAY)
  dates.forEach((date, i) => {
    for (const [start, end] of map.get(date) ?? []) {
      mask.fill(1, i * SLOTS_PER_DAY + start / STEP, i * SLOTS_PER_DAY + end / STEP)
    }
  })
  return mask
}

/** [from, to) slot runs where `mask` is set, within [lo, hi). */
function runs(mask: Uint8Array, lo: number, hi: number, wanted = 1): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let k = lo; k < hi; k++) {
    if (mask[k] !== wanted) continue
    const from = k
    while (k < hi && mask[k] === wanted) k++
    out.push([from, k])
  }
  return out
}

/** Removes the slots in `mask` from every span. A leftover that starts after midnight moves to the next day. */
function subtract(map: DayMap, mask: Uint8Array, dates: IsoDate[]): DayMap {
  const out: DayMap = new Map(dates.map((d) => [d, []]))
  dates.forEach((date, i) => {
    const base = i * SLOTS_PER_DAY
    for (const [start, end] of map.get(date) ?? []) {
      for (const [from, to] of runs(mask, base + start / STEP, base + end / STEP, 0)) {
        const s = (from - base) * STEP
        const e = (to - base) * STEP
        if (s < DAY) out.get(date)!.push([s, e])
        else if (i + 1 < dates.length) out.get(dates[i + 1])!.push([s - DAY, e - DAY])
      }
    }
  })
  for (const [date, spans] of out) out.set(date, mergeSpans(spans))
  return out
}

// ── Public operations ────────────────────────────────────────────────────────

/**
 * Puts availability into its canonical shape: dates outside the plan dropped, overlapping or touching
 * spans on the same date merged, a slot in only one list (`winner`, the list just edited, keeps it),
 * groups keyed by identical range, no empty groups, All day first and then by start time.
 */
export function normalise(availability: Availability, plan: Plan, winner: ListKey = 'primary'): Availability {
  const dates = planDates(plan)
  const won = toDayMap(availability[winner], dates)
  const lost = subtract(toDayMap(availability[otherList(winner)], dates), toMask(won, dates), dates)
  const lists = { [winner]: toGroups(won, dates), [otherList(winner)]: toGroups(lost, dates) } as Record<ListKey, Group[]>
  return { mode: availability.mode, primary: lists.primary, ifNeeded: lists.ifNeeded }
}

/** What each 15-minute slot of every plan date means for matching. Expects normalised availability. */
export function derive(availability: Availability, plan: Plan): Map<IsoDate, SlotState[]> {
  const dates = planDates(plan)
  const primary = toMask(toDayMap(availability.primary, dates), dates)
  const ifNeeded = toMask(toDayMap(availability.ifNeeded, dates), dates)
  const [marked, rest]: SlotState[] = availability.mode === 'free' ? ['free', 'busy'] : ['busy', 'free']
  return new Map(
    dates.map((date, i) => [
      date,
      Array.from({ length: SLOTS_PER_DAY }, (_, j) => {
        const k = i * SLOTS_PER_DAY + j
        return primary[k] ? marked : ifNeeded[k] ? 'ifNeeded' : rest
      }),
    ]),
  )
}

/**
 * Regroups slot runs into the fewest groups. Runs are cut at midnight, and a run that crosses midnight
 * is kept whole (one range ending next day) only where that gives fewer groups.
 */
function fewestGroups(mask: Uint8Array, dates: IsoDate[]): Group[] {
  const days: Span[][] = dates.map((_, i) =>
    runs(mask, i * SLOTS_PER_DAY, (i + 1) * SLOTS_PER_DAY).map(([from, to]) => [
      (from - i * SLOTS_PER_DAY) * STEP,
      (to - i * SLOTS_PER_DAY) * STEP,
    ]),
  )
  // A joint is an evening run touching midnight followed by a morning run; never an All day.
  const joints = dates.slice(0, -1).flatMap((_, i) => {
    const tail = days[i].at(-1)
    const head = days[i + 1][0]
    return tail && head && tail[0] > 0 && tail[1] === DAY && head[0] === 0 && head[1] < DAY ? [i] : []
  })
  // ponytail: tries every join choice, 2^joints; past 16 joints it just cuts at midnight. Greedy if plans grow.
  const choices = joints.length <= 16 ? 2 ** joints.length : 1
  let best: { groups: Group[]; pieces: number } | undefined
  for (let choice = 0; choice < choices; choice++) {
    const map: DayMap = new Map(dates.map((d, i) => [d, days[i].map((s): Span => [...s])]))
    joints.forEach((i, bit) => {
      if (!((choice >> bit) & 1)) return
      const evening = map.get(dates[i])!
      const morning = map.get(dates[i + 1])!
      evening[evening.length - 1] = [evening.at(-1)![0], DAY + morning.shift()![1]]
    })
    const groups = toGroups(map, dates)
    const pieces = groups.reduce((n, g) => n + g.dates.length, 0)
    if (!best || groups.length < best.groups.length || (groups.length === best.groups.length && pieces < best.pieces)) {
      best = { groups, pieces }
    }
  }
  return best!.groups
}

/**
 * Switches mode while keeping the derived per-slot result the same: primary becomes everything in the
 * plan that was neither primary nor ifNeeded, regrouped into the fewest groups. The ifNeeded list stays as is.
 */
export function flip(availability: Availability, plan: Plan): Availability {
  const dates = planDates(plan)
  const primary = toMask(toDayMap(availability.primary, dates), dates)
  const ifNeeded = toMask(toDayMap(availability.ifNeeded, dates), dates)
  const rest = new Uint8Array(primary.length)
  for (let k = 0; k < dates.length * SLOTS_PER_DAY; k++) rest[k] = primary[k] || ifNeeded[k] ? 0 : 1
  return normalise(
    { mode: otherMode(availability.mode), primary: fewestGroups(rest, dates), ifNeeded: availability.ifNeeded },
    plan,
    'ifNeeded',
  )
}

/** Switches mode by starting the primary list again. */
export const clearPrimary = (availability: Availability): Availability => ({
  ...availability,
  mode: otherMode(availability.mode),
  primary: [],
})

/**
 * Replaces the group with range `previous` in `list` (or adds one when `previous` is null) by `next`
 * (or removes it when `next` is null). The edited list wins any overlap with the other list.
 */
export function replaceGroup(
  availability: Availability,
  plan: Plan,
  list: ListKey,
  previous: TimeRange | null,
  next: Group | null,
): Availability {
  const kept = availability[list].filter((g) => !previous || !sameRange(g.range, previous))
  return normalise({ ...availability, [list]: next ? [...kept, next] : kept }, plan, list)
}

/**
 * Dates where saving `next` would take time away from the other list, since the edited list wins any
 * overlap. Expects normalised availability.
 */
export function conflicts(
  availability: Availability,
  plan: Plan,
  list: ListKey,
  previous: TimeRange | null,
  next: Group,
): IsoDate[] {
  const other = otherList(list)
  const pieces = (groups: Group[]) => new Set(groups.flatMap((g) => g.dates.map((d) => `${d} ${rangeKey(g.range)}`)))
  const after = pieces(replaceGroup(availability, plan, list, previous, next)[other])
  const lost = [...pieces(availability[other])].filter((piece) => !after.has(piece))
  return [...new Set(lost.map((piece) => piece.slice(0, 10)))].sort()
}

export const findGroup = (availability: Availability, list: ListKey, range: TimeRange) =>
  availability[list].find((g) => sameRange(g.range, range))
