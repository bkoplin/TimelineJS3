/**
 * Timeline Positioning Utilities
 * Uses D3 Scale for clear, industry-standard scale calculations
 */

import { scaleTime } from 'd3-scale'
import type { ScaleTime } from 'd3-scale'
import type { TimelineEvent, TimelineEra, TimelineDate } from '@/types/timeline'
import { timelineDateToJSDate, getEarliestDate, getLatestDate, parseFlexibleDate } from './date'

export interface TimelineScaleConfig {
  /** Display width in pixels */
  displayWidth: number
  /** Multiplier for total scrollable width (e.g., 3 = 3x display width) */
  screenMultiplier: number
  /** Padding on each side as percentage of display width */
  padding?: number
  /** Minimum span in milliseconds when all events are at same time */
  minSpan?: number
}

export interface MarkerPosition {
  index: number
  /** Pixel position from left */
  x: number
  /** Percentage position (0-100) */
  percentage: number
  /** Original event */
  event: TimelineEvent
}

export interface EraPosition {
  /** Pixel position from left */
  x: number
  /** Width in pixels */
  width: number
  /** Percentage position (0-100) */
  percentage: number
  /** Percentage width (0-100) */
  percentageWidth: number
}

/**
 * Create a timeline scale using D3
 * This provides transparent, customizable scale calculations
 */
export function createTimelineScale(
  events: readonly TimelineEvent[],
  config: TimelineScaleConfig
): {
  scale: ScaleTime<number, number>
  pixelWidth: number
  domain: [Date, Date]
  range: [number, number]
} {
  const {
    displayWidth,
    screenMultiplier = 3,
    padding = 0.1,
    minSpan = 365 * 24 * 60 * 60 * 1000 // 1 year default
  } = config

  // Get date range
  const earliest = getEarliestDate(events as TimelineEvent[])
  const latest = getLatestDate(events as TimelineEvent[])

  if (!earliest || !latest) {
    // No events - return empty scale
    const now = new Date()
    const yearAgo = new Date(now.getTime() - minSpan)
    return {
      scale: scaleTime().domain([yearAgo, now]).range([0, displayWidth]),
      pixelWidth: displayWidth,
      domain: [yearAgo, now],
      range: [0, displayWidth]
    }
  }

  const earliestDate = timelineDateToJSDate(earliest)
  const latestDate = timelineDateToJSDate(latest)

  // Calculate span
  let span = latestDate.getTime() - earliestDate.getTime()
  
  // If all events at same time, use minimum span
  if (span < minSpan) {
    span = minSpan
    // Center the events in the span
    const center = earliestDate.getTime()
    earliestDate.setTime(center - span / 2)
    latestDate.setTime(center + span / 2)
  }

  // Add padding to domain
  const paddingAmount = span * padding
  const paddedEarliest = new Date(earliestDate.getTime() - paddingAmount)
  const paddedLatest = new Date(latestDate.getTime() + paddingAmount)

  // Calculate pixel width
  const pixelWidth = displayWidth * screenMultiplier

  // Create D3 time scale
  const scale = scaleTime()
    .domain([paddedEarliest, paddedLatest])
    .range([0, pixelWidth])

  return {
    scale,
    pixelWidth,
    domain: [paddedEarliest, paddedLatest],
    range: [0, pixelWidth]
  }
}

/**
 * Calculate marker positions using the scale
 */
export function calculateMarkerPositions(
  events: readonly TimelineEvent[],
  scale: ScaleTime<number, number>
): MarkerPosition[] {
  return events.map((event, index) => {
    // Handle FlexibleDate by parsing it first
    const startDate = typeof event.start_date === 'object' && 'year' in event.start_date
      ? event.start_date as TimelineDate
      : parseFlexibleDate(event.start_date)
    
    const date = timelineDateToJSDate(startDate)
    const x = scale(date)
    const [min, max] = scale.range()
    const percentage = ((x - min) / (max - min)) * 100

    return {
      index,
      x,
      percentage,
      event
    }
  })
}

/**
 * Calculate era position using the scale
 */
export function calculateEraPosition(
  era: TimelineEra,
  scale: ScaleTime<number, number>
): EraPosition {
  const startDate = timelineDateToJSDate(era.start_date)
  const endDate = timelineDateToJSDate(era.end_date)
  
  const x = scale(startDate)
  const endX = scale(endDate)
  const width = endX - x

  const [min, max] = scale.range()
  const totalWidth = max - min
  const percentage = ((x - min) / totalWidth) * 100
  const percentageWidth = (width / totalWidth) * 100

  return {
    x,
    width: Math.max(width, 1), // Minimum 1px width
    percentage,
    percentageWidth
  }
}

/**
 * Generate axis ticks using D3's automatic tick generation
 */
export function generateAxisTicks(
  scale: ScaleTime<number, number>,
  count: number = 10
): Array<{ position: number; date: Date; label: string }> {
  // D3 automatically generates nice tick values
  const ticks = scale.ticks(count)
  
  return ticks.map((date: Date) => ({
    position: scale(date),
    date,
    label: date.toLocaleDateString()
  }))
}

/**
 * Create a zoom transform for the scale
 */
export function createZoomTransform(
  scale: ScaleTime<number, number>,
  zoomFactor: number,
  centerDate?: Date
): ScaleTime<number, number> {
  const domain = scale.domain()
  const range = scale.range()
  
  // Calculate new domain based on zoom
  const span = domain[1].getTime() - domain[0].getTime()
  const newSpan = span / zoomFactor
  
  // Center around a specific date or middle of domain
  const center = centerDate || new Date((domain[0].getTime() + domain[1].getTime()) / 2)
  const centerTime = center.getTime()
  
  const newStart = new Date(centerTime - newSpan / 2)
  const newEnd = new Date(centerTime + newSpan / 2)
  
  // Create new scale with zoomed domain
  return scaleTime()
    .domain([newStart, newEnd])
    .range(range)
}

/**
 * Get the current zoom level (1 = default, 2 = 2x zoomed in, 0.5 = 2x zoomed out)
 */
export function getZoomLevel(
  scale: ScaleTime<number, number>,
  originalScale: ScaleTime<number, number>
): number {
  const currentSpan = scale.domain()[1].getTime() - scale.domain()[0].getTime()
  const originalSpan = originalScale.domain()[1].getTime() - originalScale.domain()[0].getTime()
  
  return originalSpan / currentSpan
}

