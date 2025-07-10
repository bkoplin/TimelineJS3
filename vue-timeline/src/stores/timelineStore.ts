import type { Language, ProcessedTimelineData, Slide, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import { moment } from '#/useMoment.ts'
import { defineStore } from 'pinia'
import { isNumber, objectify } from 'radash'
import { easeInOutQuint } from '../core/animation/Ease'
import { DateParser } from '../core/DateParser'
import { english } from '../core/language/Language.ts'

export const useTimelineStore = defineStore('timeline', () => {
  // Raw data
  const events = ref<TimelineEventInput[]>([])
  const title = ref<TimelineEventInput>()
  const eras = ref<TimelineEventInput[]>([])
  const scale = ref<'human' | 'cosmological'>('human')

  // Options with defaults
  const options = ref<TimelineOptions>({
    height: null,
    width: null,
    debug: false,
    font: 'default',
    is_embed: false,
    is_full_embed: false,
    hash_bookmark: false,
    default_bg_color: { r: 255, g: 255, b: 255 },
    scale_factor: 2,
    layout: 'landscape',
    timenav_position: 'bottom',
    optimal_tick_width: 60,
    base_class: 'tl-timeline',
    timenav_height: null,
    timenav_height_percentage: 25,
    timenav_mobile_height_percentage: 40,
    timenav_height_min: 175,
    marker_height_min: 30,
    marker_width_min: 100,
    marker_padding: 5,
    start_at_slide: 0,
    start_at_end: false,
    menubar_height: 0,
    skinny_size: 650,
    medium_size: 800,
    use_bc: false,
    duration: 1000,
    ease: easeInOutQuint,
    dragging: true,
    trackResize: true,
    map_type: 'stamen:toner-lite',
    slide_padding_lr: 100,
    slide_default_fade: '0%',
    zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
    track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
    theme: null,
  })

  // Language
  const language = ref<Language>(english)

  // Computed processed data
  const parsedEvents = computed(() => {
    return events.value.map((event) => {
      return {
        ...event,
        unique_id: event.unique_id || crypto.randomUUID(),
        start_date: event.start_date ? moment(event.start_date) : undefined,
        end_date: event.end_date ? moment(event.end_date) : undefined,
      }
    })
  })

  const parsedTitle = computed(() => {
    if (!title.value) {
      return undefined
    }
    return {
      ...title.value,
      unique_id: title.value.unique_id || crypto.randomUUID(),
      start_date: title.value.start_date ? moment(title.value.start_date) : undefined,
      end_date: title.value.end_date ? moment(title.value.end_date) : undefined,
    }
  })

  const parsedEras = computed(() => {
    return eras.value.map((era) => {
      return {
        ...era,
        unique_id: era.unique_id || crypto.randomUUID(),
        start_date: era.start_date ? moment(era.start_date) : undefined,
        end_date: era.end_date ? moment(era.end_date) : undefined,
      }
    })
  })

  const processedData = computed<ProcessedTimelineData>(() => {
    return {
      title: parsedTitle.value,
      events: parsedEvents.value,
      eras: parsedEras.value,
      scale: scale.value,
    }
  })

  // Raw timeline data (for components that expect unparsed data)
  const rawData = computed<TimelineData>(() => {
    return {
      title: title.value,
      events: events.value,
      eras: eras.value,
      scale: scale.value,
    }
  })
  const slides = computed(() => {
    const newSlides = parsedEvents.value.map((event, i): Slide => {
      return {
        ...event,
        position: parsedTitle.value?.text ? i + 1 : i,
        id: event.unique_id,
        isTitle: false,
        start_date_format: event.start_date?.hour() === 0 && event.start_date?.minute() === 0
          ? 'MMMM D, YYYY'
          : 'MMMM D, YYYY [at] h:mm A',
        end_date_format: event.end_date?.hour() === 0 && event.end_date?.minute() === 0
          ? 'MMMM D, YYYY'
          : 'MMMM D, YYYY [at] h:mm A',
      }
    }).sort((a, b) => (a.start_date?.valueOf() ?? 0) - (b.start_date?.valueOf() ?? 0))
    if (parsedTitle.value?.text) {
      newSlides.unshift({
        ...parsedTitle.value,
        position: 0,
        id: parsedTitle.value.unique_id,
        isTitle: true,
      })
    }
    return objectify(newSlides, item => item.id)
  })
  
  const {
    previous,
    next,
    index,
    at,
    goToNext,
    goToPrevious,
    goBackTo,
    goTo,
    get,
    isAfter,
    isBefore,
    isFirst,
    isLast,
    isCurrent,
    isNext,
    isPrevious,
    steps,
    stepNames,
  } = useStepper(slides)
  
  // Actions
  function setData(data: TimelineData) {
    events.value = data.events || []
    title.value = data.title
    eras.value = data.eras || []
    if (data.scale) {
      scale.value = data.scale
    }
  }

  function setOptions(newOptions: Partial<TimelineOptions>) {
    options.value = { ...options.value, ...newOptions }
  }

  function setLanguage(newLanguage: Language) {
    language.value = newLanguage
  }

  return {
    // State
    events,
    title,
    eras,
    scale,
    options,
    language,

    // Computed
    parsedEvents,
    parsedTitle,
    parsedEras,
    processedData,
    rawData,

    // Actions
    setData,
    setOptions,
    setLanguage,

    // Slides, SlideSteps
    previous,
    next,
    index,
    at,
    goToNext,
    goToPrevious,
    goBackTo,
    goTo,
    get,
    isAfter,
    isBefore,
    isFirst,
    isLast,
    isCurrent,
    isNext,
    isPrevious,
    steps,
    stepNames,
    slides: steps,
  }
})
