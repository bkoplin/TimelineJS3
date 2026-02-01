import { computed, ref, type Ref } from 'vue'
import type { TimelineEvent, TimelineOptions } from '@/types/timeline'
import type { ScaleTime } from 'd3-scale'

/**
 * Composable for virtual rendering of timeline markers
 * Only renders markers visible in the current viewport for performance
 */
export function useVirtualMarkers(
  events: Ref<readonly TimelineEvent[]>,
  scale: Ref<ScaleTime<number, number> | null>,
  options: Ref<TimelineOptions>
) {
  // Configuration
  const threshold = computed(() => options.value.virtual_marker_threshold ?? 100)
  
  // Viewport tracking
  const viewportStart = ref(0)
  const viewportEnd = ref(100)
  
  // Determine if virtual markers should be enabled
  const isVirtualEnabled = computed(() => {
    if (options.value.virtual_markers_enabled !== undefined) {
      return options.value.virtual_markers_enabled
    }
    // Auto-enable for large datasets
    return events.value.length >= threshold.value
  })
  
  // Calculate visible markers based on viewport
  const visibleMarkers = computed(() => {
    if (!isVirtualEnabled.value || !scale.value) {
      // Return all markers if virtual rendering disabled or scale not ready
      return events.value.map((event, index) => ({
        event,
        index,
        key: event.unique_id || `marker-${index}`
      }))
    }
    
    // Filter markers to only those in viewport (with some buffer)
    const buffer = 10 // 10% buffer on each side
    const start = viewportStart.value - buffer
    const end = viewportEnd.value + buffer
    
    return events.value
      .map((event, index) => ({
        event,
        index,
        key: event.unique_id || `marker-${index}`,
        // Calculate position percentage (will be computed in component)
        position: 0 // Placeholder, computed in component
      }))
      .filter((_item, index) => {
        // For now, use simple percentage-based filtering
        // This will be refined with actual scale calculations
        const percentage = (index / events.value.length) * 100
        return percentage >= start && percentage <= end
      })
  })
  
  // Update viewport based on zoom/pan
  function updateViewport(start: number, end: number) {
    viewportStart.value = Math.max(0, start)
    viewportEnd.value = Math.min(100, end)
  }
  
  // Statistics
  const stats = computed(() => ({
    total: events.value.length,
    rendered: visibleMarkers.value.length,
    virtualEnabled: isVirtualEnabled.value,
    viewport: {
      start: viewportStart.value,
      end: viewportEnd.value
    },
    memoryReduction: isVirtualEnabled.value
      ? Math.round((1 - visibleMarkers.value.length / events.value.length) * 100)
      : 0
  }))
  
  return {
    isVirtualEnabled,
    visibleMarkers,
    updateViewport,
    stats
  }
}
