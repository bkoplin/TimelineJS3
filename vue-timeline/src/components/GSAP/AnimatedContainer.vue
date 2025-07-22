<script setup lang="ts">
import type { StyleValue } from 'vue'
import { useGsap } from '@/composables/useGsap'

// Custom animation configuration types
interface CustomFromVars {
  /** Any GSAP-compatible CSS properties for initial state */
  [key: string]: any
}

interface CustomToVars {
  /** Any GSAP-compatible CSS properties for final state */
  [key: string]: any
}

interface TimelineStep {
  /** CSS selector for targeting child elements (optional, defaults to container) */
  selector?: string
  /** Initial state properties for this timeline step */
  from?: CustomFromVars
  /** Final state properties for this timeline step */
  to: CustomToVars
  /** Duration for this step in seconds */
  duration?: number
  /** Delay before this step starts in seconds */
  delay?: number
  /** Easing function for this step */
  ease?: string
  /** Timeline position: number (absolute time) or string (relative position like "+=0.5") */
  position?: string | number
}

interface Props {
  /**
   * Type of animation to perform
   * @default 'fadeIn'
   */
  type?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'custom' | 'timeline'

  /**
   * Animation duration in seconds
   * @default 1
   */
  duration?: number

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number

  /**
   * Easing function for the animation
   * @default 'power2.out'
   * @example 'bounce.out', 'elastic.out(1, 0.3)', 'back.out(1.7)'
   */
  ease?: string

  /**
   * Direction for slide animations
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right'

  /**
   * Distance in pixels for slide animations
   * @default 50
   */
  distance?: number

  /**
   * Initial scale value for scale animations
   * @default 0
   */
  fromScale?: number

  /**
   * Final scale value for scale animations
   * @default 1
   */
  toScale?: number

  /**
   * Initial rotation angle in degrees for rotation animations
   * @default 0
   */
  fromRotation?: number

  /**
   * Final rotation angle in degrees for rotation animations
   * @default 360
   */
  toRotation?: number

  /**
   * Initial state properties for custom animations
   * @example { opacity: 0, x: 100, scale: 0.5 }
   */
  customFrom?: CustomFromVars

  /**
   * Final state properties for custom animations
   * @example { opacity: 1, x: 0, scale: 1 }
   */
  customTo?: CustomToVars

  /**
   * Array of animation steps for timeline animations
   * @example [{ to: { opacity: 1 }, duration: 1 }, { to: { x: 100 }, duration: 0.5 }]
   */
  timelineSteps?: TimelineStep[]

  /**
   * What triggers the animation
   * @default 'immediate'
   */
  trigger?: 'immediate' | 'hover' | 'click' | 'custom'

  /**
   * CSS class(es) to apply to the container
   * @example 'animated-card highlight'
   */
  containerClass?: string | object

  /**
   * Inline styles to apply to the container
   * @example { backgroundColor: 'red', padding: '20px' }
   */
  containerStyle?: StyleValue

  /**
   * Whether to start animation automatically
   * @default true
   */
  autoPlay?: boolean

  /**
   * Whether to loop the animation continuously
   * @default false
   */
  loop?: boolean

  /**
   * Whether to reverse animation direction on alternate iterations
   * @default false
   */
  yoyo?: boolean

  /**
   * Number of times to repeat the animation (-1 for infinite)
   * @default 0
   */
  repeat?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'fadeIn',
  duration: 1,
  delay: 0,
  ease: 'power2.out',
  direction: 'up',
  distance: 50,
  fromScale: 0,
  toScale: 1,
  fromRotation: 0,
  toRotation: 360,
  customFrom: () => ({}),
  customTo: () => ({}),
  timelineSteps: () => [],
  trigger: 'immediate',
  autoPlay: true,
  loop: false,
  yoyo: false,
  repeat: 0,
})

const emit = defineEmits<Emits>()

interface Emits {
  /** Fired when animation starts */
  animationStart: []
  /** Fired when animation completes */
  animationComplete: []
  /** Fired during animation with progress value (0-1) */
  animationUpdate: [progress: number]
}

// Composable and refs
const { to, set, killTweensOf, timeline: createTimeline } = useGsap()
const containerRef = ref<HTMLElement>()

// State
const isVisible = ref(false)
const progress = ref(0)
const isAnimating = ref(false)
const currentTimeline = ref<any>(null)

// Animation functions
function getAnimationVars() {
  const baseVars = {
    duration: props.duration,
    delay: props.delay,
    ease: props.ease,
    repeat: props.repeat,
    yoyo: props.yoyo,
    onStart: () => {
      isAnimating.value = true
      emit('animationStart')
    },
    onUpdate(this: any) {
      progress.value = this.progress()
      emit('animationUpdate', progress.value)
    },
    onComplete: () => {
      isAnimating.value = false
      isVisible.value = true
      emit('animationComplete')

      if (props.loop && !props.yoyo) {
        setTimeout(() => playAnimation(), 100)
      }
    },
  }

  // Handle custom animation type
  if (props.type === 'custom') {
    return {
      from: props.customFrom || {},
      to: { ...props.customTo, ...baseVars },
    }
  }

  switch (props.type) {
    case 'fadeIn':
      return {
        from: { opacity: 0 },
        to: { opacity: 1, ...baseVars },
      }

    case 'slideIn': {
      const slideVars: any = { opacity: 0 }
      const slideToVars: any = { opacity: 1 }

      switch (props.direction) {
        case 'up':
          slideVars.y = props.distance
          slideToVars.y = 0
          break
        case 'down':
          slideVars.y = -props.distance
          slideToVars.y = 0
          break
        case 'left':
          slideVars.x = -props.distance
          slideToVars.x = 0
          break
        case 'right':
          slideVars.x = props.distance
          slideToVars.x = 0
          break
      }

      return {
        from: slideVars,
        to: { ...slideToVars, ...baseVars },
      }
    }

    case 'scaleIn':
      return {
        from: { scale: props.fromScale, opacity: 0 },
        to: { scale: props.toScale, opacity: 1, ...baseVars },
      }

    case 'rotateIn':
      return {
        from: { rotation: props.fromRotation, opacity: 0 },
        to: { rotation: props.toRotation, opacity: 1, ...baseVars },
      }

    case 'bounceIn':
      return {
        from: { scale: 0, opacity: 0 },
        to: {
          scale: props.toScale,
          opacity: 1,
          ease: 'elastic.out(1, 0.5)',
          duration: props.duration,
          delay: props.delay,
          repeat: props.repeat,
          yoyo: props.yoyo,
          onStart: baseVars.onStart,
          onUpdate: baseVars.onUpdate,
          onComplete: baseVars.onComplete,
        },
      }

    default:
      return {
        from: { opacity: 0 },
        to: { opacity: 1, ...baseVars },
      }
  }
}

function playTimelineAnimation() {
  if (!containerRef.value || !props.timelineSteps?.length)
    return

  // Kill any existing timeline
  if (currentTimeline.value) {
    currentTimeline.value.kill()
  }

  // Create new timeline
  currentTimeline.value = createTimeline({
    onStart: () => {
      isAnimating.value = true
      emit('animationStart')
    },
    onUpdate(this: any) {
      progress.value = this.progress()
      emit('animationUpdate', progress.value)
    },
    onComplete: () => {
      isAnimating.value = false
      isVisible.value = true
      emit('animationComplete')

      if (props.loop) {
        currentTimeline.value.restart()
      }
    },
  })

  // Add each step to the timeline
  props.timelineSteps.forEach((step, index) => {
    const target = step.selector
      ? containerRef.value!.querySelectorAll(step.selector)
      : containerRef.value!

    // Set initial state if provided
    if (step.from) {
      currentTimeline.value.set(target, step.from, step.position || index === 0 ? 0 : undefined)
    }

    // Add animation
    const animVars = {
      ...step.to,
      duration: step.duration || props.duration,
      ease: step.ease || props.ease,
    }

    currentTimeline.value.to(target, animVars, step.position)
  })

  // Add repeat and yoyo
  if (props.repeat > 0) {
    currentTimeline.value.repeat(props.repeat)
  }
  if (props.yoyo) {
    currentTimeline.value.yoyo(true)
  }
}

function playAnimation() {
  if (!containerRef.value)
    return

  // Handle timeline animation
  if (props.type === 'timeline') {
    playTimelineAnimation()
    return
  }

  const { from: fromVars, to: toVars } = getAnimationVars()

  // Set initial state
  set(containerRef.value, fromVars)

  // Animate to final state
  to(containerRef.value, toVars)
}

function playReverseAnimation() {
  if (!containerRef.value)
    return

  // Handle timeline reverse
  if (props.type === 'timeline' && currentTimeline.value) {
    currentTimeline.value.reverse()
    return
  }

  const { from: fromVars } = getAnimationVars()

  to(containerRef.value, {
    ...fromVars,
    duration: props.duration * 0.5,
    ease: 'power2.in',
    onComplete: () => {
      isVisible.value = false
      isAnimating.value = false
    },
  })
}

function resetAnimation() {
  if (!containerRef.value)
    return

  // Kill timeline if exists
  if (currentTimeline.value) {
    currentTimeline.value.kill()
    currentTimeline.value = null
  }

  killTweensOf(containerRef.value)

  // Reset to initial state
  if (props.type === 'timeline' && props.timelineSteps?.length) {
    const firstStep = props.timelineSteps[0]
    if (firstStep.from) {
      const target = firstStep.selector
        ? containerRef.value.querySelectorAll(firstStep.selector)
        : containerRef.value
      set(target, firstStep.from)
    }
  }
  else {
    const { from: fromVars } = getAnimationVars()
    set(containerRef.value, fromVars)
  }

  isVisible.value = false
  progress.value = 0
  isAnimating.value = false
}

// Event handlers
function handleMouseEnter() {
  if (props.trigger === 'hover') {
    playAnimation()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    playReverseAnimation()
  }
}

function handleClick() {
  if (props.trigger === 'click') {
    if (isVisible.value) {
      playReverseAnimation()
    }
    else {
      playAnimation()
    }
  }
}

// Watchers
watch(
  () => [props.type, props.duration, props.delay, props.ease, props.direction, props.distance, props.customFrom, props.customTo, props.timelineSteps],
  () => {
    if (props.autoPlay && props.trigger === 'immediate') {
      resetAnimation()
      setTimeout(playAnimation, 50)
    }
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  if (props.autoPlay && props.trigger === 'immediate') {
    setTimeout(playAnimation, props.delay * 1000)
  }
  else if (props.trigger !== 'immediate' && containerRef.value) {
    // Set initial state for non-immediate triggers
    if (props.type === 'timeline' && props.timelineSteps?.length) {
      const firstStep = props.timelineSteps[0]
      if (firstStep.from) {
        const target = firstStep.selector
          ? containerRef.value.querySelectorAll(firstStep.selector)
          : containerRef.value
        set(target, firstStep.from)
      }
    }
    else {
      const { from: fromVars } = getAnimationVars()
      set(containerRef.value, fromVars)
    }
  }
})

// Expose methods for programmatic control
defineExpose({
  play: playAnimation,
  reverse: playReverseAnimation,
  reset: resetAnimation,
  timeline: computed(() => currentTimeline.value),
  isVisible: computed(() => isVisible.value),
  isAnimating: computed(() => isAnimating.value),
  progress: computed(() => progress.value),
})
</script>

<template>
  <div
    ref="containerRef"
    class="animated-container block hover:cursor-pointer"
    :class="containerClass"
    :style="containerStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <slot
      :is-visible="isVisible"
      :progress="progress"
      :is-animating="isAnimating"
    />
  </div>
</template>

<style scoped>
.animated-container {
  display: block;
}

.animated-container[data-trigger="hover"] {
  cursor: pointer;
}

.animated-container[data-trigger="click"] {
  cursor: pointer;
  user-select: none;
}
</style>
