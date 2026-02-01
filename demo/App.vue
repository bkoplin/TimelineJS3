<template>
  <div class="demo-app">
    <h1>VueTimelineJS3 Demo</h1>
    
    <VueTimelineJS3
      :data="timelineData"
      :options="timelineOptions"
      @ready="onReady"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueTimelineJS3 } from '../src/index'
import type { TimelineData, TimelineOptions } from '../src/types/timeline'

const timelineData = ref<TimelineData>({
  title: {
    text: {
      headline: "Welcome to VueTimelineJS3",
      text: "A modern Vue 3 + TypeScript timeline component"
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
        text: "This is the first event in the timeline"
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
        text: "This is the second event with more details"
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
        text: "This event spans multiple days"
      },
      unique_id: "event-3"
    }
  ]
})

const timelineOptions = ref<Partial<TimelineOptions>>({
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
  respect_reduced_motion: true
})

function onReady() {
  console.log('Timeline is ready!')
}

function onChange(data: any) {
  console.log('Slide changed:', data)
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
}
</style>
