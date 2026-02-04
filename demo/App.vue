<template>
  <div class="w-full max-w-1200px mx-auto px-5 py-5">
    <h1 class="text-center mb-5 text-#2c3e50">VueTimelineJS3 Demo</h1>
    
    <div class="bg-#f8f9fa border border-#dee2e6 rounded-lg p-5 mb-5">
      <h2 class="mt-0 mb-4 text-xl text-#495057">Test Dataset Size</h2>
      <div class="flex flex-col gap-2.5 mb-4">
        <label v-for="preset in datasetPresets" :key="preset.key" class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="radio" :value="preset.key" v-model="selectedDataset" />
          {{ preset.label }} ({{ preset.count }} events)
        </label>
      </div>
      
      <h2 class="mt-0 mb-4 text-xl text-#495057">Navigation Controls</h2>
      <div class="flex flex-col gap-2.5 mb-4">
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="checkbox" v-model="keyboardEnabled" class="w-18px h-18px cursor-pointer" />
          Keyboard Navigation (Arrow keys, Home/End)
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="checkbox" v-model="touchEnabled" class="w-18px h-18px cursor-pointer" />
          Touch Navigation (Swipe left/right)
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="checkbox" v-model="debugMode" class="w-18px h-18px cursor-pointer" />
          Debug Mode (Show virtual scrolling stats)
        </label>
      </div>
      
      <h2 class="mt-0 mb-4 text-xl text-#495057">Icon Customization</h2>
      <div class="flex flex-col gap-2.5 mb-4">
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="radio" value="fontawesome" v-model="iconSet" />
          Font Awesome Icons (Default)
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="radio" value="emoji" v-model="iconSet" />
          Emoji Icons
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-0.95rem">
          <input type="radio" value="custom" v-model="iconSet" />
          Custom SVG Icons
        </label>
      </div>
      
      <div class="bg-#e9ecef p-4 rounded mt-4">
        <p class="my-2 text-0.9rem text-#495057"><strong class="text-#212529 font-semibold">Virtual Scrolling Test:</strong></p>
        <ul>
          <li>Auto-enables for 50+ events</li>
          <li>Only renders visible slides + buffer</li>
          <li>Enables smooth navigation with 1000+ events</li>
          <li>Enable debug mode to see stats</li>
        </ul>
        <p class="my-2 text-0.9rem text-#495057"><strong class="text-#212529 font-semibold">Date Formats Shown (Basic dataset):</strong></p>
        <ul>
          <li>Event 1: Standard object ({year, month, day})</li>
          <li>Event 2: ISO datetime string</li>
          <li>Event 3: JavaScript Date objects</li>
          <li>Event 4: Simple date string (YYYY-MM-DD)</li>
          <li>Event 5: Unix timestamp</li>
          <li>Event 6: Hour precision</li>
          <li>Event 7: Auto day precision (minute without hour)</li>
        </ul>
        <p class="my-2 text-0.9rem text-#495057"><strong class="text-#212529 font-semibold">Keyboard:</strong> Use ← → arrow keys to navigate, Home/End for first/last</p>
        <p class="my-2 text-0.9rem text-#495057"><strong class="text-#212529 font-semibold">Touch:</strong> Swipe left/right to navigate between slides</p>
        <p class="my-2 text-0.9rem text-#495057"><strong class="text-#212529 font-semibold">Icons:</strong> Change icon sets above to see customization in action</p>
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
import { ref, computed, watch } from 'vue'
import { VueTimelineJS3 } from '../src/index'
import type { TimelineData, TimelineOptions } from '../src/types/timeline'
import { testDataPresets } from '../src/utils/testDataGenerator'

const timelineRef = ref<InstanceType<typeof VueTimelineJS3> | null>(null)
const keyboardEnabled = ref(true)
const touchEnabled = ref(true)
const debugMode = ref(false)
const iconSet = ref<'fontawesome' | 'emoji' | 'custom'>('fontawesome')
const selectedDataset = ref<string>('basic')

// Dataset presets
const datasetPresets = [
  { key: 'basic', label: 'Basic (7 date formats)', count: 7 },
  { key: 'small', label: 'Small', count: 10 },
  { key: 'medium', label: 'Medium', count: 50 },
  { key: 'large', label: 'Large (Virtual)', count: 100 },
  { key: 'xlarge', label: 'X-Large (Virtual)', count: 500 },
  { key: 'huge', label: 'Huge (Virtual)', count: 1000 }
]

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

// Basic timeline data with different date formats
const basicTimelineData: TimelineData = {
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
}

// Generate timeline data based on selected dataset
const timelineData = computed<TimelineData>(() => {
  switch (selectedDataset.value) {
    case 'small':
      return testDataPresets.small()
    case 'medium':
      return testDataPresets.medium()
    case 'large':
      return testDataPresets.large()
    case 'xlarge':
      return testDataPresets.xlarge()
    case 'huge':
      return testDataPresets.huge()
    case 'basic':
    default:
      return basicTimelineData
  }
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
  swipe_velocity_threshold: 0.3,
  // Virtual scrolling configuration (auto-enables for 50+ events)
  virtual_scrolling_enabled: undefined, // Auto-enable based on count
  virtual_buffer_size: 2,  // Pre-render 2 slides before/after
  virtual_threshold: 50,   // Auto-enable at 50 events
  virtual_markers_enabled: undefined, // Auto-enable for markers
  virtual_marker_threshold: 100,
  // Debug mode
  debug: debugMode.value
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


