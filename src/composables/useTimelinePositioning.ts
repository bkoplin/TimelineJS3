/**
 * Timeline Positioning Composable
 * Uses D3 Scale for transparent, customizable positioning
 */

import { computed, ref, watch, type Ref } from 'vue'
import type { ScaleTime } from 'd3-scale'
import type { TimelineEvent, TimelineEra, TimelineOptions } from '@/types/timeline'
import {
  createTimelineScale,
  calculateMarkerPositions,
  calculateEraPosition,
  generateAxisTicks,
  createZoomTransform,
  getZoomLevel,
  type TimelineScaleConfig,
  type MarkerPosition,
  type EraPosition
} from '@/utils/timelinePositioning'
import { sortEventsByDate } from '@/utils/date'

export interface TimelinePositioningConfig {
  /** Custom scale configuration */
  scaleConfig?: Partial<TimelineScaleConfig>
  /** Number of axis ticks to generate */
  tickCount?: number
}

export function useTimelinePositioning(
  events: Ref<readonly TimelineEvent[]> | (() => readonly TimelineEvent[]),
  options: Ref<Partial<TimelineOptions>> | (() => Partial<TimelineOptions>),
  config?: TimelinePositioningConfig
) {
  // Current D3 scale
  const scale = ref<ScaleTime<number, number> | null>(null)
  const originalScale = ref<ScaleTime<number, number> | null>(null)
  
  // Sorted events by date
  const sortedEvents = computed(() => {
    const eventsValue = typeof events === 'function' ? events() : events.value
    return sortEventsByDate(eventsValue as TimelineEvent[])
  })
  
  // Get options value
  const optionsValue = computed(() => {
    return typeof options === 'function' ? options() : options.value
  })
  
  /**
   * Create/update the D3 scale
   */
  function updateScale() {
    const displayWidth = typeof optionsValue.value.width === 'number' 
      ? optionsValue.value.width 
      : 1000
    
    const scaleConfig: TimelineScaleConfig = {
      displayWidth,
      screenMultiplier: optionsValue.value.scale_factor || 3,
      padding: 0.1,
      minSpan: 365 * 24 * 60 * 60 * 1000, // 1 year
      ...config?.scaleConfig
    }
    
    const { scale: newScale } = createTimelineScale(
      sortedEvents.value,
      scaleConfig
    )
    
    scale.value = newScale
    
    // Store original scale for zoom calculations
    if (!originalScale.value) {
      originalScale.value = newScale.copy()
    }
  }
  
  // Initialize and watch for changes
  watch([sortedEvents, optionsValue], updateScale, { immediate: true })
  
  /**
   * Marker positions for all events
   */
  const markerPositions = computed<MarkerPosition[]>(() => {
    if (!scale.value) return []
    return calculateMarkerPositions(sortedEvents.value, scale.value)
  })
  
  /**
   * Axis ticks for the timeline
   */
  const axisTicks = computed(() => {
    if (!scale.value) return []
    return generateAxisTicks(scale.value, config?.tickCount || 10)
  })
  
  /**
   * Current zoom level (1 = default)
   */
  const zoomLevel = computed(() => {
    if (!scale.value || !originalScale.value) return 1
    return getZoomLevel(scale.value, originalScale.value)
  })
  
  /**
   * Total pixel width of timeline
   */
  const pixelWidth = computed(() => {
    if (!scale.value) return 1000
    const [min, max] = scale.value.range()
    return max - min
  })
  
  /**
   * Get position for a specific event index
   */
  function getEventPosition(index: number): number {
    const marker = markerPositions.value[index]
    return marker?.x || 0
  }
  
  /**
   * Get percentage position for an event (0-100)
   */
  function getEventPercentage(index: number): number {
    const marker = markerPositions.value[index]
    return marker?.percentage || 0
  }
  
  /**
   * Get era position
   */
  function getEraPosition(era: TimelineEra): EraPosition {
    if (!scale.value) {
      return { x: 0, width: 100, percentage: 0, percentageWidth: 10 }
    }
    return calculateEraPosition(era, scale.value)
  }
  
  /**
   * Zoom in (centered on middle of timeline)
   */
  function zoomIn() {
    if (!scale.value) return
    const newZoom = zoomLevel.value * 1.5
    scale.value = createZoomTransform(scale.value, newZoom)
  }
  
  /**
   * Zoom out
   */
  function zoomOut() {
    if (!scale.value) return
    const newZoom = Math.max(zoomLevel.value / 1.5, 0.1)
    scale.value = createZoomTransform(scale.value, newZoom)
  }
  
  /**
   * Reset zoom to original
   */
  function resetZoom() {
    if (!originalScale.value) return
    scale.value = originalScale.value.copy()
  }
  
  /**
   * Zoom to a specific date (centers timeline on that date)
   */
  function zoomToDate(date: Date, factor: number = 2) {
    if (!scale.value) return
    scale.value = createZoomTransform(scale.value, factor, date)
  }
  
  return {
    // Data
    sortedEvents,
    markerPositions,
    axisTicks,
    
    // Scale info
    scale: computed(() => scale.value),
    pixelWidth,
    zoomLevel,
    
    // Methods
    getEventPosition,
    getEventPercentage,
    getEraPosition,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToDate,
    updateScale
  }
}

