<script setup lang="ts">
import type { PartialDeep } from 'type-fest'
import type { TimelineChangeEvent, TimelineData, TimelineEventInput, TimelineOptions } from './types'
import DraggableTest from './DraggableTest.vue'
import { Timeline } from './index'

// Add a toggle to switch between timeline and draggable test
const showDraggableTest = ref(false)

const timelineData = ref<PartialDeep<{ title: TimelineEventInput, events: TimelineEventInput[] }, { recurseIntoArrays: true }>>({
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
      start_date: '2020-01-14 14:30:00',
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

const timelineOptions: Ref<Partial<TimelineOptions>> = ref({
  height: 600,
  width: 1000, // null means auto-width
  start_at_end: false,
  timenav_position: 'bottom',
  scale_factor: 2,
  hash_bookmark: true,
})
</script>

<template>
  <GsapScrollTriggerExample v-if="showDraggableTest" />
  <Timeline
    v-else
    :data="timelineData"
    :options="timelineOptions"
    class="timeline-container"
  />
</template>

<style lang="css" scoped>

</style>
