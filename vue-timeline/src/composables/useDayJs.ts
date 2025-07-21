import { makeDestructurable, reactify } from '@vueuse/core'
import dayjs from 'dayjs'
import arraySupport from 'dayjs/plugin/arraySupport'
import customparseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import minMax from 'dayjs/plugin/minMax'
import objectSupport from 'dayjs/plugin/objectSupport'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { select } from 'radash'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customparseFormat)
dayjs.extend(objectSupport)
dayjs.extend(arraySupport)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(minMax)
dayjs.extend(pluralGetSet)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)

export type Dayjs = ReturnType<typeof dayjs>

export function datesToMinMax(inputDates: Array<Parameters<typeof dayjs>[0] | ReturnType<typeof dayjs> | null | undefined>) {
  const dates = select(inputDates, date => dayjs.utc(date), date => typeof date !== 'undefined' && date !== null).sort((a, b) => a.isBefore(b) ? -1 : a.isSame(b) ? 0 : 1)
  const earliestDate = dayjs.min(dates) as Exclude<ReturnType<typeof dayjs>, null | undefined>
  const latestDate = dayjs.max(dates) as Exclude<ReturnType<typeof dayjs>, null | undefined>
  return {
    dates,
    min: earliestDate,
    max: latestDate,
    start: earliestDate,
    end: latestDate,
    0: earliestDate,
    1: latestDate,
  }
}
export const useDatesToMinMax = reactify(datesToMinMax)
export const useDayjs = reactify(dayjs)
export { dayjs }

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('should format date correctly', () => {
    const date = dayjs('2020-01-01')
    expect(date.format('YYYY-MM-DD')).toBe('2020-01-01')
  })
  it('should parse date objects correctly', () => {
    const date = dayjs({ year: '2020', month: '0', day: '1' })
    expect(date.format('YYYY-MM-DD')).toBe('2020-01-01')
  })
  it('should parse an array of dates', () => {
    const dates = datesToMinMax(['2020-01-01', '2020-01-02', { year: 2019 }])
    expect(dates.dates[0].format('YYYY-MM-DD')).toBe('2019-01-01')
    expect(dates.dates[2].format('YYYY-MM-DD')).toBe('2020-01-02')
    expect(dates[0].format('YYYY-MM-DD')).toBe('2019-01-01')
    expect(dates[0].toDate() instanceof Date).toBe(true)
  })
}
