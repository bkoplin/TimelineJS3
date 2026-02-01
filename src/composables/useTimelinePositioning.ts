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
import { sortEventsByDate, timelineDateToJSDate, parseFlexibleDate } from '@/utils/date'
import { useTimelineAnimation } from './useTimelineAnimation'

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
  
  // Animation state
  const isZooming = ref(false)
  
  // Initialize animation composable
  const animation = useTimelineAnimation({
    enabled: true,
    duration: 600,
    respectMotionPreference: true
  })
  
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
   * Zoom in (centered on current event or middle of timeline) with smooth animation
   */
  async function zoomIn(centerEventIndex?: number) {
    if (!scale.value || isZooming.value) return
    isZooming.value = true
    
    const targetZoom = zoomLevel.value * 1.5
    
    // Get center date from event or use middle of timeline
    let centerDate: Date | undefined
    if (centerEventIndex !== undefined && sortedEvents.value[centerEventIndex]) {
      const event = sortedEvents.value[centerEventIndex]
      if (event.start_date) {
        const parsedDate = parseFlexibleDate(event.start_date)
        centerDate = timelineDateToJSDate(parsedDate)
      }
    }
    
    await animateZoom(targetZoom, centerDate)
    
    isZooming.value = false
  }
  
  /**
   * Zoom out (centered on current event or middle of timeline) with smooth animation
   */
  async function zoomOut(centerEventIndex?: number) {
    if (!scale.value || isZooming.value) return
    isZooming.value = true
    
    const targetZoom = Math.max(zoomLevel.value / 1.5, 0.1)
    
    // Get center date from event or use middle of timeline
    let centerDate: Date | undefined
    if (centerEventIndex !== undefined && sortedEvents.value[centerEventIndex]) {
      const event = sortedEvents.value[centerEventIndex]
      if (event.start_date) {
        const parsedDate = parseFlexibleDate(event.start_date)
        centerDate = timelineDateToJSDate(parsedDate)
      }
    }
    
    await animateZoom(targetZoom, centerDate)
    
    isZooming.value = false
  }
  
  /**
   * Zoom to a specific event (centers on that event) with animation
   */
  async function zoomToEvent(eventIndex: number, zoomFactor: number = 2) {
    if (!scale.value || isZooming.value || !sortedEvents.value[eventIndex]) return
    isZooming.value = true
    
    const event = sortedEvents.value[eventIndex]
    let centerDate: Date | undefined
    if (event.start_date) {
      const parsedDate = parseFlexibleDate(event.start_date)
      centerDate = timelineDateToJSDate(parsedDate)
    }
    
    await animateZoom(zoomFactor, centerDate)
    
    isZooming.value = false
  }
  
  /**
   * Animate zoom transition smoothly with pan
   * This creates a combined zoom + pan animation for smooth UX
   */
  async function animateZoom(targetZoomLevel: number, centerDate?: Date) {
    if (!scale.value || !originalScale.value) return
    
    const startScale = scale.value.copy()
    const startZoom = zoomLevel.value
    
    // Calculate target scale with pan to center date
    const endScale = createZoomTransform(originalScale.value.copy(), targetZoomLevel, centerDate)
    
    if (!animation.animationsEnabled.value) {
      // No animation - instant zoom
      scale.value = endScale
      return
    }
    
    // Animate zoom + pan simultaneously over time
    await animation.animateValue(0, 1, (progress) => {
      if (scale.value && originalScale.value) {
        // Interpolate zoom level
        const currentZoom = startZoom + (targetZoomLevel - startZoom) * progress
        
        // Interpolate center date position (pan)
        let interpolatedCenter: Date | undefined
        if (centerDate) {
          const startDomain = startScale.domain()
          const endDomain = endScale.domain()
          const startCenter = new Date((startDomain[0].getTime() + startDomain[1].getTime()) / 2)
          const endCenter = new Date((endDomain[0].getTime() + endDomain[1].getTime()) / 2)
          
          const centerTime = startCenter.getTime() + (endCenter.getTime() - startCenter.getTime()) * progress
          interpolatedCenter = new Date(centerTime)
        }
        
        // Create scale with interpolated zoom and pan
        scale.value = createZoomTransform(originalScale.value.copy(), currentZoom, interpolatedCenter || centerDate)
      }
    }, animation.duration.value)
  }
  
  /**
   * Reset zoom to original
   */
  function resetZoom() {
    if (!originalScale.value) return
    scale.value = originalScale.value.copy()
  }
  
  /**
   * Zoom to a specific date (centers timeline on that date) with animation
   */
  async function zoomToDate(date: Date, factor: number = 2) {
    if (!scale.value || isZooming.value) return
    isZooming.value = true
    
    await animateZoom(factor, date)
    
    isZooming.value = false
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
    isZooming: computed(() => isZooming.value),
    
    // Animation
    animation,
    
    // Methods
    getEventPosition,
    getEventPercentage,
    getEraPosition,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToDate,
    zoomToEvent,
    updateScale
  }
}

