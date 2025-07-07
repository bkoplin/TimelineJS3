/**
 * DateParser utility for converting raw date inputs to moment objects
 */

import moment, { type Moment } from 'moment'
import { TLError } from './TLError'
import type { RawDateInput } from '../types'

export class DateParser {
  /**
   * Parse a raw date input into a moment object
   */
  static parseDate(input: RawDateInput | string | number | Date): Moment {
    // Handle different input types
    if (typeof input === 'string' || typeof input === 'number' || input instanceof Date) {
      const parsed = moment(input)
      if (!parsed.isValid()) {
        throw new TLError('invalid_date_err', String(input))
      }
      return parsed
    }

    // Handle object-based date input
    if (typeof input === 'object' && input !== null) {
      // If it's already a moment object, return it
      if (moment.isMoment(input)) {
        return input
      }

      // Create moment object from year/month/day components first
      const year = input.year ? parseInt(String(input.year)) : 1
      const month = input.month ? parseInt(String(input.month)) - 1 : 0 // moment months are 0-indexed
      const day = input.day ? parseInt(String(input.day)) : 1
      const hour = input.hour ? parseInt(String(input.hour)) : 0
      const minute = input.minute ? parseInt(String(input.minute)) : 0
      const second = input.second ? parseInt(String(input.second)) : 0
      const millisecond = input.millisecond ? parseInt(String(input.millisecond)) : 0

      // Validate numeric inputs
      if (isNaN(year)) {
        throw new TLError('invalid_date_err', `Invalid year: ${input.year}`)
      }

      // Create moment object
      const parsed = moment({
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond
      })

      if (!parsed.isValid()) {
        throw new TLError('invalid_date_err', JSON.stringify(input))
      }

      // Store display_date if provided for later use
      if (input.display_date) {
        (parsed as any)._displayDate = input.display_date
      }

      return parsed
    }

    throw new TLError('invalid_date_err', JSON.stringify(input))
  }

  /**
   * Convert a moment object back to a raw date input format
   */
  static momentToRawDate(date: Moment): RawDateInput {
    return {
      year: date.year(),
      month: date.month() + 1, // Convert back to 1-indexed
      day: date.date(),
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
      millisecond: date.millisecond()
    }
  }

  /**
   * Format a moment object for display
   */
  static formatDate(date: Moment, format?: string): string {
    if (!moment.isMoment(date)) {
      throw new TLError('invalid_date_err', 'Expected moment object')
    }

    // Use provided format or default
    const formatString = format || 'MMMM D, YYYY'
    return date.format(formatString)
  }

  /**
   * Compare two moment objects
   */
  static isBefore(date1: Moment, date2: Moment): boolean {
    return date1.isBefore(date2)
  }

  /**
   * Compare two moment objects
   */
  static isAfter(date1: Moment, date2: Moment): boolean {
    return date1.isAfter(date2)
  }

  /**
   * Check if two moment objects are the same
   */
  static isSame(date1: Moment, date2: Moment): boolean {
    return date1.isSame(date2)
  }

  /**
   * Get the difference between two moment objects
   */
  static diff(date1: Moment, date2: Moment, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' = 'days'): number {
    return date1.diff(date2, unit)
  }

  /**
   * Create a moment object from the current time
   */
  static now(): Moment {
    return moment()
  }

  /**
   * Clone a moment object
   */
  static clone(date: Moment): Moment {
    return date.clone()
  }
}
