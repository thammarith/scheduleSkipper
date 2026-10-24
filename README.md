# Scheduleskipper

Scheduleskipper finds a time that suits a group. This repo holds two pages:

- **“When are you free?”** (`#/`): one guest marks when they can make it within a plan’s dates.
- **“Which days work?”** (`#/setup`): the organiser picks which days are possible and, optionally, the time slots guests choose from.

## Run it

Needs Node 22+ and pnpm.

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

The page loads the sample plan (Mook’s Birthday, 19 Oct – 1 Nov 2026) in “free” mode with no times, ready for you to add your own. Add `?seed=free` or `?seed=busy` to the URL to load the sample times shown in the design renders; they are only there to check the screens against those renders. In normal use you switch modes with the segmented control, which flips your times.

The organiser's page is at `http://localhost:5173/#/setup`; `?seed=setup` loads a sample plan for it (two weekends and the holiday, two dinner slots, and Sun 25 with its own times). It is there to check the screens against the designs.

The pages link up: Done on the setup page saves the plan and opens the guest page, and Back on the guest page returns to setup. Back on the setup page leaves without saving. Nothing is kept between page loads yet.

On the guest page, a plan without time slots shows the free-form page above, limited to the possible days. A plan with slots shows each possible day with its slots instead; guests tap a slot to cycle busy, free and “can be free”, and can't enter other times.

Other scripts:

```sh
pnpm lint         # oxlint, fails on any warning
pnpm typecheck    # tsc
pnpm build        # type-check and build to dist/
```

## Folder layout

```
src/
  interfaces/        Types only, no code
    plan.ts          Plan, holidays, possible days, time slots and per-day overrides
    availability.ts  Time ranges, groups, availability, modes, tones
    store.ts         AvailabilityStore (where plans and availability come from)
  services/
    memoryStore.ts   In-memory AvailabilityStore (swap for a real API)
  utils/             Pure TypeScript, no React
    date.ts          Plan dates, weekdays, holidays, date labels
    availability.ts  normalise, derive (per 15-minute slot), flip, edits, answering a slot
    plan.ts          Possible days, slots and overrides: normalise and edit
    format.ts        Summary lines, range labels ("18:00 – 23:00", "From 20:00", "All day")
  data/
    seed.ts          Sample plan and the two sample availabilities
  ui/                Shared primitives: Icon, Sheet (<dialog>), SegmentedControl, Disclosure (card), page nav, toast
  pages/availability The guest page, its cards, sheets and menu, and the slot answers
  pages/setup        The organiser's page and its sheets
  styles/global.css  Tokens (colours, type scale, spring easing) and base styles
```

`utils/availability.ts` is the part the group-matching feature will build on. `derive()` gives each plan date 96 slots, each one `free`, `ifNeeded` or `busy`. `normalise()` runs after every edit, and `flip()` switches mode without changing what `derive()` returns.

## Design references

- `design/mark-free.png` and `design/mark-busy.png`: the page in each mode (2× renders of a 393 pt phone)
- `design/switch-mode-sheet.png`: the confirmation when switching mode with times entered
- `design/time-editor-sheet.png`: the pattern for the time editor sheet (only the sheet itself)
- `~/scheduleskipper-design/avail11.html` (frames `g1`, `g2`, `g5`) and `base.css`: the HTML the renders came from, and the exact spec for sizes and colours
- Figma file `unsaved-mv51j7aj-lojeo2pl`, page “Final”, frames `57:60091` and `57:60239`

## Notes

- The font stack puts the named SF fonts first (`"SF Pro Text"`, then `-apple-system`). The system font adds its own tracking on top of the HIG letter-spacing, which made text a few pixels off the renders. Where SF Pro isn’t installed by name, the system font takes over.
- The page doesn’t draw a fake status bar, Dynamic Island or home indicator; the device provides those. The layout keeps their space (and respects safe-area insets), so everything else lines up with the renders.
- From 600 pt wide, the column is centred at 560 pt and sheets show as centred dialogs.
- Times use the browser's own `<input type="time">` (15-minute step; typed minutes snap down when the field loses focus), so phones show their native time picker. Days are native checkboxes styled as chips and calendar cells, since a date input picks only one date.
