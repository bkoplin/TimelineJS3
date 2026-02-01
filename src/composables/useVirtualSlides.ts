import { computed, type Ref } from 'vue'
import type { TimelineEvent, TimelineTitle, TimelineOptions } from '@/types/timeline'

/**
 * Composable for virtual scrolling of timeline slides
 * Only renders visible slides + buffer for performance with large datasets
 */
export function useVirtualSlides(
  events: Ref<readonly TimelineEvent[]>,
  title: Ref<TimelineTitle | undefined>,
  currentIndex: Ref<number>,
  options: Ref<TimelineOptions>
) {
  // Configuration
  const bufferSize = computed(() => options.value.virtual_buffer_size ?? 2)
  const threshold = computed(() => options.value.virtual_threshold ?? 50)
  
  // Determine if virtual scrolling should be enabled
  const isVirtualEnabled = computed(() => {
    if (options.value.virtual_scrolling_enabled !== undefined) {
      return options.value.virtual_scrolling_enabled
    }
    // Auto-enable for large datasets
    const totalItems = events.value.length + (title.value ? 1 : 0)
    return totalItems >= threshold.value
  })
  
  // Calculate total slides
  const totalSlides = computed(() => {
    return events.value.length + (title.value ? 1 : 0)
  })
  
  // Calculate visible slide range
  const visibleRange = computed(() => {
    if (!isVirtualEnabled.value) {
      // Return all slides if virtual scrolling disabled
      return {
        start: 0,
        end: totalSlides.value
      }
    }
    
    const buffer = bufferSize.value
    const start = Math.max(0, currentIndex.value - buffer)
    const end = Math.min(totalSlides.value, currentIndex.value + buffer + 1)
    
    return { start, end }
  })
  
  // Get visible slides (title + events in range)
  const visibleSlides = computed(() => {
    const range = visibleRange.value
    const slides: Array<{ type: 'title' | 'event', data: TimelineTitle | TimelineEvent, index: number, key: string }> = []
    
    // Add title if in range
    if (title.value && range.start === 0) {
      slides.push({
        type: 'title',
        data: title.value,
        index: 0,
        key: 'title'
      })
    }
    
    // Add events in visible range
    const titleOffset = title.value ? 1 : 0
    const eventStartIndex = Math.max(0, range.start - titleOffset)
    const eventEndIndex = Math.min(events.value.length, range.end - titleOffset)
    
    for (let i = eventStartIndex; i < eventEndIndex; i++) {
      const event = events.value[i]
      slides.push({
        type: 'event',
        data: event as TimelineEvent,
        index: i + titleOffset,
        key: event.unique_id || `event-${i}`
      })
    }
    
    return slides
  })
  
  // Calculate transform offset for virtual scrolling
  const transformOffset = computed(() => {
    if (!isVirtualEnabled.value) {
      return currentIndex.value * 100
    }
    
    // Calculate the offset based on how many slides are before the visible range
    const range = visibleRange.value
    const slidesBefore = currentIndex.value - range.start
    return slidesBefore * 100
  })
  
  // Statistics for debugging
  const stats = computed(() => ({
    total: totalSlides.value,
    rendered: visibleSlides.value.length,
    virtualEnabled: isVirtualEnabled.value,
    range: visibleRange.value,
    currentIndex: currentIndex.value,
    bufferSize: bufferSize.value,
    memoryReduction: isVirtualEnabled.value 
      ? Math.round((1 - visibleSlides.value.length / totalSlides.value) * 100)
      : 0
  }))
  
  return {
    isVirtualEnabled,
    visibleSlides,
    visibleRange,
    transformOffset,
    totalSlides,
    stats
  }
}
