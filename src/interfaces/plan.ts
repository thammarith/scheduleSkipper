/** A calendar date as `YYYY-MM-DD`, with no time zone attached. */
export type IsoDate = string

export interface Holiday {
  date: IsoDate
  name: string
}

export interface Plan {
  id: string
  name: string
  /** First and last day of the plan, both inclusive. */
  start: IsoDate
  end: IsoDate
  holidays: Holiday[]
}
