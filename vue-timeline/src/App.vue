<template>
  <div class="app-container">
    <h1>Vue Timeline Demo</h1>
    <Timeline 
      :data="timelineData" 
      :options="timelineOptions"
      @ready="onTimelineReady"
      @changed="onTimelineChanged"
      class="timeline-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Timeline } from './index'
import type { TimelineData, TimelineOptions, TimelineChangeEvent } from './types'

const timelineData: Ref<TimelineData> = ref({
  title: {
    text: {
      headline: "Vue TimelineJS Demo",
      text: "This is a demonstration of the Vue TimelineJS component."
    }
  },
  events: [
    {
      unique_id: 'event-1',
      start_date: {
        year: '2022',
        month: '1',
        day: '1'
      },
      text: {
        headline: "First Event",
        text: "This is the first event in our timeline."
      },
      media: {
        url: "https://picsum.photos/800/600",
        caption: "A sample image",
        credit: "Lorem Picsum"
      }
    },
    {
      unique_id: 'event-2',
      start_date: {
        year: '2022',
        month: '6',
        day: '15'
      },
      end_date: {
        year: '2022',
        month: '7',
        day: '15'
      },
      text: {
        headline: "Second Event",
        text: "This is the second event in our timeline, with start and end dates."
      },
      media: {
        url: "https://picsum.photos/800/600?random=1",
        caption: "Another sample image",
        credit: "Lorem Picsum"
      }
    },
    {
      unique_id: 'event-3',
      start_date: {
        year: '2023',
        month: '1',
        day: '1'
      },
      text: {
        headline: "Third Event",
        text: "This is the third event in our timeline."
      },
      media: {
        url: "https://picsum.photos/800/600?random=2",
        caption: "Yet another sample image",
        credit: "Lorem Picsum"
      }
    },
    {
      unique_id: 'event-4',
      start_date: {
        year: '2023',
        month: '8',
        day: '20',
        display_date: 'Late Summer 2023'
      },
      text: {
        headline: "Fourth Event with Custom Display",
        text: "This event has a custom display date that overrides the formatted date."
      }
    },
    {
      unique_id: 'event-5',
      start_date: {
        year: '2024',
        month: '3',
        day: '15',
        hour: '14',
        minute: '30'
      },
      text: {
        headline: "Fifth Event with Time",
        text: "This event includes both date and time information."
      }
    }
  ]
})

const timelineOptions: Ref<TimelineOptions> = ref({
  height: 600,
  width: null, // null means auto-width
  start_at_end: false,
  timenav_position: 'bottom',
  scale_factor: 2,
  hash_bookmark: true
})

const onTimelineReady = (): void => {
  console.log('Timeline is ready')
}

const onTimelineChanged = (event: TimelineChangeEvent): void => {
  console.log('Timeline changed to event with ID:', event.unique_id)
}
</script>

<style>
.app-container {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  padding: 20px;
  position: relative;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.timeline-container {
  height: 600px;
  width: 100%;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}
</style>
