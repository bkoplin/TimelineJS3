<template>
  <div 
    class="w-full bg-#f9f9f9 border-t border-#ddd relative timeline-nav"
    :class="navClasses"
    :style="navStyle"
  >
    <div class="relative h-full px-10 py-5">
      <div class="timenav-line absolute top-1/2 left-0 right-0 h-2px bg-#ccc"></div>
      
      <div class="relative h-full">
        <div
          v-for="marker in virtualMarkers.visibleMarkers.value"
          :key="marker.key"
          class="timenav-marker absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          :class="{ 'marker-active': marker.index === currentIndex }"
          :style="getMarkerStyle(marker.index)"
          @click="$emit('marker-click', marker.key)"
        >
          <div class="marker-flag bg-white border-2 border-#ccc rounded px-3 py-2 min-w-100px shadow">
            <div class="flex flex-col gap-1">
              <span class="marker-headline font-bold text-12px">{{ marker.event.text?.headline || 'Event' }}</span>
              <span class="marker-date text-10px text-#666">{{ formatMarkerDate(marker.event.start_date) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Virtual scrolling stats (dev mode) -->
      <div v-if="options.debug && virtualMarkers.isVirtualEnabled.value" class="absolute top-2.5 right-2.5 bg-black/70 text-white px-2 py-1 rounded text-11px font-mono pointer-events-none z-1000">
        Virtual Markers: {{ virtualMarkers.stats.value.rendered }}/{{ virtualMarkers.stats.value.total }}
        ({{ virtualMarkers.stats.value.memoryReduction }}% reduction)
      </div>
      
      <div v-if="eras && eras.length" class="absolute top-0 left-0 right-0 h-full pointer-events-none">
        <div
          v-for="(era, index) in eras"
          :key="era.unique_id || index"
          class="timenav-era absolute h-full bg-#c8c8c8/20 border-l border-r border-#ccc flex items-center justify-center text-12px text-#666"
          :style="getEraStyle(era)"
        >
          {{ era.text?.headline }}
        </div>
      </div>
      
      <div class="absolute bottom-2.5 right-2.5 flex gap-1">
        <button @click="$emit('zoom-in')" class="zoom-button w-30px h-30px bg-white border border-#ccc rounded cursor-pointer flex items-center justify-center">
          <i class="fa fa-plus text-12px"></i>
        </button>
        <button @click="$emit('zoom-out')" class="zoom-button w-30px h-30px bg-white border border-#ccc rounded cursor-pointer flex items-center justify-center">
          <i class="fa fa-minus text-12px"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { TimelineEvent, TimelineEra, TimelineOptions, FlexibleDate } from '@/types/timeline'
import { useTimelinePositioning } from '@/composables/useTimelinePositioning'
import { useVirtualMarkers } from '@/composables/useVirtualMarkers'
import { formatDate as formatDateUtil, parseFlexibleDate } from '@/utils/date'

interface Props {
  events: readonly TimelineEvent[]
  eras?: readonly TimelineEra[]
  currentIndex: number
  options: TimelineOptions
  position: 'top' | 'bottom'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'marker-click': [id: string]
  'zoom-in': []
  'zoom-out': []
}>()

// Use D3-based positioning composable
const positioning = useTimelinePositioning(
  () => props.events,
  () => props.options
)

// Use virtual markers composable
const virtualMarkers = useVirtualMarkers(
  toRef(() => props.events),
  positioning.scale,
  toRef(() => props.options)
)

const navClasses = computed(() => ({
  [`timenav-${props.position}`]: true
}))

const navStyle = computed(() => ({
  height: `${props.options.timenav_height}px`
}))

/**
 * Get marker style using percentage from D3 scale
 */
function getMarkerStyle(index: number) {
  const percentage = positioning.getEventPercentage(index)
  return {
    left: `${percentage}%`
  }
}

/**
 * Get era style using D3 scale calculations
 */
function getEraStyle(era: TimelineEra) {
  const eraPos = positioning.getEraPosition(era)
  return {
    left: `${eraPos.percentage}%`,
    width: `${eraPos.percentageWidth}%`
  }
}

function formatMarkerDate(date: FlexibleDate): string {
  const timelineDate = parseFlexibleDate(date)
  return formatDateUtil(timelineDate)
}

// Expose stats for debugging
defineExpose({
  virtualStats: virtualMarkers.stats
})
</script>

<style scoped>
.timeline-nav.timenav-top {
  order: -1;
  border-top: none;
  border-bottom: 1px solid #ddd;
}

.timenav-line {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.timenav-marker {
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.marker-flag {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.marker-headline {
  transition: font-size 0.2s;
}

.marker-date {
  transition: color 0.2s;
}

.timenav-marker:hover .marker-flag {
  border-color: #666;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.timenav-marker:hover .marker-headline {
  font-size: 13px;
}

.timenav-marker.marker-active .marker-flag {
  border-color: #c34528;
  background-color: #fef5f2;
  box-shadow: 0 4px 12px rgba(195, 69, 40, 0.3);
  transform: scale(1.1);
}

.timenav-marker.marker-active .marker-headline {
  color: #c34528;
}

.timenav-era {
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.zoom-button {
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.zoom-button:hover {
  background-color: #f0f0f0;
  transform: scale(1.1);
}

.zoom-button:active {
  transform: scale(0.95);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .timenav-line,
  .timenav-marker,
  .marker-flag,
  .marker-headline,
  .marker-date,
  .timenav-era,
  .zoom-button {
    transition: none !important;
  }
  
  .timenav-marker:hover .marker-flag,
  .timenav-marker.marker-active .marker-flag {
    transform: none;
  }
  
  .zoom-button:hover,
  .zoom-button:active {
    transform: none;
  }
}
</style>
