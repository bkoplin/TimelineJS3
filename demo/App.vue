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
  menubar_height: 40
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
