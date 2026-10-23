/** SF Symbols-like line icons on a 24-unit grid, stroked in `currentColor`. */
const PATHS = {
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronDown: 'M5 9l7 7 7-7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  xmark: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  plus: 'M12 5v14M5 12h14',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3.5 2',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4',
  sunset: 'M7 17a5 5 0 0110 0M3 17h18M12 4v6M9 7l3 3 3-3M4.6 10.6L6 12M18 12l1.4-1.4',
  moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5.5M12 7.8v.1',
  warning: 'M12 3.5L2.5 20h19L12 3.5zM12 10v4.5M12 17.3v.1',
  calendar: 'M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM3 10h18M8 3v4M16 3v4',
  trash: 'M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5l1-12.5M9 7V4.5h6V7',
} as const

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size: number
  stroke?: number
  className?: string
}

export function Icon({ name, size, stroke = 2, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={PATHS[name]} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
