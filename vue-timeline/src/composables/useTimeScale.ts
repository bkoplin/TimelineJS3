import type { Moment, unitOfTime } from 'moment'
import type { Ref } from 'vue'
import type { TimelineEvent, TimelineOptions } from '@/types'
import { DateRange, MomentRange } from 'moment-range'
import { computed, ref } from 'vue'
import { moment } from '@/composables/useMoment'

export interface TimeScaleConfig {
  events: any[]
  title?: any
  eras?: any[]
}

export interface TimeScaleOptions {
  display_width: number
  screen_multiplier: number
  max_rows: number
}

export interface PositionInfo {
  start: number
  width: number
  row: number
}
const AXIS_TICK_DATEFORMAT_LOOKUP: Record<unitOfTime.Base, string> = {
  millisecond: 'HH:mm:ss.SSS',
  second: 'HH:mm:ss',
  minute: 'HH:mm',
  hour: 'HH:mm',
  day: 'DD MMM',
  month: 'MMM YYYY',
  year: 'YYYY',
  decade: 'YYYY',
  century: 'YYYY',
  millennium: 'YYYY',
  age: 'compact', // ...Language.<code>.bigdateformats
  epoch: 'compact',
  era: 'compact',
  eon: 'compact',
  eon2: 'compact',
}

// Date parts from highest to lowest precision
export const DATE_PARTS: unitOfTime.Base[] = [
  'millisecond',
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'year',
]
export const useTimeScale = reactify(getTimeScale)
export function getTimeScale(
  events: TimelineEvent[],
  options: TimelineOptions,
) {
  const eventDates: Moment[] = events.flatMap(event => [event.start_date?.clone(), event.end_date?.clone()]).filter((d): d is Moment => isDefined(d) && d?.isValid())
  const range = moment.range([moment.min(eventDates), moment.max(eventDates)])

  let majorScale: [unitOfTime.Base, step: number] = ['year', 1]
  let minorScale: [unitOfTime.Base, step: number] = ['month', 1]
  const yearDiff = range.diff('years', true)

  if (yearDiff > 100) {
    majorScale = ['year', 10]
    minorScale = ['year', 1]
  }
  else if (yearDiff > 10) {
    majorScale = ['year', 1]
    minorScale = ['month', 1]
  }
  else if (yearDiff > 1) {
    majorScale = ['month', 1]
    minorScale = ['day', 1]
  }
  else {
    majorScale = ['day', 1]
    minorScale = ['hour', 1]
  }
  const majorMarkers = Array.from(range.clone().by(majorScale[0], { step: majorScale[1] })).map(d => ({
    moment: d,
    label: d.format(AXIS_TICK_DATEFORMAT_LOOKUP[majorScale[0]]),
  }))
  const minorMarkers = Array.from(range.clone().by(minorScale[0], { step: minorScale[1] })).map(d => ({
    moment: d,
    label: d.format(AXIS_TICK_DATEFORMAT_LOOKUP[minorScale[0]]),
  }))
  console.log('🚀 ~ minorMarkers ~ minorMarkers:', minorMarkers)
  // Calculate pixel width based on timeline data and screen multiplier
  const getPixelWidth = computed(() => {
    return options.value.display_width * options.screen_multiplier
  })

  // Get position information for a marker at given index
  function getPositionInfo(index: number): PositionInfo {
    if (index >= events.length) {
      return { start: 0, width: 100, row: 0 }
    }

    // Simple positioning logic - you can enhance this
    const eventSpacing = getPixelWidth.value / Math.max(events.length, 1)
    const start = index * eventSpacing
    const width = Math.max(eventSpacing * 0.8, 100) // Minimum width of 100px
    const row = Math.floor(index / Math.ceil(events.length / options.max_rows))

    return { start, width, row }
  }

  // Get number of rows needed for timeline
  function getNumberOfRows(): number {
    return Math.min(
      Math.ceil(events.length / Math.ceil(events.length / options.max_rows)),
      options.max_rows,
    )
  }

  // Get group labels if any grouping is configured
  function getGroupLabels(): string[] | null {
    // This would analyze the timeline data for natural groupings
    // For now, return null (no groups)
    return null
  }

  // Get major scale (year, decade, century, etc.)
  function getMajorScale(): [unitOfTime.Base, step: number] {
    return majorScale
  }

  // Get minor scale (month, year, etc.)
  function getMinorScale(): [unitOfTime.Base, step: number] {
    return minorScale
  }

  // Get position for a timestamp
  function getPosition(timestamp: number): number {
    // Find the earliest and latest dates
    const minDate = range.start.valueOf()
    const dateRange = range.diff()

    // Calculate position as percentage of total width
    const ratio = (timestamp - minDate) / dateRange
    return ratio * getPixelWidth.value
  }

  // Update scale calculations when data changes
  function updateScale() {
  }
  const default_marker_width = 100
  const positions = events.map((marker, index) => {
    let groups = []
    let empty_group = false

    // Set start/end/width; enumerate groups
    const pos_info = {
      start: getPosition(marker.start_date?.millisecond()),
      end: getPosition(marker.end_date?.millisecond() || marker.start_date?.millisecond() + default_marker_width),
    }

    return pos_info
  })

  return {
    // Computed properties
    pixelWidth: getPixelWidth,
    majorScale,
    minorScale,
    majorMarkers,
    minorMarkers,
    range,
    positions,
    // Methods
    getPositionInfo,
    getNumberOfRows,
    getGroupLabels,
    getMajorScale,
    getMinorScale,
    getPosition,
    updateScale,

    // For direct access
    getPixelWidth: () => getPixelWidth.value,
  }
}
