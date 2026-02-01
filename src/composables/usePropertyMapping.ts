/**
 * Property Mapping Composable
 * Allows users to map their custom event objects to timeline format
 * Enhanced with flexible date parsing support
 */
import type { TimelinePropertyMapping, TimelineEvent, TimelineDate, FlexibleDate } from '@/types/timeline'
import { parseFlexibleDate } from '@/utils/date'

export function usePropertyMapping(mapping?: TimelinePropertyMapping) {
  /**
   * Map a custom event object to TimelineEvent format
   */
  function mapEvent(customEvent: Record<string, any>): TimelineEvent {
    if (!mapping?.event) {
      // No mapping provided, normalize dates if needed
      return normalizeEventDates(customEvent as TimelineEvent)
    }
    
    const m = mapping.event
    const dateMapping = mapping.date
    
    const mapDate = (dateValue: any): TimelineDate => {
      // If date mapping is provided and dateValue is an object, map its properties
      if (dateMapping && typeof dateValue === 'object' && dateValue !== null && !('year' in dateValue) && !(dateValue instanceof Date)) {
        return {
          year: dateValue[dateMapping.year || 'year'],
          month: dateValue[dateMapping.month || 'month'],
          day: dateValue[dateMapping.day || 'day'],
          hour: dateValue[dateMapping.hour || 'hour'],
          minute: dateValue[dateMapping.minute || 'minute'],
          second: dateValue[dateMapping.second || 'second'],
          millisecond: dateValue[dateMapping.millisecond || 'millisecond']
        }
      }
      
      // Otherwise, use flexible date parsing
      return parseFlexibleDate(dateValue)
    }
    
    const mapped: TimelineEvent = {
      start_date: mapDate(customEvent[m.startDate || 'start_date']),
      unique_id: customEvent[m.uniqueId || 'unique_id']
    }
    
    if (customEvent[m.endDate || 'end_date']) {
      mapped.end_date = mapDate(customEvent[m.endDate || 'end_date'])
    }
    
    if (customEvent[m.headline || 'headline'] || customEvent[m.text || 'text']) {
      mapped.text = {
        headline: customEvent[m.headline || 'headline'],
        text: customEvent[m.text || 'text']
      }
    }
    
    if (customEvent[m.media || 'media']) {
      mapped.media = customEvent[m.media || 'media']
    }
    
    if (customEvent[m.group || 'group']) {
      mapped.group = customEvent[m.group || 'group']
    }
    
    // NEW: Support precision mapping
    if (customEvent[m.precision || 'precision']) {
      mapped.precision = customEvent[m.precision || 'precision']
    }
    
    return mapped
  }
  
  /**
   * Normalize event dates - parse flexible formats
   */
  function normalizeEventDates(event: TimelineEvent): TimelineEvent {
    return {
      ...event,
      start_date: parseFlexibleDate(event.start_date as FlexibleDate),
      end_date: event.end_date ? parseFlexibleDate(event.end_date as FlexibleDate) : undefined
    }
  }
  
  /**
   * Map an array of custom events
   */
  function mapEvents(customEvents: Record<string, any>[]): TimelineEvent[] {
    return customEvents.map(mapEvent)
  }
  
  return {
    mapEvent,
    mapEvents,
    normalizeEventDates
  }
}
