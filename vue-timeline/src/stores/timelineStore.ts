import type { unitOfTime } from '#/useMoment.ts'
import type { Language, ProcessedTimelineData, Slide, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import { moment } from '#/useMoment.ts'
import { scaleTime } from 'd3-scale'
import { min, omitBy, pickBy, sortBy, times } from 'lodash-es'
import { defineStore } from 'pinia'
import { crush, isNumber, objectify } from 'radash'
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
    optimal_tick_width: 40,
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
  const timeAxisHeight = ref(40)
  // Size Calculations
  const timeNavHeight = computed(() => {
    if (options.value.timenav_height) {
      return options.value.timenav_height
    }
    if (options.value.timenav_height_percentage) {
      const calculatedHeight = options.value.height * (options.value.timenav_height_percentage / 100)
      return (options.value.timenav_height_min ? Math.max(options.value.timenav_height_min, calculatedHeight) : calculatedHeight)
    }
    return options.value.timenav_height_min!
  })

  const storySliderHeight = computed(() => {
    return options.value.height - timeNavHeight.value
  })

  // Language
  const language = ref<Language>(english)
  const hasTitle = computed(() => (title.value?.text?.text?.trim()?.length || title.value?.text?.headline?.trim()?.length))
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

  const eventMoments = computed(() => parsedEvents.value.flatMap(event => [event.start_date?.clone(), event.end_date?.clone()]).filter((d): d is ReturnType<typeof moment> => isDefined(d) && d.isValid()))
  const eventRange = computed(() => moment.range([moment.min(eventMoments.value), moment.max(eventMoments.value)]))

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

  const zoomStepper = toReactive(useStepper(options.value.zoom_sequence, options.value.initial_zoom))
  const pixelWidth = computed(() => options.value.width * options.value.scale_factor * zoomStepper.current)

  const timeRange = computed(() => [eventRange.value.start.clone().subtract(1, 'year').toDate(), eventRange.value.end.clone().add(1, 'year').toDate()] as [Date, Date])
  const pixelRange = computed(() => [0, pixelWidth.value] as [number, number])
  const numberOfTicks = useMath('floor', () => pixelWidth.value / options.value.optimal_tick_width)
  const timeScale = computed(() => scaleTime().domain(timeRange.value).range(pixelRange.value))
  const majorTickDuration = computed(() => {
    const majorTickPixelWidth = options.value.optimal_tick_width * 5
    const majorTickMillisecondWidth = timeScale.value.invert(majorTickPixelWidth)
    const majorTickMoment = moment(majorTickMillisecondWidth)
    return majorTickMoment
  })
  const scales = computed(() => {
    let majorScaleFormat = 'YYYY'
    let minorScaleFormat = 'MMM YY'
    let padding = [1, 'year'] as [number, unitOfTime.StartOf]
    const majorTickPixelWidth = options.value.optimal_tick_width * 5
    const majorTickDate = timeScale.value.invert(majorTickPixelWidth)
    const majorTickRange = moment.range(timeScale.value.invert(0), majorTickDate)
    const yearDiff = majorTickRange.diff('years', true)
    const monthDiff = majorTickRange.diff('months', true)
    const dayDiff = majorTickRange.diff('days', true)
    const hourDiff = majorTickRange.diff('hours', true)
    if (yearDiff > 100) {
      majorScaleFormat = 'YYYY'
      minorScaleFormat = 'YYYY'
      padding = [100, 'year']
    }
    else if (yearDiff > 10) {
      majorScaleFormat = 'YYYY'
      minorScaleFormat = 'MMM YY'
      padding = [10, 'year']
    }
    else if (yearDiff > 1) {
      majorScaleFormat = 'MMM YYYY'
      minorScaleFormat = 'MMM D'
      padding = [1, 'year']
    }
    else if (monthDiff > 1) {
      majorScaleFormat = 'MMM D YYYY'
      minorScaleFormat = 'MMM D'
      padding = [1, 'month']
    }
    else if (dayDiff > 15) {
      majorScaleFormat = 'MMM D YYYY'
      minorScaleFormat = 'MMM D'
      padding = [15, 'day']
    }
    else if (dayDiff > 1) {
      majorScaleFormat = 'MMM D YYYY'
      minorScaleFormat = 'MMM D'
      padding = [1, 'day']
    }
    else {
      majorScaleFormat = 'MMM D YYYY [at] h:mm A'
      minorScaleFormat = 'MMM D'
      padding = [1, 'hour']
    }
    return {
      majorScaleFormat,
      minorScaleFormat,
      yearDiff,
      monthDiff,
      dayDiff,
      hourDiff,
      pixelWidth,
      padding
    }
  })
  const finalTimeRange = computed(() => [eventRange.value.start.clone().subtract(...scales.value.padding).toDate(), eventRange.value.end.clone().add(...scales.value.padding).toDate()] as [Date, Date])
  const finalTimeScale = computed(() => scaleTime().domain(finalTimeRange.value).range(pixelRange.value))
  const ticks = computed(() => {

    return finalTimeScale.value.ticks(numberOfTicks.value).map((tick, i) => {
      const ratio = i / numberOfTicks.value
      const position = ratio * pixelWidth.value
      const tickDate = moment(tick)

      // Determine if this is a major or minor tick
      const isMajorTick = i % 5 === 0 // Every 5th tick is major
      
      return {
        position,
        label: isMajorTick ? tickDate.format(scales.value.majorScaleFormat) : tickDate.format(scales.value.minorScaleFormat),
        type: isMajorTick ? 'major' : 'minor',
        date: tickDate,
      }
    })
  })

  const slides = computed(() => {
    const newSlides = parsedEvents.value.map((event, i): Slide => {
      return {
        ...event,
        id: event.unique_id,
        isTitle: false,
        position: finalTimeScale.value(event.start_date?.toDate() || new Date()),
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
    current,
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
  const markers = computed(() => {
    return stepNames.value.map((markerId, i) => {
      const marker = steps.value[markerId]
      return marker
    })
  })

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
    options.value = { ...options.value, ...pickBy(newOptions, v => isDefined(v)) }
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
    markers,
    finalTimeRange,
    finalTimeScale,
    // Computed
    parsedEvents,
    parsedTitle,
    parsedEras,
    processedData,
    rawData,
    hasTitle,

    // Computed ranges
    eventMoments,
    eventRange,
    scales,
    timeRange,
    pixelRange,
    pixelWidth,
    majorTickDuration,

    // Actions
    setData,
    setOptions,
    setLanguage,

    // Size Calculations
    timeNavHeight,
    timeAxisHeight,
    storySliderHeight,

    // Slides, SlideSteps
    previous,
    next,
    index,
    current,
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
    ticks,
  }
})
