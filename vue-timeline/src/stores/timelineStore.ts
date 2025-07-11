import type { unitOfTime } from '#/useMoment.ts'
import type { Language, ProcessedTimelineData, Slide, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import { moment } from '#/useMoment.ts'
import { min, sortBy, times } from 'lodash-es'
import { defineStore } from 'pinia'
import { isNumber, objectify } from 'radash'
import { easeInOutQuint } from '../core/animation/Ease'
import { DateParser } from '../core/DateParser'
import { english } from '../core/language/Language.ts'

const AXIS_TICK_DATEFORMAT_LOOKUP = {
  millisecond: 'HH:mm:ss.SSS',
  second: 'HH:mm:ss',
  minute: 'HH:mm',
  hour: 'HH:mm',
  day: 'DD MMM',
  month: 'MMM YYYY',
  year: 'YYYY',
  decade: 'YYYY',
  century: 'YYYY',
  millennium: 'YYYY',
  age: 'compact', // ...Language.<code>.bigdateformats
  epoch: 'compact',
  era: 'compact',
  eon: 'compact',
  eon2: 'compact',
}
export const useTimelineStore = defineStore('timeline', () => {
  // Raw data
  const events = ref<TimelineEventInput[]>([])
  const title = ref<TimelineEventInput>()
  const eras = ref<TimelineEventInput[]>([])
  const scale = ref<'human' | 'cosmological'>('human')

  // Options with defaults
  const options = ref<TimelineOptions>({
    base_class: 'tl-timeline',
    debug: false,
    default_bg_color: { r: 255, g: 255, b: 255 },
    dragging: true,
    duration: 1000,
    ease: easeInOutQuint,
    font: 'default',
    hash_bookmark: false,
    has_groups: false,
    height: 600,
    is_embed: false,
    is_full_embed: false,
    initial_zoom: 1,
    language: english,
    layout: 'landscape',
    map_type: 'stamen:toner-lite',
    marker_height_min: 30,
    marker_padding: 5,
    marker_width_min: 100,
    max_rows: 6,
    medium_size: 800,
    menubar_height: 0,
    optimal_tick_width: 60,
    scale_factor: 2,
    skinny_size: 650,
    slide_default_fade: '0%',
    slide_padding_lr: 100,
    start_at_end: false,
    start_at_slide: 0,
    theme: null,
    timenav_height_min: 175,
    timenav_height_percentage: 25,
    timenav_height: null,
    timenav_mobile_height_percentage: 40,
    timenav_position: 'bottom',
    track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
    trackResize: true,
    use_bc: false,
    width: 1000,
    zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
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
        start_date_millisecond: event.start_date ? moment(event.start_date).valueOf() : undefined,
        end_date_millisecond: event.end_date ? moment(event.end_date).valueOf() : undefined,
      }
    }).sort((a, b) => {
      const aStart = a.start_date?.valueOf() ?? 0
      const bStart = b.start_date?.valueOf() ?? 0
      return aStart - bStart
    })
  })

  const eventRange = computed(() => {
    const eventDates = parsedEvents.value.flatMap(event => [event.start_date?.clone(), event.end_date?.clone()]).filter((d): d is ReturnType<typeof moment> => isDefined(d) && d.isValid())
    return moment.range(eventDates[0], eventDates[eventDates.length - 1])
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
    return sortBy(eras.value.map((era) => {
      return {
        ...era,
        unique_id: era.unique_id || crypto.randomUUID(),
        start_date: era.start_date ? moment(era.start_date) : undefined,
        end_date: era.end_date ? moment(era.end_date) : undefined,
      }
    }), ['start_date', 'end_date'])
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

  const zoomStepper = toReactive(useStepper(options.value.zoom_sequence, options.value.initial_zoom))
  const pixelWidth = computed(() => options.value.width * options.value.scale_factor / zoomStepper.current)
  const numberOfTicks = useMath('floor', () => pixelWidth.value / options.value.optimal_tick_width)
  const timeRange = computed(() => [0, eventRange.value.diff('milliseconds', true)] as [number, number])
  const pixelRange = computed(() => [0, pixelWidth.value] as [number, number])
  const scales = computed(() => {
    let majorScale: [unitOfTime.Base, step: number] = ['year', 1]
    let minorScale: [unitOfTime.Base, step: number] = ['month', 1]
    const markerScale = (eventMs: number | undefined) => eventMs ? pixelWidth.value * (eventMs - eventRange.value.start.valueOf()) / eventRange.value.clone().diff() : undefined
    const yearDiff = eventRange.value.clone().diff('years', true)
    const monthDiff = eventRange.value.clone().diff('months', true)
    const dayDiff = eventRange.value.clone().diff('days', true)
    const hourDiff = eventRange.value.clone().diff('hours', true)
    if (yearDiff > 100) {
      majorScale = ['year', 10]
      minorScale = ['year', 1]
    }
    else if (yearDiff > 10) {
      majorScale = ['year', 1]
      minorScale = ['month', 1]
    }
    else if (yearDiff > 1) {
      majorScale = ['month', 1]
      minorScale = ['day', 1]
    }
    else if (monthDiff > 1) {
      majorScale = ['day', 7]
      minorScale = ['day', 1]
    }
    else if (dayDiff > 15) {
      majorScale = ['day', 7]
      minorScale = ['day', 1]
    }
    else if (dayDiff > 1) {
      majorScale = ['hour', 24]
      minorScale = ['day', 1]
    }
    else {
      majorScale = ['hour', 1]
      minorScale = ['minute', 1]
    }
    return {
      markerScale,
      majorScale,
      minorScale,
      yearDiff,
      monthDiff,
      dayDiff,
      hourDiff,
      pixelWidth,
    }
  })
  const ticks = computed(() => {
    return times(numberOfTicks.value, (i) => {
      const ratio = i / numberOfTicks.value
      const position = ratio * pixelWidth.value
      const tickDate = moment(eventRange.value.start.valueOf() + (ratio * eventRange.value.diff()))

      // Determine if this is a major or minor tick
      const isMajorTick = i % 5 === 0 // Every 5th tick is major

      return {
        position,
        label: tickDate.format(isMajorTick ? AXIS_TICK_DATEFORMAT_LOOKUP[scales.value.majorScale[0]] : AXIS_TICK_DATEFORMAT_LOOKUP[scales.value.minorScale[0]]),
        type: isMajorTick ? 'major' : 'minor',
        date: tickDate,
      }
    })
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

    // Computed ranges
    eventRange,
    scales,
    timeRange,
    pixelRange,

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
    event_dict: steps,

    // Zoom Stepper
    zoomStepper,

    // Number of ticks
    numberOfTicks,
    ticks
  }
})
