import type { Moment, unitOfTime } from '#/useMoment.ts'
import type { IterableElement } from 'type-fest'
import type { Language, ProcessedTimelineData, Slide, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import { moment } from '#/useMoment.ts'
import { scaleTime } from 'd3-scale'
import { isEqual, min, omitBy, pickBy, sortBy, times, uniqBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { crush, flat, isNumber, objectify, select } from 'radash'
import { useDateToPixelFn, usePixelToDateFn } from '@/composables/scaleFunctions.ts'
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

  // Size Calculations
  const timeAxisHeight = ref(40)
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

  // Computed processed data
  const hasTitleSlide = computed(() => (title.value?.text?.text?.trim()?.length || title.value?.text?.headline?.trim()?.length))
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

  const parsedEvents = computed(() => {
    return events.value.map((event): IterableElement<ProcessedTimelineData['events']> => {
      const generatedUniqueId = event.unique_id || crypto.randomUUID()
      return {
        ...event,
        unique_id: generatedUniqueId,
        start_date: moment(event.start_date),
        end_date: event.end_date ? moment(event.end_date) : undefined,
        range: event.end_date
          ? moment.range(moment(event.start_date), moment(event.end_date))
          : moment.range(moment(event.start_date), moment(event.start_date)),
      }
    }).sort((a, b) => {
      const aStart = a.range.start.valueOf()
      const bStart = b.range.start.valueOf()
      if (aStart !== bStart) {
        return aStart - bStart
      }
      const aEnd = a.range.end.valueOf()
      const bEnd = b.range.end.valueOf()
      return aEnd - bEnd
    })
  })

  const parsedEras = computed(() => {
    return sortBy(eras.value.map((era) => {
      return {
        ...era,
        unique_id: era.unique_id || crypto.randomUUID(),
        start_date: moment(era.start_date),
        end_date: moment(era.end_date),
        range: moment.range(moment(era.start_date), moment(era.end_date)),
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

  // Moment ranges for events
  const eventMoments = computed(() => processedData.value.events.flatMap(e => [e.range.start, e.range.end]).filter((v): v is Moment => isDefined(v) || moment.isMoment(v)))
  const minMoment = computed(() => moment.min(eventMoments.value))
  const maxMoment = computed(() => moment.max(eventMoments.value))
  const eventDateRange = computed(() => [minMoment.value.clone().toDate(), maxMoment.value.clone().toDate()] as [Date, Date])
  const eventMomentRange = computed(() => moment.range([minMoment.value, maxMoment.value]))

  // Zoom and pixel calculations
  const zoomStepper = toReactive(useStepper(options.value.zoom_sequence, options.value.initial_zoom))
  const pixelWidth = computed(() => options.value.width * options.value.scale_factor * zoomStepper.current)

  const pixelRange = computed(() => [0, pixelWidth.value] as [number, number])
  const numberOfTicks = useMath('floor', () => pixelWidth.value / options.value.optimal_tick_width)
  const dateToPixel = useDateToPixelFn(pixelRange, eventMomentRange)
  const pixelToDate = usePixelToDateFn(pixelRange, eventMomentRange)
  const majorTickRange = computed(() => {
    const majorTickPixelWidth = options.value.optimal_tick_width * 5
    const majorTickDate = pixelToDate.value(majorTickPixelWidth)
    const majorTickMoment = moment.range(moment(), majorTickDate)
    return majorTickMoment
  })
  const majorTickRangeText = computed(() => moment.utc(majorTickRange.value.diff()).format('HH:mm:ss.SSS'))
  const scales = computed(() => {
    let majorScaleFormat = 'YYYY'
    let minorScaleFormat = 'MMM YY'
    let padding = [1, 'year'] as [number, unitOfTime.StartOf]
    const yearDiff = majorTickRange.value.diff('years', true)
    const monthDiff = majorTickRange.value.diff('months', true)
    const dayDiff = majorTickRange.value.diff('days', true)
    const hourDiff = majorTickRange.value.diff('hours', true)
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
      padding,
    }
  })

  // Create a reactive scale function that maps pixel positions to dates

  const ticks = computed(() => {
    return dateToPixel.value.ticks(numberOfTicks.value).map((tick, i) => {
      const position = dateToPixel.value(tick)
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
        position: dateToPixel.value(event.start_date),
        start_date_format: event.start_date?.hour() === 0 && event.start_date?.minute() === 0
          ? 'MMMM D, YYYY'
          : 'MMMM D, YYYY [at] h:mm A',
        end_date_format: event.end_date?.hour() === 0 && event.end_date?.minute() === 0
          ? 'MMMM D, YYYY'
          : 'MMMM D, YYYY [at] h:mm A',
      }
    })
    if (parsedTitle.value?.text) {
      return objectify([{
        ...parsedTitle.value,
        position: 0,
        id: parsedTitle.value.unique_id,
        isTitle: true,
      }, ...newSlides], item => item.id)
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
    // Computed
    parsedEvents,
    parsedTitle,
    parsedEras,
    processedData,
    rawData,
    hasTitleSlide,

    // Computed ranges
    eventMoments,
    minMoment,
    maxMoment,
    eventMomentRange,
    scales,
    eventDateRange,
    pixelRange,
    pixelWidth,
    majorTickRange,

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

    // Pixel to date scale mapping
    dateToPixel,
    pixelToDate,
    majorTickRangeText,
  }
})
