<script lang="ts" setup>
import type { gsap } from '@/composables/useGsap'
import { ScrollTrigger } from '@/composables/useGsap'

// Define props that match ScrollTrigger.Vars interface
interface Props {
  // Core ScrollTrigger properties
  trigger?: gsap.DOMTarget
  start?: string | number
  end?: string | number
  endTrigger?: gsap.DOMTarget
  scroller?: gsap.DOMTarget
  scrub?: boolean | number
  pin?: boolean | gsap.DOMTarget
  pinSpacing?: boolean | string
  pinType?: 'fixed' | 'transform'
  pinReparent?: boolean
  anticipatePin?: number
  snap?: number | number[] | ScrollTrigger.SnapFunc | 'labels' | 'labelsDirectional' | ScrollTrigger.SnapVars
  horizontal?: boolean
  id?: string
  markers?: boolean | ScrollTrigger.MarkersVars
  refreshPriority?: number
  invalidateOnRefresh?: boolean
  fastScrollEnd?: boolean | number
  preventOverlaps?: boolean | string
  once?: boolean
  toggleActions?: string
  toggleClass?: string | ScrollTrigger.ToggleClassVars

  // Callback properties
  onEnter?: ScrollTrigger.Callback
  onEnterBack?: ScrollTrigger.Callback
  onLeave?: ScrollTrigger.Callback
  onLeaveBack?: ScrollTrigger.Callback
  onRefresh?: ScrollTrigger.Callback
  onRefreshInit?: ScrollTrigger.Callback
  onSnapComplete?: ScrollTrigger.Callback
  onScrubComplete?: ScrollTrigger.Callback
  onToggle?: ScrollTrigger.Callback
  onUpdate?: ScrollTrigger.Callback

  // Vue-specific props
  disabled?: boolean
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  autoRefresh: true,
  start: 'top bottom',
  end: 'bottom top',
})

// Define events
const emit = defineEmits<{
  enter: [scrollTrigger: ScrollTrigger]
  enterback: [scrollTrigger: ScrollTrigger]
  leave: [scrollTrigger: ScrollTrigger]
  leaveback: [scrollTrigger: ScrollTrigger]
  refresh: [scrollTrigger: ScrollTrigger]
  refreshinit: [scrollTrigger: ScrollTrigger]
  snapcomplete: [scrollTrigger: ScrollTrigger]
  scrubcomplete: [scrollTrigger: ScrollTrigger]
  toggle: [scrollTrigger: ScrollTrigger]
  update: [scrollTrigger: ScrollTrigger]
}>()

const containerRef = ref<HTMLElement>()
const scrollTriggerInstance = ref<ScrollTrigger>()

// Reactive properties to track ScrollTrigger state
const direction = ref(0)
const isActive = ref(false)
const progress = ref(0)
const start = ref(0)
const end = ref(0)
const getVelocity = ref<() => number>(() => 0)

// Function to update reactive properties from ScrollTrigger instance
function updateReactiveProperties() {
  if (!scrollTriggerInstance.value) {
    return
  }

  const instance = scrollTriggerInstance.value
  direction.value = instance.direction
  isActive.value = instance.isActive
  progress.value = instance.progress
  start.value = instance.start
  end.value = instance.end
  getVelocity.value = instance.getVelocity
}

// Methods that proxy to the ScrollTrigger instance
function disable(includeAnimation?: boolean, reset?: boolean) {
  return scrollTriggerInstance.value?.disable(includeAnimation, reset)
}

function enable(includeAnimation?: boolean, reset?: boolean) {
  return scrollTriggerInstance.value?.enable(includeAnimation, reset)
}

function kill(revert?: boolean, allowAnimation?: boolean) {
  return scrollTriggerInstance.value?.kill(revert, allowAnimation)
}

function refresh() {
  const result = scrollTriggerInstance.value?.refresh()
  updateReactiveProperties()
  return result
}

function update(reset?: boolean, updateAnimations?: boolean) {
  const result = scrollTriggerInstance.value?.update(reset, updateAnimations)
  updateReactiveProperties()
  return result
}

function getTween() {
  return scrollTriggerInstance.value?.getTween()
}

// Create the ScrollTrigger configuration from props
function createScrollTriggerConfig(): ScrollTrigger.Vars {
  const config: ScrollTrigger.Vars = {}

  // Copy all valid ScrollTrigger properties
  if (props.trigger) {
    config.trigger = props.trigger
  }
  if (props.start) {
    config.start = props.start
  }
  if (props.end) {
    config.end = props.end
  }
  if (props.endTrigger) {
    config.endTrigger = props.endTrigger
  }
  if (props.scroller) {
    config.scroller = props.scroller
  }
  if (props.scrub !== undefined) {
    config.scrub = props.scrub
  }
  if (props.pin !== undefined) {
    config.pin = props.pin
  }
  if (props.pinSpacing !== undefined) {
    config.pinSpacing = props.pinSpacing
  }
  if (props.pinType) {
    config.pinType = props.pinType
  }
  if (props.pinReparent !== undefined) {
    config.pinReparent = props.pinReparent
  }
  if (props.anticipatePin !== undefined) {
    config.anticipatePin = props.anticipatePin
  }
  if (props.snap !== undefined) {
    config.snap = props.snap
  }
  if (props.horizontal !== undefined) {
    config.horizontal = props.horizontal
  }
  if (props.id) {
    config.id = props.id
  }
  if (props.markers !== undefined) {
    config.markers = props.markers
  }
  if (props.refreshPriority !== undefined) {
    config.refreshPriority = props.refreshPriority
  }
  if (props.invalidateOnRefresh !== undefined) {
    config.invalidateOnRefresh = props.invalidateOnRefresh
  }
  if (props.fastScrollEnd !== undefined) {
    config.fastScrollEnd = props.fastScrollEnd
  }
  if (props.preventOverlaps !== undefined) {
    config.preventOverlaps = props.preventOverlaps
  }
  if (props.once !== undefined) {
    config.once = props.once
  }
  if (props.toggleActions) {
    config.toggleActions = props.toggleActions
  }
  if (props.toggleClass) {
    config.toggleClass = props.toggleClass
  }

  // Use container as trigger if no trigger is specified
  if (!config.trigger && containerRef.value) {
    config.trigger = containerRef.value
  }

  // Set up event callbacks to emit Vue events and update reactive properties
  config.onEnter = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('enter', self)
    props.onEnter?.(self)
  }

  config.onEnterBack = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('enterback', self)
    props.onEnterBack?.(self)
  }

  config.onLeave = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('leave', self)
    props.onLeave?.(self)
  }

  config.onLeaveBack = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('leaveback', self)
    props.onLeaveBack?.(self)
  }

  config.onRefresh = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('refresh', self)
    props.onRefresh?.(self)
  }

  config.onRefreshInit = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('refreshinit', self)
    props.onRefreshInit?.(self)
  }

  config.onSnapComplete = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('snapcomplete', self)
    props.onSnapComplete?.(self)
  }

  config.onScrubComplete = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('scrubcomplete', self)
    props.onScrubComplete?.(self)
  }

  config.onToggle = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('toggle', self)
    props.onToggle?.(self)
  }

  config.onUpdate = (self: ScrollTrigger) => {
    updateReactiveProperties()
    emit('update', self)
    props.onUpdate?.(self)
  }

  return config
}

// Initialize ScrollTrigger
function initScrollTrigger() {
  if (!containerRef.value && !props.trigger) {
    return
  }

  const config = createScrollTriggerConfig()
  const instance = ScrollTrigger.create(config)
  scrollTriggerInstance.value = instance

  // Handle disabled state
  if (props.disabled) {
    instance.disable()
  }

  // Update reactive properties immediately
  updateReactiveProperties()
}

// Clean up ScrollTrigger
function destroyScrollTrigger() {
  if (scrollTriggerInstance.value) {
    scrollTriggerInstance.value.kill()
    scrollTriggerInstance.value = undefined
  }
}

// Watch for disabled prop changes
watch(() => props.disabled, (disabled) => {
  if (scrollTriggerInstance.value) {
    if (disabled) {
      scrollTriggerInstance.value.disable()
    }
    else {
      scrollTriggerInstance.value.enable()
    }
  }
})

// Watch for other prop changes and recreate ScrollTrigger
watch(() => ({ ...props }), () => {
  destroyScrollTrigger()
  nextTick(() => {
    initScrollTrigger()
  })
}, { deep: true })

// Auto-refresh on resize if enabled
let resizeObserver: ResizeObserver | undefined

function setupAutoRefresh() {
  if (props.autoRefresh && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (scrollTriggerInstance.value) {
        scrollTriggerInstance.value.refresh()
      }
    })

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }
  }
}

function cleanupAutoRefresh() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = undefined
  }
}

onMounted(() => {
  nextTick(() => {
    initScrollTrigger()
    setupAutoRefresh()
  })
})

onUnmounted(() => {
  destroyScrollTrigger()
  cleanupAutoRefresh()
})

// Expose all properties and methods to parent
defineExpose({
  // Properties
  containerRef,
  direction,
  isActive,
  progress,
  start,
  end,
  getVelocity,

  // Methods
  disable,
  enable,
  kill,
  refresh,
  update,
  getTween,

  // Direct access to instance
  instance: scrollTriggerInstance,
})
</script>

<template>
  <div ref="containerRef">
    <slot />
  </div>
</template>
