import type { Ref } from 'vue'
import { computed, ref } from 'vue'

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

export function useTimeScale(
  config: Ref<TimeScaleConfig>,
  options: Ref<TimeScaleOptions>,
) {
  const majorScale = ref('year')
  const minorScale = ref('month')
  
  // Calculate pixel width based on timeline data and screen multiplier
  const getPixelWidth = computed(() => {
    return options.value.display_width * options.value.screen_multiplier
  })

  // Get position information for a marker at given index
  function getPositionInfo(index: number): PositionInfo {
    const events = config.value.events || []
    if (index >= events.length) {
      return { start: 0, width: 100, row: 0 }
    }

    // Simple positioning logic - you can enhance this
    const eventSpacing = getPixelWidth.value / Math.max(events.length, 1)
    const start = index * eventSpacing
    const width = Math.max(eventSpacing * 0.8, 100) // Minimum width of 100px
    const row = Math.floor(index / Math.ceil(events.length / options.value.max_rows))

    return { start, width, row }
  }

  // Get number of rows needed for timeline
  function getNumberOfRows(): number {
    const events = config.value.events || []
    return Math.min(
      Math.ceil(events.length / Math.ceil(events.length / options.value.max_rows)),
      options.value.max_rows,
    )
  }

  // Get group labels if any grouping is configured
  function getGroupLabels(): string[] | null {
    // This would analyze the timeline data for natural groupings
    // For now, return null (no groups)
    return null
  }

  // Get major scale (year, decade, century, etc.)
  function getMajorScale(): string {
    return majorScale.value
  }

  // Get minor scale (month, year, etc.)
  function getMinorScale(): string {
    return minorScale.value
  }

  // Get position for a timestamp
  function getPosition(timestamp: number): number {
    const events = config.value.events || []
    if (events.length === 0) {
      return 0
    }

    // Find the earliest and latest dates
    const dates = events.map(e => new Date(e.start_date?.date || e.start_date).getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const dateRange = maxDate - minDate || 1

    // Calculate position as percentage of total width
    const ratio = (timestamp - minDate) / dateRange
    return ratio * getPixelWidth.value
  }

  // Update scale calculations when data changes
  function updateScale() {
    const events = config.value.events || []
    if (events.length === 0) {
      return
    }

    // Analyze date range to determine appropriate scales
    const dates = events.map(e => new Date(e.start_date?.date || e.start_date))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    const yearDiff = maxDate.getFullYear() - minDate.getFullYear()
    
    if (yearDiff > 100) {
      majorScale.value = 'decade'
      minorScale.value = 'year'
    }
    else if (yearDiff > 10) {
      majorScale.value = 'year'
      minorScale.value = 'month'
    }
    else if (yearDiff > 1) {
      majorScale.value = 'month'
      minorScale.value = 'day'
    }
    else {
      majorScale.value = 'day'
      minorScale.value = 'hour'
    }
  }

  return {
    // Computed properties
    pixelWidth: getPixelWidth,
    
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
