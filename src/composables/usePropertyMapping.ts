/**
 * Property Mapping Composable
 * Allows users to map their custom event objects to timeline format
 */
import type { TimelinePropertyMapping, TimelineEvent, TimelineDate } from '@/types/timeline'

export function usePropertyMapping(mapping?: TimelinePropertyMapping) {
  /**
   * Map a custom event object to TimelineEvent format
   */
  function mapEvent(customEvent: Record<string, any>): TimelineEvent {
    if (!mapping?.event) {
      // No mapping provided, assume it's already in correct format
      return customEvent as TimelineEvent
    }
    
    const m = mapping.event
    const dateMapping = mapping.date
    
    const mapDate = (dateObj: any): TimelineDate => {
      if (!dateMapping) return dateObj
      
      return {
        year: dateObj[dateMapping.year || 'year'],
        month: dateObj[dateMapping.month || 'month'],
        day: dateObj[dateMapping.day || 'day'],
        hour: dateObj[dateMapping.hour || 'hour'],
        minute: dateObj[dateMapping.minute || 'minute'],
        second: dateObj[dateMapping.second || 'second']
      }
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
    
    return mapped
  }
  
  /**
   * Map an array of custom events
   */
  function mapEvents(customEvents: Record<string, any>[]): TimelineEvent[] {
    return customEvents.map(mapEvent)
  }
  
  return {
    mapEvent,
    mapEvents
  }
}
