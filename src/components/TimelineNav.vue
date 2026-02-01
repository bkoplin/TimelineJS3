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

const navClasses = computed(() => ({
  [`timenav-${props.position}`]: true
}))

const navStyle = computed(() => ({
  height: `${props.options.timenav_height}px`
}))

function getMarkerStyle(index: number) {
  // Simplified positioning - in full implementation, calculate based on actual dates
  const totalEvents = props.events.length
  const position = (index / totalEvents) * 100
  return {
    left: `${position}%`
  }
}

function getEraStyle(era: TimelineEra) {
  // Simplified - in full implementation, calculate based on dates
  return {
    left: '0%',
    width: '20%'
  }
}

function formatDate(date: TimelineDate): string {
  if (!date) return ''
  const parts = []
  if (date.month) parts.push(date.month)
  if (date.day) parts.push(date.day)
  if (date.year) parts.push(date.year)
  return parts.join('/')
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
    
    .marker-flag {
      background: white;
      border: 2px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      min-width: 100px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      
      .marker-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .marker-headline {
          font-weight: bold;
          font-size: 12px;
        }
        
        .marker-date {
          font-size: 10px;
          color: #666;
        }
      }
    }
    
    &:hover .marker-flag {
      border-color: #666;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &.marker-active .marker-flag {
      border-color: #c34528;
      background-color: #fef5f2;
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
      
      &:hover {
        background-color: #f0f0f0;
      }
      
      i {
        font-size: 12px;
      }
    }
  }
}
</style>
