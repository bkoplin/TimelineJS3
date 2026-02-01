/**
 * Date Utilities for VueTimelineJS3
 * Enhanced with multiple date format support and automatic precision detection
 */

import type { TimelineDate, DatePrecision } from '@/types/timeline'

export type DateScale = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'decade' | 'century' | 'millennium'
export type CosmologicalScale = 'age' | 'epoch' | 'era' | 'eon'

/**
 * Type for flexible date input - accepts multiple formats
 */
export type FlexibleDateInput = TimelineDate | Date | string | number

// Scales from most precise to least precise
export const SCALES: Array<[DateScale, number]> = [
  ['millisecond', 1],
  ['second', 1000],
  ['minute', 1000 * 60],
  ['hour', 1000 * 60 * 60],
  ['day', 1000 * 60 * 60 * 24],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['decade', 1000 * 60 * 60 * 24 * 365 * 10],
  ['century', 1000 * 60 * 60 * 24 * 365 * 100],
  ['millennium', 1000 * 60 * 60 * 24 * 365 * 1000]
]

// Cosmological scales (in years)
const AGE = 1000000
const EPOCH = AGE * 10
const ERA = EPOCH * 10
const EON = ERA * 10

export const COSMOLOGICAL_SCALES: Array<[CosmologicalScale, number]> = [
  ['age', AGE],
  ['epoch', EPOCH],
  ['era', ERA],
  ['eon', EON]
]

/**
 * Parse flexible date input into TimelineDate format
 * Accepts: Date objects, ISO strings, date strings, timestamps, or TimelineDate objects
 */
export function parseFlexibleDate(input: FlexibleDateInput): TimelineDate {
  // Already a TimelineDate object
  if (typeof input === 'object' && input !== null && 'year' in input) {
    return input as TimelineDate
  }
  
  // JavaScript Date object
  if (input instanceof Date) {
    return jsDateToTimelineDate(input)
  }
  
  // Timestamp (number)
  if (typeof input === 'number') {
    return jsDateToTimelineDate(new Date(input))
  }
  
  // String (ISO date, date string, etc.)
  if (typeof input === 'string') {
    return parseDateString(input)
  }
  
  throw new Error(`Unable to parse date: ${input}`)
}

/**
 * Convert JavaScript Date to TimelineDate
 */
export function jsDateToTimelineDate(date: Date): TimelineDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds()
  }
}

/**
 * Parse date string into TimelineDate
 * Handles ISO datetime strings, date strings, etc.
 */
export function parseDateString(dateString: string): TimelineDate {
  // Try parsing as ISO datetime or general date string
  const parsedDate = new Date(dateString)
  
  if (!isNaN(parsedDate.getTime())) {
    return jsDateToTimelineDate(parsedDate)
  }
  
  // If that fails, try to parse manually
  // Simple YYYY-MM-DD format
  const simpleMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (simpleMatch) {
    return {
      year: parseInt(simpleMatch[1]),
      month: parseInt(simpleMatch[2]),
      day: parseInt(simpleMatch[3])
    }
  }
  
  // Just a year
  const yearMatch = dateString.match(/^(\d{4})$/)
  if (yearMatch) {
    return {
      year: parseInt(yearMatch[1])
    }
  }
  
  throw new Error(`Unable to parse date string: ${dateString}`)
}

/**
 * Determine precision level from TimelineDate
 * Auto-detects based on available fields and rules:
 * - No time components or only minute set → day precision
 * - Has hour/minute/second → appropriate precision
 */
export function determineDatePrecision(date: TimelineDate): DatePrecision {
  // Check if any time components are set (and not zero)
  const hasMillisecond = date.millisecond !== undefined && date.millisecond !== 0
  const hasSecond = date.second !== undefined && date.second !== 0
  const hasMinute = date.minute !== undefined && date.minute !== 0
  const hasHour = date.hour !== undefined && date.hour !== 0
  
  // If only minute is set (no hour, second, millisecond), use day precision
  if (hasMinute && !hasHour && !hasSecond && !hasMillisecond) {
    return 'day'
  }
  
  // If no time components at all, use day precision
  if (!hasHour && !hasMinute && !hasSecond && !hasMillisecond) {
    return 'day'
  }
  
  // Otherwise determine by most precise component
  if (hasMillisecond) return 'millisecond'
  if (hasSecond) return 'second'
  if (hasMinute) return 'minute'
  if (hasHour) return 'hour'
  
  // Check date components
  const hasDay = date.day !== undefined && date.day !== 0
  const hasMonth = date.month !== undefined && date.month !== 0
  
  if (hasDay) return 'day'
  if (hasMonth) return 'month'
  
  return 'year'
}

/**
 * Convert TimelineDate to JavaScript Date
 */
export function timelineDateToJSDate(date: TimelineDate): Date {
  const year = typeof date.year === 'string' ? parseInt(date.year) : date.year
  const month = date.month ? (typeof date.month === 'string' ? parseInt(date.month) : date.month) - 1 : 0
  const day = date.day ? (typeof date.day === 'string' ? parseInt(date.day) : date.day) : 1
  const hour = date.hour ? (typeof date.hour === 'string' ? parseInt(date.hour) : date.hour) : 0
  const minute = date.minute ? (typeof date.minute === 'string' ? parseInt(date.minute) : date.minute) : 0
  const second = date.second ? (typeof date.second === 'string' ? parseInt(date.second) : date.second) : 0
  const millisecond = date.millisecond ? (typeof date.millisecond === 'string' ? parseInt(date.millisecond) : date.millisecond) : 0

  const jsDate = new Date(year, month, day, hour, minute, second, millisecond)
  
  // JavaScript has stupid defaults for two-digit years
  if (jsDate.getFullYear() !== year) {
    jsDate.setFullYear(year)
  }
  
  return jsDate
}

/**
 * Get timestamp from TimelineDate
 */
export function getTimeFromDate(date: TimelineDate): number {
  return timelineDateToJSDate(date).getTime()
}

/**
 * Compare two dates - returns true if date1 is before date2
 */
export function isBefore(date1: TimelineDate, date2: TimelineDate): boolean {
  return getTimeFromDate(date1) < getTimeFromDate(date2)
}

/**
 * Compare two dates - returns true if date1 is after date2
 */
export function isAfter(date1: TimelineDate, date2: TimelineDate): boolean {
  return getTimeFromDate(date1) > getTimeFromDate(date2)
}

/**
 * Get the full year from a date
 */
export function getFullYear(date: TimelineDate): number {
  const year = typeof date.year === 'string' ? parseInt(date.year) : date.year
  return year
}

/**
 * Floor a date to a given scale
 */
export function floorDate(date: TimelineDate, scale: DateScale): Date {
  const jsDate = new Date(timelineDateToJSDate(date))
  
  // Apply flooring based on scale
  switch (scale) {
    case 'millennium': {
      const year1000 = jsDate.getFullYear()
      jsDate.setFullYear(year1000 - (year1000 % 1000))
    }
    // eslint-disable-next-line no-fallthrough
    case 'century': {
      const year100 = jsDate.getFullYear()
      jsDate.setFullYear(year100 - (year100 % 100))
    }
    // eslint-disable-next-line no-fallthrough
    case 'decade': {
      const year10 = jsDate.getFullYear()
      jsDate.setFullYear(year10 - (year10 % 10))
    }
    // eslint-disable-next-line no-fallthrough
    case 'year':
      jsDate.setMonth(0)
    // eslint-disable-next-line no-fallthrough
    case 'month':
      jsDate.setDate(1)
    // eslint-disable-next-line no-fallthrough
    case 'day':
      jsDate.setHours(0)
    // eslint-disable-next-line no-fallthrough
    case 'hour':
      jsDate.setMinutes(0)
    // eslint-disable-next-line no-fallthrough
    case 'minute':
      jsDate.setSeconds(0)
    // eslint-disable-next-line no-fallthrough
    case 'second':
      jsDate.setMilliseconds(0)
      break
    case 'millisecond':
      // No flooring needed
      break
  }
  
  return jsDate
}

/**
 * Find the best scale for displaying a date
 */
export function findBestScale(date: TimelineDate): DateScale {
  // Check from most precise to least precise
  if (date.millisecond !== undefined && date.millisecond !== 0) return 'millisecond'
  if (date.second !== undefined && date.second !== 0) return 'second'
  if (date.minute !== undefined && date.minute !== 0) return 'minute'
  if (date.hour !== undefined && date.hour !== 0) return 'hour'
  if (date.day !== undefined && date.day !== 0 && date.day !== 1) return 'day'
  if (date.month !== undefined && date.month !== 0 && date.month !== 1) return 'month'
  return 'year'
}

/**
 * Format a date for display
 */
export function formatDate(date: TimelineDate, scale?: DateScale): string {
  const jsDate = timelineDateToJSDate(date)
  const displayScale = scale || findBestScale(date)
  
  switch (displayScale) {
    case 'millisecond':
    case 'second':
      return jsDate.toLocaleTimeString()
    case 'minute':
    case 'hour':
      return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    case 'day':
      return jsDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    case 'month':
      return jsDate.toLocaleDateString([], { month: 'short', year: 'numeric' })
    case 'year':
    case 'decade':
    case 'century':
    case 'millennium':
      return jsDate.getFullYear().toString()
    default:
      return jsDate.toLocaleDateString()
  }
}

/**
 * Sort an array of events by date
 */
export function sortEventsByDate<T extends { start_date: TimelineDate }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    if (isBefore(a.start_date, b.start_date)) return -1
    if (isAfter(a.start_date, b.start_date)) return 1
    return 0
  })
}

/**
 * Get the earliest date from an array of events
 */
export function getEarliestDate<T extends { start_date: TimelineDate }>(events: T[]): TimelineDate | null {
  if (events.length === 0) return null
  
  let earliest = events[0].start_date
  for (let i = 1; i < events.length; i++) {
    if (isBefore(events[i].start_date, earliest)) {
      earliest = events[i].start_date
    }
  }
  return earliest
}

/**
 * Get the latest date from an array of events
 */
export function getLatestDate<T extends { start_date: TimelineDate; end_date?: TimelineDate }>(events: T[]): TimelineDate | null {
  if (events.length === 0) return null
  
  let latest = events[0].end_date || events[0].start_date
  for (let i = 1; i < events.length; i++) {
    const eventLatest = events[i].end_date || events[i].start_date
    if (isAfter(eventLatest, latest)) {
      latest = eventLatest
    }
  }
  return latest
}

/**
 * Calculate the span in milliseconds between two dates
 */
export function getDateSpan(start: TimelineDate, end: TimelineDate): number {
  return getTimeFromDate(end) - getTimeFromDate(start)
}

/**
 * Determine the optimal scale for a given span
 */
export function getOptimalScale(spanInMillis: number): DateScale {
  for (let i = SCALES.length - 1; i >= 0; i--) {
    const [scale, millisPerUnit] = SCALES[i]
    if (spanInMillis >= millisPerUnit * 2) {
      return scale
    }
  }
  return 'millisecond'
}
