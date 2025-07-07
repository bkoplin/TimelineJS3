<script setup lang="ts">
import type { Ref } from 'vue'
import type { TimelineChangeEvent, TimelineData, TimelineOptions } from './types'
import { ref } from 'vue'
import { Timeline } from './index'

const timelineData: Ref<TimelineData> = ref({
  title: {
    text: {
      headline: 'Vue TimelineJS Demo',
      text: 'This is a demonstration of the Vue TimelineJS component.',
    },
  },
  events: [
    {
      unique_id: 'event-1',
      start_date: {
        year: '2022',
        month: '1',
        day: '1',
      },
      text: {
        headline: 'First Event',
        text: 'This is the first event in our timeline.',
      },
      media: {
        url: 'https://picsum.photos/800/600',
        caption: 'A sample image',
        credit: 'Lorem Picsum',
      },
    },
    {
      unique_id: 'event-2',
      start_date: {
        year: '2022',
        month: '6',
        day: '15',
      },
      end_date: {
        year: '2022',
        month: '7',
        day: '15',
      },
      text: {
        headline: 'Second Event',
        text: 'This is the second event in our timeline, with start and end dates.',
      },
      media: {
        url: 'https://picsum.photos/800/600?random=1',
        caption: 'Another sample image',
        credit: 'Lorem Picsum',
      },
    },
    {
      unique_id: 'event-3',
      start_date: {
        year: '2023',
        month: '1',
        day: '1',
      },
      text: {
        headline: 'Third Event',
        text: 'This is the third event in our timeline.',
      },
      media: {
        url: 'https://picsum.photos/800/600?random=2',
        caption: 'Yet another sample image',
        credit: 'Lorem Picsum',
      },
    },
    {
      unique_id: 'event-4',
      start_date: {
        year: '2023',
        month: '8',
        day: '20',
        display_date: 'Late Summer 2023',
      },
      text: {
        headline: 'Fourth Event with Custom Display',
        text: 'This event has a custom display date that overrides the formatted date.',
      },
    },
    {
      unique_id: 'event-5',
      start_date: {
        year: '2024',
        month: '3',
        day: '15',
        hour: '14',
        minute: '30',
      },
      text: {
        headline: 'Fifth Event with Time',
        text: 'This event includes both date and time information.',
      },
    },
  ],
})

const timelineOptions: Ref<TimelineOptions> = ref({
  height: 600,
  width: null, // null means auto-width
  start_at_end: false,
  timenav_position: 'bottom',
  scale_factor: 2,
  hash_bookmark: true,
})

function onTimelineReady(): void {
  console.log('Timeline is ready')
}

function onTimelineChanged(event: TimelineChangeEvent): void {
  console.log('Timeline changed to event with ID:', event.unique_id)
}
</script>

<template>
  <div class="app-container font-sans max-w-6xl mx-auto h-screen p-5 relative">
    <h1 class="text-center mb-5">
      Vue Timeline Demo
    </h1>
    <Timeline
      :data="timelineData"
      :options="timelineOptions"
      class="timeline-container h-[600px] w-full border border-gray-300 shadow-md relative"
      @ready="onTimelineReady"
      @changed="onTimelineChanged"
    />
  </div>
</template>

<style lang="css" scoped>
.app-container {

}

h1 {
  @apply text-center mb-5;
}

.timeline-container {
  @apply h-[600px] w-full border border-gray-300 shadow-md relative;
}
</style>
