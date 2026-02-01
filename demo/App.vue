<template>
  <div class="demo-app">
    <h1>VueTimelineJS3 Demo</h1>
    
    <div class="controls">
      <h2>Navigation Controls</h2>
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="keyboardEnabled" />
          Keyboard Navigation (Arrow keys, Home/End)
        </label>
        <label>
          <input type="checkbox" v-model="touchEnabled" />
          Touch Navigation (Swipe left/right)
        </label>
      </div>
      <div class="instructions">
        <p><strong>Keyboard:</strong> Use ← → arrow keys to navigate, Home/End for first/last</p>
        <p><strong>Touch:</strong> Swipe left/right to navigate between slides</p>
        <p><strong>Zoom:</strong> Swipe up/down or use Ctrl/Cmd + +/- keys</p>
      </div>
    </div>
    
    <VueTimelineJS3
      ref="timelineRef"
      :data="timelineData"
      :options="timelineOptions"
      @ready="onReady"
      @change="onChange"
      @keyboard_navigation="onKeyboardNav"
      @swipe_left="onSwipeLeft"
      @swipe_right="onSwipeRight"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueTimelineJS3 } from '../src/index'
import type { TimelineData, TimelineOptions } from '../src/types/timeline'

const timelineRef = ref<InstanceType<typeof VueTimelineJS3> | null>(null)
const keyboardEnabled = ref(true)
const touchEnabled = ref(true)

const timelineData = ref<TimelineData>({
  title: {
    text: {
      headline: "Welcome to VueTimelineJS3",
      text: "A modern Vue 3 + TypeScript timeline component with keyboard and touch navigation"
    }
  },
  events: [
    {
      start_date: {
        year: 2020,
        month: 1,
        day: 1
      },
      text: {
        headline: "First Event",
        text: "This is the first event in the timeline. Try using arrow keys or swiping!"
      },
      media: {
        url: "https://via.placeholder.com/800x400",
        caption: "Placeholder image",
        credit: "Placeholder.com"
      },
      unique_id: "event-1"
    },
    {
      start_date: {
        year: 2021,
        month: 6,
        day: 15
      },
      text: {
        headline: "Second Event",
        text: "Navigate to this event using keyboard arrows or touch swipe gestures"
      },
      unique_id: "event-2"
    },
    {
      start_date: {
        year: 2022,
        month: 12,
        day: 25
      },
      end_date: {
        year: 2023,
        month: 1,
        day: 10
      },
      text: {
        headline: "Third Event with Duration",
        text: "This event spans multiple days. Press Home/End keys to jump to start/end"
      },
      unique_id: "event-3"
    },
    {
      start_date: {
        year: 2023,
        month: 8,
        day: 20
      },
      text: {
        headline: "Fourth Event",
        text: "Test swipe up/down for zoom controls on touch devices"
      },
      unique_id: "event-4"
    }
  ]
})

const timelineOptions = computed<Partial<TimelineOptions>>(() => ({
  height: 600,
  timenav_position: 'bottom',
  menubar_height: 40,
  // D3 Scale configuration - transparent control
  timeline_padding: 0.1,  // 10% padding on each side
  axis_tick_count: 8,     // Number of axis ticks
  scale_config: {
    screenMultiplier: 3   // 3x display width for scrolling
  },
  // Animation configuration
  animations_enabled: true,
  animation_duration: 600,
  animation_easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  respect_reduced_motion: true,
  // Navigation configuration
  keyboard_navigation_enabled: keyboardEnabled.value,
  touch_navigation_enabled: touchEnabled.value,
  swipe_min_distance: 50,
  swipe_velocity_threshold: 0.3
}))

function onReady() {
  console.log('Timeline is ready!')
}

function onChange(data: any) {
  console.log('Slide changed:', data)
}

function onKeyboardNav(data: any) {
  console.log('Keyboard navigation:', data)
}

function onSwipeLeft() {
  console.log('Swiped left - next slide')
}

function onSwipeRight() {
  console.log('Swiped right - previous slide')
}
</script>

<style scoped>
.demo-app {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.controls {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.controls h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #495057;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

.control-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.instructions {
  background: #e9ecef;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.instructions p {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #495057;
}

.instructions strong {
  color: #212529;
  font-weight: 600;
}
</style>
