import type { TimelineEvent, TimelineEventInput } from '../types'
import moment from 'moment'
import { defineStore } from 'pinia'

export const useTimelineStore = defineStore('events', () => {
  const events = ref<TimelineEventInput[]>([])
  const title = ref<TimelineEventInput>()
  const scale = ref<'human' | 'cosmological'>('human')
  const parsedEvents = computed(() => {
    return events.value.map((event) => {
      return {
        ...event,
        start: moment(event.start_date),
        end: moment(event.end_date),
      }
    })
  })
  return {
    events,
    title,
    scale,
    parsedEvents,
  }
})
