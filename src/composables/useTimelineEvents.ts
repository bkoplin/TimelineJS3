/**
 * Timeline Events Composable
 * Replaces the old Events mixin with Vue 3 composition API
 */
import { getCurrentInstance } from 'vue'
import type { TimelineEmits } from '@/types/timeline'

export function useTimelineEvents() {
  const instance = getCurrentInstance()
  
  /**
   * Emit a timeline event
   */
  function emitEvent<K extends keyof TimelineEmits>(
    eventName: K,
    data?: Parameters<TimelineEmits[K]>[0]
  ) {
    if (instance) {
      instance.emit(eventName, data)
    }
  }

  return {
    emitEvent
  }
}
