<template>
  <div 
    class="timeline-nav"
    :class="navClasses"
    :style="navStyle"
  >
    <div class="timenav-content">
      <div class="timenav-line"></div>
      
      <div class="timenav-markers">
        <div
          v-for="(event, index) in events"
          :key="event.unique_id || index"
          class="timenav-marker"
          :class="{ 'marker-active': index === currentIndex }"
          :style="getMarkerStyle(index)"
          @click="$emit('marker-click', event.unique_id || `event-${index}`)"
        >
          <div class="marker-flag">
            <div class="marker-content">
              <span class="marker-headline">{{ event.text?.headline || 'Event' }}</span>
              <span class="marker-date">{{ formatDate(event.start_date) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="eras && eras.length" class="timenav-eras">
        <div
          v-for="(era, index) in eras"
          :key="era.unique_id || index"
          class="timenav-era"
          :style="getEraStyle(era)"
        >
          {{ era.text?.headline }}
        </div>
      </div>
      
      <div class="timenav-zoom">
        <button @click="$emit('zoom-in')" class="zoom-button">
          <i class="fa fa-plus"></i>
        </button>
        <button @click="$emit('zoom-out')" class="zoom-button">
          <i class="fa fa-minus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEvent, TimelineEra, TimelineOptions, TimelineDate } from '@/types/timeline'
import { useTimelinePositioning } from '@/composables/useTimelinePositioning'
import { formatDate as formatDateUtil } from '@/utils/date'

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

function formatDate(date: TimelineDate): string {
  return formatDateUtil(date)
}
</script>

<style lang="scss" scoped>
.timeline-nav {
  width: 100%;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
  position: relative;
  
  &.timenav-top {
    order: -1;
    border-top: none;
    border-bottom: 1px solid #ddd;
  }
  
  .timenav-content {
    position: relative;
    height: 100%;
    padding: 20px 40px;
  }
  
  .timenav-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #ccc;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .timenav-markers {
    position: relative;
    height: 100%;
  }
  
  .timenav-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    
    .marker-flag {
      background: white;
      border: 2px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      min-width: 100px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      
      .marker-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .marker-headline {
          font-weight: bold;
          font-size: 12px;
          transition: font-size 0.2s;
        }
        
        .marker-date {
          font-size: 10px;
          color: #666;
          transition: color 0.2s;
        }
      }
    }
    
    &:hover .marker-flag {
      border-color: #666;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: scale(1.05);
      
      .marker-headline {
        font-size: 13px;
      }
    }
    
    &.marker-active .marker-flag {
      border-color: #c34528;
      background-color: #fef5f2;
      box-shadow: 0 4px 12px rgba(195, 69, 40, 0.3);
      transform: scale(1.1);
      
      .marker-headline {
        color: #c34528;
      }
    }
  }
  
  .timenav-eras {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
  }
  
  .timenav-era {
    position: absolute;
    height: 100%;
    background-color: rgba(200, 200, 200, 0.2);
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #666;
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .timenav-zoom {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 4px;
    
    .zoom-button {
      width: 30px;
      height: 30px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
      
      &:hover {
        background-color: #f0f0f0;
        transform: scale(1.1);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      i {
        font-size: 12px;
      }
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .timeline-nav {
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
}
</style>
