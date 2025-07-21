import type { UnitType } from 'dayjs'
import type { Language, TimelineData, TimelineEventInput, TimelineOptions } from '../types'
import type { Dayjs } from '@/composables/useDayJs.ts'
import { scaleLinear, scaleTime } from 'd3-scale'
import { floor, max, min, pickBy, sortBy, times } from 'lodash-es'
import { defineStore } from 'pinia'
import { flat, objectify, select } from 'radash'
import { useDateToPixelFn } from '@/composables/scaleFunctions.ts'
import { dayjs, useDatesToMinMax, useDayjs } from '@/composables/useDayJs.ts'
import { easeInOutQuint } from '../core/animation/Ease'
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
    [index: `${number} ${UnitType}`]: {
      rangeStep: {
        minor: Parameters<Dayjs['add']>
        middle: Parameters<Dayjs['add']>
        major: Parameters<Dayjs['add']>
      }
      majorTickFormat: string
      middleTickFormat: string
    }
  } = {
    '15 minutes': {
      rangeStep: {
        minor: [15, 'minutes'],
        middle: [1, 'hours'],
        major: [3, 'hours'],
      },
      majorTickFormat: 'MMM DD, YYYY h A',
      middleTickFormat: 'h:mm A',
    },
    '1 hour': {
      rangeStep: {
        minor: [1, 'hours'],
        middle: [8, 'hours'],
        major: [16, 'hours'],
      },
      majorTickFormat: 'MMM DD, YYYY h A',
      middleTickFormat: 'h:mm A',
    },
    '12 hours': {
      rangeStep: {
        minor: [12, 'hours'],
        middle: [1, 'days'],
        major: [3, 'days'],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'HH:[00]',
    },
    '1 day': {
      rangeStep: {
        minor: [1, 'days'],
        middle: [3, 'days'],
        major: [14, 'days'],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'MM-DD',
    },
    '7 days': {
      rangeStep: {
        minor: [7, 'days'],
        middle: [1, 'month'],
        major: [3, 'months'],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'MM-DD',
    },
    '14 days': {
      rangeStep: {
        minor: [14, 'days'],
        middle: [1, 'months'],
        major: [2, 'months'],
      },
      majorTickFormat: 'MMM DD, YYYY',
      middleTickFormat: 'MM-DD',
    },
    '1 month': {
      rangeStep: {
        minor: [1, 'months'],
        middle: [6, 'months'],
        major: [1, 'years'],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'MM-DD',
    },
    '3 months': {
      rangeStep: {
        minor: [3, 'months'],
        middle: [12, 'months'],
        major: [2, 'years'],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'DD',
    },
    '6 months': {
      rangeStep: {
        minor: [6, 'months'],
        middle: [18, 'months'],
        major: [3, 'years'],
      },
      majorTickFormat: 'MMM YYYY',
      middleTickFormat: 'DD',
    },
    '1 year': {
      rangeStep: {
        minor: [1, 'years'],
        middle: [2, 'years'],
        major: [10, 'years'],
      },
      majorTickFormat: 'YYYY',
      middleTickFormat: 'MMM DD',
    },
  }
  const scaleStepper = toReactive(useStepper(scaleSequence, '1 day'))
  const rawDates = computed(() => flat(select(events.value, e => [e.start_date, e.end_date], v => isDefined(v.start_date))).filter(v => isDefined(v)))
  const dayjsDates = useDatesToMinMax(rawDates)
  const dayjsDurations = computed(() => ({
    minor: dayjs.duration({ [scaleStepper.current.rangeStep.minor[1]]: scaleStepper.current.rangeStep.minor[0] }),
    middle: dayjs.duration({ [scaleStepper.current.rangeStep.middle[1]]: scaleStepper.current.rangeStep.middle[0] }),
    major: dayjs.duration({ [scaleStepper.current.rangeStep.major[1]]: scaleStepper.current.rangeStep.major[0] }),
  }))

  const numberOfTicks = computed(() => {
    const dayjsDiff = dayjsDates.value.max.diff(dayjsDates.value.min)
    return floor(dayjsDiff / dayjsDurations.value.middle.asMilliseconds())
  })
  const pixelRange = computed(() => makeDestructurable({
    left: 0,
    tickContainerWidth: numberOfTicks.value * options.value.optimal_tick_width,
  }, [
    0,
    numberOfTicks.value * options.value.optimal_tick_width,
  ]))
  const dayjsTicks = computed(() => {
    const pixelToDate = scaleLinear().range([dayjsDates.value.min.valueOf(), dayjsDates.value.max.valueOf()]).domain([0, numberOfTicks.value * options.value.optimal_tick_width])
    const ticks: { position: number, dayjs: Dayjs, type: 'major' | 'middle' | 'minor' }[] = []
    const maxWidth = numberOfTicks.value * options.value.optimal_tick_width + options.value.width / 2
    let current = options.value.width / -2
    let i = 0
    while (current <= maxWidth) {
      const type = i % floor(dayjsDurations.value.major.asMilliseconds() / dayjsDurations.value.minor.asMilliseconds()) === 0 ? 'major' : i % floor(dayjsDurations.value.middle.asMilliseconds() / dayjsDurations.value.minor.asMilliseconds()) === 0 ? 'middle' : 'minor'
      ticks.push({
        position: current,
        dayjs: dayjs.utc(pixelToDate(current)),
        type,
      })
      i++
      current += options.value.optimal_tick_width
    }
    return {
      min: { dayjs: dayjs.min(ticks.map(t => t.dayjs)), position: min(ticks.map(t => t.position)) },
      max: { dayjs: dayjs.max(ticks.map(t => t.dayjs)), position: max(ticks.map(t => t.position)) },
      ticks,
    }
  })
  // Tick calculations
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

  // Raw timeline data (for components that expect unparsed data)
  const rawData = computed<TimelineData>(() => {
    return {
      title: title.value,
      events: events.value,
      eras: eras.value,
      scale: scale.value,
    }
  })
  // Zoom and pixel calculations
  /** This is the width of the containers that hold the marker elements tick elements */
  const tickContainerWidth = computed(() => dayjsTicks.value.ticks.length * options.value.optimal_tick_width)
  const tickContainerBoundsStyle = computed(() => ({
    width: `${tickContainerWidth.value + options.value.width}px`,
    height: `${timeNavHeight.value}px`,
    left: `${-options.value.width / 2}px`,
  }))
  const dayjsToPixel = computed(() => (dayjsVal: Dayjs) => scaleTime().domain([dayjsTicks.value.min!.dayjs!.toDate(), dayjsTicks.value.max!.dayjs!.toDate()]).range([dayjsTicks.value.min.position, dayjsTicks.value.max.position])(dayjsVal.toDate()) - options.value.width / 2)
  const pixelToDayjs = computed(() => (pixel: number) => dayjs.utc(scaleTime().domain([dayjsTicks.value.min!.dayjs!.toDate(), dayjsTicks.value.max!.dayjs!.toDate()]).range([dayjsTicks.value.min.position, dayjsTicks.value.max.position]).invert(pixel)))

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
      start_date: dayjs.utc(title.value.start_date),
      end_date: title.value.end_date ? dayjs.utc(title.value.end_date) : undefined,
    }
  })

  const parsedEvents = useArrayMap(events, (event) => {
    const generatedUniqueId = event.unique_id || crypto.randomUUID()
    const startDate = dayjs.utc(event.start_date)
    const endDate = event.end_date ? dayjs.utc(event.end_date) : undefined
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
      range: { start: startDate, end: endDate },
      position: dayjsToPixel.value(startDate) + options.value.width / 2,
      startDateDisplay: startDate.format(startDateFormat),
      endDateDisplay: endDate ? endDate.format(endDateFormat) : undefined,
    }
    return slide
  })

  const parsedEventsSorted = useSorted(parsedEvents, (a, b) => {
    return a.start_date.isBefore(b.start_date) ? -1 : a.start_date.isSame(b.start_date) ? 0 : 1
  })

  const parsedEras = computed(() => {
    return sortBy(eras.value.map((era) => {
      return {
        ...era,
        unique_id: era.unique_id || crypto.randomUUID(),
        start_date: dayjs.utc(era.start_date),
        end_date: dayjs.utc(era.end_date),
        range: { start: dayjs.utc(era.start_date), end: dayjs.utc(era.end_date) },
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
    dayjsDates,
    dayjsDurations,

    // Actions
    setData,
    setOptions,
    setLanguage,

    // Size Calculations
    timeNavHeight,
    timeAxisHeight,
    storySliderHeight,
    tickContainerWidth,
    pixelRange,
    tickContainerBoundsStyle,

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
    dayjsTicks,

    // Pixel to date scale mapping
    dayjsToPixel,
    pixelToDayjs,
  }
})
