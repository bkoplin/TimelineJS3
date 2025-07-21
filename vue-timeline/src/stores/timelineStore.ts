import type { Moment, unitOfTime } from '#/useMoment.ts'
import type { Duration } from 'moment'
import type { IterableElement } from 'type-fest'
import type { Language, ProcessedTimelineData, Slide, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import { moment } from '#/useMoment.ts'
import { scaleDiverging, scaleLinear, scaleTime } from 'd3-scale'
import { ceil, floor, isEqual, max, min, omitBy, pickBy, sortBy, times, uniqBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { crush, flat, isNumber, last, objectify, select } from 'radash'
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
    height: 450,
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
    optimal_tick_width: 15,
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
    zoom_sequence: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
  })
  // Scale definitions for zooming. The key of the object is a string representation of the resolution of the minor ticks, e.g. '15 minutes', '1 hour', etc.
  const scaleSequence: {
    [index: `${number} ${unitOfTime.Base}`]: {
      rangeStep: {
        minor: readonly [unitOfTime.Base, { step: number }]
        middle: readonly [unitOfTime.Base, { step: number }]
        major: readonly [unitOfTime.Base, { step: number }]
      }
      majorTickFormat: string
      middleTickFormat: string
    }
  } = {
    '15 minutes': {
      rangeStep: {
        minor: ['minutes', { step: 15 }],
        middle: ['hours', { step: 1 }],
        major: ['hours', { step: 3 }],
      },
      majorTickFormat: 'MMM DD, YYYY h A',
      middleTickFormat: 'h:mm A',
    },
    '1 hour': {
      rangeStep: {
        minor: ['hours', { step: 1 }],
        middle: ['hours', { step: 8 }],
        major: ['hours', { step: 16 }],
      },
      majorTickFormat: 'MMM DD, YYYY h A',
      middleTickFormat: 'h:mm A',
    },
    '12 hours': {
      rangeStep: {
        minor: ['hours', { step: 12 }],
        middle: ['days', { step: 1 }],
        major: ['days', { step: 3 }],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'HH:[00]',
    },
    '1 day': {
      rangeStep: {
        minor: ['days', { step: 1 }],
        middle: ['days', { step: 2 }],
        major: ['weeks', { step: 1 }],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'MM-DD',
    },
    '1 week': {
      rangeStep: {
        minor: ['weeks', { step: 1 }],
        middle: ['days', { step: 15 }],
        major: ['months', { step: 1 }],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'DD',
    },
    '2 weeks': {
      rangeStep: {
        minor: ['weeks', { step: 2 }],
        middle: ['months', { step: 1 }],
        major: ['months', { step: 2 }],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'MM-DD',
    },
    '1 month': {
      rangeStep: {
        minor: ['months', { step: 1 }],
        middle: ['months', { step: 6 }],
        major: ['years', { step: 1 }],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'MM-DD',
    },
    '3 months': {
      rangeStep: {
        minor: ['months', { step: 3 }],
        middle: ['months', { step: 12 }],
        major: ['years', { step: 2 }],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'DD',
    },
    '6 months': {
      rangeStep: {
        minor: ['months', { step: 6 }],
        middle: ['months', { step: 18 }],
        major: ['years', { step: 3 }],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'DD',
    },
    '1 year': {
      rangeStep: {
        minor: ['years', { step: 1 }],
        middle: ['years', { step: 2 }],
        major: ['years', { step: 10 }],
      },
      majorTickFormat: 'YYYY',
      middleTickFormat: 'MMM DD',
    },
  }
  const scaleStepper = toReactive(useStepper(scaleSequence, '1 day'))
  // Moment ranges for events
  const eventMoments = computed(() => events.value.flatMap(e => [e.start_date, e.end_date]).filter(v => isDefined(v)).map(v => moment(v)))
  const minMoment = computed(() => moment.min(eventMoments.value))
  const maxMoment = computed(() => moment.max(eventMoments.value))
  const eventMomentRange = computed(() => moment.range([minMoment.value.clone(), maxMoment.value.clone()]))
  const eventDateRange = computed(() => eventMomentRange.value.toDate())

  // Tick calculations
  const tickDates = computed(() => Array.from(eventMomentRange.value.by(...scaleStepper.current.rangeStep.minor)))
  const tickCalculations = computed(() => {
    const currentScale = scaleStepper.current
    const perMiddle = Array.from(moment.range(moment(), moment().add(currentScale.rangeStep.middle[1].step, currentScale.rangeStep.middle[0])).by(currentScale.rangeStep.minor[0], { ...currentScale.rangeStep.minor[1], excludeEnd: true })).length
    const perMajor = Array.from(moment.range(moment(), moment().add(currentScale.rangeStep.major[1].step, currentScale.rangeStep.major[0])).by(currentScale.rangeStep.minor[0], { ...currentScale.rangeStep.minor[1], excludeEnd: true })).length
    const pixelRange = Math.max(tickDates.value.length * options.value.optimal_tick_width, options.value.width)
    const numberOfTicks = floor(pixelRange / options.value.optimal_tick_width)
    const tickContainerWidth = numberOfTicks * options.value.optimal_tick_width
    const minX = 0
    const maxX = tickContainerWidth
    const containerScale = scaleLinear().range([options.value.width / -2, maxX + options.value.width /2]).domain([0, numberOfTicks])
    const minDate = eventMomentRange.value.start.clone()
    const maxDate = eventMomentRange.value.end.clone()
    const msPerPixel = eventMomentRange.value.diff('milliseconds', true) / tickContainerWidth
    console.log("🚀 ~ tickCalculations ~ msPerPixel:", msPerPixel)
    const dateToPixelScale = (date: Moment|Date) => moment(date).diff(minDate, 'milliseconds') / msPerPixel
    const pixelToDateScale = (pixel: number) => {
      if (pixel < 0) {
        return minDate.clone().subtract(pixel * msPerPixel, 'milliseconds').toDate()
      }
      return maxDate.clone().add(pixel * msPerPixel, 'milliseconds').toDate()
    }
    const ticks = times(numberOfTicks, (i) => {
      const position = containerScale(i)
      const date = pixelToDateScale(position)
      const type: 'major' | 'middle' | 'minor' = i % perMajor === 0 ? 'major' : (i % perMiddle === 0 ? 'middle' : 'minor')
      const label = `${type}TickFormat` in currentScale ? moment(date).format(currentScale[`${(type as 'major' | 'middle')}TickFormat`]) : ''
      return {
        position,
        type,
        date,
        label,
      }
    })
    return {
      perMiddle,
      perMajor,
      total: tickDates.value.length,
      ticks,
      numberOfTicks,
      minX,
      maxX,
      minDate,
      maxDate,
      tickContainerWidth,
      pixelToDateScale,
      dateToPixelScale,
    }
  })
  // Zoom and size Calculations
  const timeAxisHeight = ref(45)
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

  // Zoom and pixel calculations
  /** This is the width of the containers that hold the marker elements tick elements */
  const tickContainerWidth = computed(() => tickCalculations.value.tickContainerWidth)
  const numberOfTicks = computed(() => tickCalculations.value.numberOfTicks)

  // Raw timeline data (for components that expect unparsed data)
  const rawData = computed<TimelineData>(() => {
    return {
      title: title.value,
      events: events.value,
      eras: eras.value,
      scale: scale.value,
    }
  })

  const dateToPixel = useDateToPixelFn(() => [tickCalculations.value.minX, tickCalculations.value.maxX], () => moment.range(tickCalculations.value.minDate, tickCalculations.value.maxDate))
  const pixelToDate = computed(() => tickCalculations.value.pixelToDateScale)

  // Create a reactive scale function that maps pixel positions to dates

  // Language
  const language = ref<Language>(english)

  // Computed processed data
  const hasTitleSlide = computed(() => (title.value?.text?.text?.trim()?.length || title.value?.text?.headline?.trim()?.length))
  const parsedTitle = computed(() => {
    if (!title.value) {
      return undefined
    }
    const generatedUniqueId = title.value.unique_id || crypto.randomUUID()
    return {
      ...title.value,
      unique_id: generatedUniqueId,
      id: generatedUniqueId,
      isTitle: true,
      start_date: title.value.start_date ? moment(title.value.start_date) : undefined,
      end_date: title.value.end_date ? moment(title.value.end_date) : undefined,
    }
  })

  const parsedEvents = useArrayMap(events, (event) => {
    const generatedUniqueId = event.unique_id || crypto.randomUUID()
    const startDate = moment(event.start_date)
    const endDate = event.end_date ? moment(event.end_date) : undefined
    const startDateFormat = startDate?.hour() === 0 && startDate?.minute() === 0
      ? 'MMMM D, YYYY'
      : 'MMMM D, YYYY [at] h:mm A'
    const endDateFormat = endDate?.hour() === 0 && endDate?.minute() === 0
      ? 'MMMM D, YYYY'
      : 'MMMM D, YYYY [at] h:mm A'
    const slide = {
      ...event,
      unique_id: generatedUniqueId,
      id: generatedUniqueId,
      start_date: startDate,
      end_date: endDate,
      isTitle: false,
      range: endDate
        ? moment.range(startDate, endDate)
        : moment.range(startDate, startDate),
      position: tickCalculations.value.dateToPixelScale(startDate),
      startDateDisplay: startDate.format(startDateFormat),
      endDateDisplay: endDate ? endDate.format(endDateFormat) : undefined,
    }
    return slide
  })

  const parsedEventsSorted = useSorted(parsedEvents, (a, b) => {
    const aStart = a.range.start.valueOf()
    const bStart = b.range.start.valueOf()
    if (aStart !== bStart) {
      return aStart - bStart
    }
    const aEnd = a.range.end.valueOf()
    const bEnd = b.range.end.valueOf()
    return aEnd - bEnd
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

  const processedData = computed(() => {
    return {
      title: parsedTitle.value,
      events: parsedEventsSorted.value,
      eras: parsedEras.value,
      scale: scale.value,
    }
  })
  const slides = computed(() => {
    const newSlides = parsedEventsSorted.value
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
    markers,
    // Computed
    parsedEvents,
    parsedTitle,
    parsedEras,
    processedData,
    rawData,
    hasTitleSlide,

    // Computed dates and ranges
    eventMoments,
    minMoment,
    maxMoment,
    eventMomentRange,
    eventDateRange,
    tickDates,

    // Actions
    setData,
    setOptions,
    setLanguage,

    // Size Calculations
    timeNavHeight,
    timeAxisHeight,
    storySliderHeight,
    tickContainerWidth,

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
    scaleStepper,

    // Tick properties
    numberOfTicks,
    tickCalculations,

    // Pixel to date scale mapping
    dateToPixel,
    pixelToDate,
  }
})
