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
      
      <h2>Icon Customization</h2>
      <div class="control-group">
        <label>
          <input type="radio" value="fontawesome" v-model="iconSet" />
          Font Awesome Icons (Default)
        </label>
        <label>
          <input type="radio" value="emoji" v-model="iconSet" />
          Emoji Icons
        </label>
        <label>
          <input type="radio" value="custom" v-model="iconSet" />
          Custom SVG Icons
        </label>
      </div>
      
      <div class="instructions">
        <p><strong>Date Formats Shown:</strong></p>
        <ul>
          <li>Event 1: Standard object ({year, month, day})</li>
          <li>Event 2: ISO datetime string</li>
          <li>Event 3: JavaScript Date objects</li>
          <li>Event 4: Simple date string (YYYY-MM-DD)</li>
          <li>Event 5: Unix timestamp</li>
          <li>Event 6: Hour precision</li>
          <li>Event 7: Auto day precision (minute without hour)</li>
        </ul>
        <p><strong>Keyboard:</strong> Use ← → arrow keys to navigate, Home/End for first/last</p>
        <p><strong>Touch:</strong> Swipe left/right to navigate between slides</p>
        <p><strong>Icons:</strong> Change icon sets above to see customization in action</p>
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
const iconSet = ref<'fontawesome' | 'emoji' | 'custom'>('fontawesome')

// Icon definitions for different sets
const emojiIcons = {
  zoomIn: '🔍+',
  zoomOut: '🔍−',
  goToStart: '⏮️',
  goToEnd: '⏭️',
  nextSlide: '▶️',
  prevSlide: '◀️',
  loading: '⏳',
  error: '❌',
  info: 'ℹ️'
}

const customSvgIcons = {
  zoomIn: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" stroke-width="2"/><line x1="6" y1="4" x2="6" y2="8" stroke="currentColor" stroke-width="2"/><line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" stroke-width="2"/></svg>' },
  zoomOut: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" stroke-width="2"/><line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" stroke-width="2"/></svg>' },
  goToStart: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2v12l-8-6z M2 2h2v12H2z" fill="currentColor"/></svg>' },
  goToEnd: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2v12l8-6z M12 2h2v12h-2z" fill="currentColor"/></svg>' },
  nextSlide: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2v12l8-6z" fill="currentColor"/></svg>' },
  prevSlide: { svg: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M12 2v12L4 8z" fill="currentColor"/></svg>' }
}

const timelineData = ref<TimelineData>({
  title: {
    text: {
      headline: "VueTimelineJS3 - Flexible Date Format Demo",
      text: "Demonstrating multiple date input formats and automatic precision detection"
    }
  },
  events: [
    {
      // Standard TimelineDate object
      start_date: {
        year: 2020,
        month: 1,
        day: 1
      },
      text: {
        headline: "Standard Date Object",
        text: "This event uses a standard TimelineDate object with year, month, day fields"
      },
      unique_id: "event-1",
      precision: 'day'
    },
    {
      // ISO datetime string
      start_date: '2021-06-15T14:30:00',
      text: {
        headline: "ISO Datetime String",
        text: "This event uses an ISO datetime string: '2021-06-15T14:30:00'"
      },
      unique_id: "event-2",
      precision: 'minute'
    },
    {
      // JavaScript Date object
      start_date: new Date(2022, 11, 25), // Note: month is 0-indexed in JS Date
      end_date: new Date(2023, 0, 10),
      text: {
        headline: "JavaScript Date Objects",
        text: "This event uses JavaScript Date objects for start and end dates"
      },
      unique_id: "event-3",
      precision: 'day'
    },
    {
      // Simple date string
      start_date: '2023-08-20',
      text: {
        headline: "Simple Date String",
        text: "This event uses a simple date string: '2023-08-20'"
      },
      unique_id: "event-4",
      precision: 'day'
    },
    {
      // Timestamp (number)
      start_date: 1704067200000, // Jan 1, 2024 00:00:00 GMT
      text: {
        headline: "Unix Timestamp",
        text: "This event uses a Unix timestamp (milliseconds): 1704067200000"
      },
      unique_id: "event-5",
      precision: 'day'
    },
    {
      // Date with hour precision
      start_date: {
        year: 2024,
        month: 3,
        day: 15,
        hour: 9
      },
      text: {
        headline: "Hour Precision",
        text: "This event specifies hour precision (9 AM)"
      },
      unique_id: "event-6",
      precision: 'hour'
    },
    {
      // Date with minute precision but no hour (auto-detected as day)
      start_date: {
        year: 2024,
        month: 6,
        day: 1,
        minute: 30
      },
      text: {
        headline: "Auto Day Precision",
        text: "This event has minute set but no hour - auto-detected as day precision per spec"
      },
      unique_id: "event-7"
      // precision auto-detected as 'day'
    }
  ]
})

const timelineOptions = computed<Partial<TimelineOptions>>(() => ({
  height: 600,
  timenav_position: 'bottom',
  menubar_height: 40,
  // Icon customization - change icons based on selected set
  icons: iconSet.value === 'emoji' ? emojiIcons : 
         iconSet.value === 'custom' ? customSvgIcons : 
         undefined, // undefined uses Font Awesome defaults
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
