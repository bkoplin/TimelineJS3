<script setup lang="ts">
import type { Draggable } from '@/composables/registerGsap'
import type { DraggableOptions } from '@/composables/useDraggable'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDraggable } from '@/composables/useDraggable'
import { useGsap } from '@/composables/useGsap'

export interface DraggableContainerProps {
  /**
   * The type of draggable movement allowed
   * @default 'x,y'
   */
  type?: 'x' | 'y' | 'x,y' | 'rotation'

  /**
   * CSS selector for the bounds container element that constrains dragging
   * @example '#bounds-container' or '.bounds-area'
   */
  boundsSelector?: string

  /**
   * CSS class(es) to apply to the bounds container
   * @example 'custom-bounds highlighted'
   */
  boundsClass?: string

  /**
   * CSS selector for the trigger element that initiates dragging
   * @example '.drag-handle' or '#trigger-button'
   */
  triggerSelector?: string

  /**
   * CSS class(es) to apply to the trigger element
   * @example 'drag-handle custom-trigger'
   */
  triggerClass?: string

  /**
   * CSS class(es) to apply to the draggable element itself
   * @example 'draggable-item animated'
   */
  draggableClass?: string

  /**
   * Target X position for programmatic movement (in pixels)
   * @example 100
   */
  targetX?: number

  /**
   * Target Y position for programmatic movement (in pixels)
   * @example 200
   */
  targetY?: number

  /**
   * Target rotation angle for programmatic movement (in degrees)
   * @example 45
   */
  targetRotation?: number

  /**
   * Whether to animate when moving to target positions programmatically
   * @default true
   */
  animateToTarget?: boolean

  /**
   * Duration of programmatic movement animations (in seconds)
   * @default 0.5
   */
  animationDuration?: number

  /**
   * Easing function for programmatic movement animations
   * @default 'power2.out'
   * @example 'bounce.out', 'elastic.out(1, 0.3)'
   */
  animationEase?: string

  /**
   * Resistance when dragging near edges of bounds (0-1, where 1 is maximum resistance)
   * @default 0.65
   * @example 0.8 for high resistance, 0.2 for low resistance
   */
  edgeResistance?: number

  /**
   * Enable throwing/momentum when dragging with velocity
   * @default true
   */
  throwProps?: boolean

  /**
   * Enable inertia physics for natural movement continuation
   * @default true
   */
  inertia?: boolean

  /**
   * Lock dragging to a single axis after movement begins
   * @default false
   */
  lockAxis?: boolean

  /**
   * Snap configuration for constraining movement to specific positions
   * @example { x: [0, 50, 100], y: [0, 25, 50] }
   * @example { x: (value) => Math.round(value/10)*10 }
   */
  snap?: {
    /** X-axis snap points as array or function */
    x?: number[] | ((value: number) => number)
    /** Y-axis snap points as array or function */
    y?: number[] | ((value: number) => number)
    /** Rotation snap points as array or function */
    rotation?: number[] | ((value: number) => number)
  }

  /**
   * Allow right-click context menu during dragging
   * @default false
   */
  allowContextMenu?: boolean

  /**
   * Allow default browser event behavior during dragging
   * @default false
   */
  allowEventDefault?: boolean

  /**
   * Allow native touch scrolling on mobile devices
   * @default true
   */
  allowNativeTouchScrolling?: boolean

  /**
   * Enable auto-scrolling when dragging near viewport edges (scroll speed multiplier)
   * @default 0
   * @example 2 for moderate auto-scroll, 5 for fast auto-scroll
   */
  autoScroll?: number

  /**
   * Allow dragging of clickable elements (buttons, links, etc.)
   * @default false
   */
  dragClickables?: boolean

  /**
   * Resistance when starting to drag (0-1, where 1 is maximum resistance)
   * @default 0
   * @example 0.3 for slight resistance before dragging begins
   */
  dragResistance?: number

  /**
   * Force 3D GPU acceleration for better performance
   * @default true
   */
  force3D?: boolean

  /**
   * Enable live snapping during drag (vs. only on release)
   * @default undefined (uses GSAP default)
   */
  liveSnap?: boolean

  /**
   * Minimum distance (in pixels) before drag begins
   * @default 2
   * @example 10 to prevent accidental drags
   */
  minimumMovement?: number

  /**
   * Tolerance for overshooting snap points (in pixels)
   * @default 0
   * @example 5 to allow slight overshoot before snapping
   */
  overshootTolerance?: number

  /**
   * Temporarily increase z-index during dragging
   * @default true
   */
  zIndexBoost?: boolean

  /**
   * CSS cursor style during dragging
   * @default 'grab'
   * @example 'move', 'grabbing', 'pointer'
   */
  cursor?: string

  /**
   * Automatically setup draggable on component mount
   * @default true
   */
  autoSetup?: boolean

  /**
   * Disable all dragging functionality
   * @default false
   */
  disabled?: boolean
}

export interface DraggableContainerEmits {
  /** Fired continuously while dragging */
  (e: 'drag', event: Event): void
  /** Fired when dragging starts */
  (e: 'drag-start', event: Event): void
  /** Fired when dragging ends */
  (e: 'drag-end', event: Event): void
  /** Fired when mouse/touch press occurs */
  (e: 'press', event: Event): void
  /** Fired when mouse/touch release occurs */
  (e: 'release', event: Event): void
  /** Fired during throw/momentum animation */
  (e: 'throw-update', event: Event): void
  /** Fired when throw/momentum animation completes */
  (e: 'throw-complete', event: Event): void
  /** Fired when draggable instances are created */
  (e: 'created', instances: Draggable[]): void
  /** Fired when draggable instances are destroyed */
  (e: 'destroyed'): void
  /** Fired when programmatic movement starts */
  (e: 'move-start'): void
  /** Fired when programmatic movement completes */
  (e: 'move-complete'): void
  /** Fired when position changes, provides current coordinates */
  (e: 'position-update', position: { x: number, y: number, rotation: number }): void
}

const props = withDefaults(defineProps<DraggableContainerProps>(), {
  type: 'x,y',
  edgeResistance: 0.65,
  throwProps: true,
  inertia: true,
  autoSetup: true,
  disabled: false,
  force3D: true,
  zIndexBoost: true,
  animateToTarget: true,
  animationDuration: 0.5,
  animationEase: 'power2.out',
})

const emit = defineEmits<DraggableContainerEmits>()

// Template refs
const containerRef = ref<HTMLElement>()
const draggableRef = ref<HTMLElement>()
const boundsRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()

// Draggable state
const isDragging = ref(false)
const isPressed = ref(false)
const draggableInstances = ref<Draggable[]>([])
const isMovingProgrammatically = ref(false)
const currentPosition = ref({ x: 0, y: 0, rotation: 0 })

// Composables
const { create, kill } = useDraggable()
const { to: gsapTo, killTweensOf } = useGsap()

// Computed properties
const hasBounds = computed(() => !!props.boundsSelector || !!boundsRef.value)
const hasTrigger = computed(() => !!props.triggerSelector || !!triggerRef.value)

// Create draggable configuration
function createDraggableConfig(): DraggableOptions {
  const config: DraggableOptions = {
    type: props.type,
    edgeResistance: props.edgeResistance,
    throwProps: props.throwProps,
    inertia: props.inertia,
    lockAxis: props.lockAxis,
    allowContextMenu: props.allowContextMenu,
    allowEventDefault: props.allowEventDefault,
    allowNativeTouchScrolling: props.allowNativeTouchScrolling,
    autoScroll: props.autoScroll,
    dragClickables: props.dragClickables,
    dragResistance: props.dragResistance,
    force3D: props.force3D,
    liveSnap: props.liveSnap,
    minimumMovement: props.minimumMovement,
    overshootTolerance: props.overshootTolerance,
    zIndexBoost: props.zIndexBoost,
    cursor: props.cursor,

    // Event handlers
    onDrag: (event) => {
      isDragging.value = true
      if (!isMovingProgrammatically.value) {
        updateCurrentPosition()
      }
      emit('drag', event as Event)
    },
    onDragStart: (event) => {
      isDragging.value = true
      isPressed.value = true
      emit('drag-start', event as Event)
    },
    onDragEnd: (event) => {
      isDragging.value = false
      isPressed.value = false
      updateCurrentPosition()
      emit('drag-end', event as Event)
    },
    onPress: (event) => {
      isPressed.value = true
      emit('press', event as Event)
    },
    onRelease: (event) => {
      isPressed.value = false
      emit('release', event as Event)
    },
    onThrowUpdate: (event) => {
      emit('throw-update', event as Event)
    },
    onThrowComplete: (event) => {
      isDragging.value = false
      emit('throw-complete', event as Event)
    },
  }

  // Handle snap configuration properly
  if (props.snap) {
    console.log('Raw snap configuration:', props.snap)
    // Ensure snap values are unwrapped from reactive objects and properly formatted
    const snapConfig: any = {}

    if (props.snap.x !== undefined) {
      snapConfig.x = Array.isArray(props.snap.x) ? [...props.snap.x] : props.snap.x
    }
    if (props.snap.y !== undefined) {
      snapConfig.y = Array.isArray(props.snap.y) ? [...props.snap.y] : props.snap.y
    }
    if (props.snap.rotation !== undefined) {
      snapConfig.rotation = Array.isArray(props.snap.rotation) ? [...props.snap.rotation] : props.snap.rotation
    }

    config.snap = snapConfig
    console.log('Processed snap config:', snapConfig)
  }

  // Add bounds if specified
  if (props.boundsSelector) {
    config.bounds = props.boundsSelector
  }
  else if (boundsRef.value) {
    // For GSAP Draggable to work properly, we need to provide bounds relative to the parent container
    config.bounds = boundsRef.value
  }
  else if (containerRef.value && containerRef.value.querySelector('.draggable-bounds')) {
    // Fallback: look for bounds container in parent
    config.bounds = containerRef.value.querySelector('.draggable-bounds') as HTMLElement
  }

  // Add trigger if specified
  if (props.triggerSelector) {
    config.trigger = props.triggerSelector
  }
  else if (triggerRef.value) {
    config.trigger = triggerRef.value
  }

  return config
}

// Setup draggable
async function setupDraggable() {
  if (!draggableRef.value || props.disabled)
    return

  await nextTick()

  // Kill existing instances
  destroyDraggable()

  try {
    const config = createDraggableConfig()
    console.log('Creating draggable with config:', config)
    const instances = create(draggableRef.value, config)

    draggableInstances.value = instances
    console.log('Draggable instances created:', instances)
    emit('created', instances)
  }
  catch (error) {
    console.error('Failed to create draggable:', error)
  }
}

// Destroy draggable
function destroyDraggable() {
  draggableInstances.value.forEach((instance) => {
    kill(instance)
  })
  draggableInstances.value = []
  isDragging.value = false
  isPressed.value = false
  emit('destroyed')
}

// Enable/disable draggable
function enableDraggable() {
  draggableInstances.value.forEach((instance) => {
    instance.enable()
  })
}

function disableDraggable() {
  draggableInstances.value.forEach((instance) => {
    instance.disable()
  })
}

// Update draggable (useful after DOM changes)
function updateDraggable() {
  draggableInstances.value.forEach((instance) => {
    instance.update()
  })
}

// Update current position from draggable instance
function updateCurrentPosition() {
  if (draggableInstances.value.length > 0) {
    const instance = draggableInstances.value[0]
    currentPosition.value = {
      x: instance.x || 0,
      y: instance.y || 0,
      rotation: instance.rotation || 0,
    }
    emit('position-update', { ...currentPosition.value })
  }
}

// Move to target position programmatically
function moveToTarget(targetX?: number, targetY?: number, targetRotation?: number, animate = true) {
  if (!draggableRef.value || draggableInstances.value.length === 0)
    return

  const target: any = {}

  // Build target object based on draggable type and provided values
  if (props.type.includes('x') && targetX !== undefined) {
    target.x = targetX
  }
  if (props.type.includes('y') && targetY !== undefined) {
    target.y = targetY
  }
  if (props.type === 'rotation' && targetRotation !== undefined) {
    target.rotation = targetRotation
  }

  if (Object.keys(target).length === 0)
    return

  if (animate && props.animateToTarget) {
    isMovingProgrammatically.value = true
    emit('move-start')

    killTweensOf(draggableRef.value)

    gsapTo(draggableRef.value, {
      ...target,
      duration: props.animationDuration,
      ease: props.animationEase,
      onUpdate: () => {
        updateCurrentPosition()
      },
      onComplete: () => {
        isMovingProgrammatically.value = false
        updateCurrentPosition()

        // Update draggable instance to sync with new position
        draggableInstances.value.forEach((instance) => {
          instance.update()
        })

        emit('move-complete')
      },
    })
  }
  else {
    // Immediate positioning without animation
    if (target.x !== undefined) {
      draggableRef.value.style.transform = `translateX(${target.x}px) translateY(${target.y || 0}px) rotate(${target.rotation || 0}deg)`
    }
    if (target.y !== undefined && target.x === undefined) {
      draggableRef.value.style.transform = `translateY(${target.y}px)`
    }
    if (target.rotation !== undefined && target.x === undefined && target.y === undefined) {
      draggableRef.value.style.transform = `rotate(${target.rotation}deg)`
    }

    updateCurrentPosition()

    // Update draggable instance to be aware of new position
    draggableInstances.value.forEach((instance) => {
      instance.update()
    })
  }
}

// Get current position
function getCurrentPosition() {
  updateCurrentPosition()
  return { ...currentPosition.value }
}

// Watch for prop changes
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    disableDraggable()
  }
  else {
    enableDraggable()
  }
})

watch(() => [
  props.type,
  props.boundsSelector,
  props.triggerSelector,
  props.edgeResistance,
  props.snap,
  props.liveSnap,
  props.inertia,
  props.throwProps,
], () => {
  if (draggableInstances.value.length > 0) {
    console.log('Props changed, recreating draggable...')
    setupDraggable()
  }
}, { deep: true })

// Watch for target position changes
watch(() => props.targetX, (newX) => {
  if (newX !== undefined && !isDragging.value) {
    moveToTarget(newX, undefined, undefined, props.animateToTarget)
  }
})

watch(() => props.targetY, (newY) => {
  if (newY !== undefined && !isDragging.value) {
    moveToTarget(undefined, newY, undefined, props.animateToTarget)
  }
})

watch(() => props.targetRotation, (newRotation) => {
  if (newRotation !== undefined && !isDragging.value) {
    moveToTarget(undefined, undefined, newRotation, props.animateToTarget)
  }
})

// Watch for combined target changes
watch(() => [props.targetX, props.targetY, props.targetRotation], ([newX, newY, newRotation]) => {
  if ((newX !== undefined || newY !== undefined || newRotation !== undefined) && !isDragging.value) {
    moveToTarget(newX, newY, newRotation, props.animateToTarget)
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (props.autoSetup) {
    // Small delay to ensure DOM is fully rendered
    setTimeout(setupDraggable, 100)
  }
})

onBeforeUnmount(() => {
  destroyDraggable()
})

// Expose methods
defineExpose({
  setup: setupDraggable,
  destroy: destroyDraggable,
  enable: enableDraggable,
  disable: disableDraggable,
  update: updateDraggable,
  moveToTarget,
  getCurrentPosition,
  instances: draggableInstances,
  position: computed(() => currentPosition.value),
  isMoving: computed(() => isMovingProgrammatically.value),
})
</script>

<template>
  <div
    ref="containerRef"
    class="draggable-container"
    :class="{
      'is-dragging': isDragging,
      'is-pressed': isPressed,
      'has-bounds': hasBounds,
      'has-trigger': hasTrigger,
    }"
  >
    <!-- When bounds are specified, wrap everything in bounds -->
    <div
      v-if="$slots.bounds || boundsSelector"
      ref="boundsRef"
      class="draggable-bounds"
      :class="boundsClass"
    >
      <!-- Bounds slot content -->
      <slot name="bounds">
        <!-- Default bounds container if no slot provided but bounds are enabled -->
        <div class="default-bounds" />
      </slot>

      <!-- Main draggable content inside bounds -->
      <div
        ref="draggableRef"
        class="draggable-element"
        :class="draggableClass"
      >
        <!-- Trigger slot - optional element that initiates dragging -->
        <div
          v-if="$slots.trigger || triggerSelector"
          ref="triggerRef"
          class="draggable-trigger"
          :class="triggerClass"
        >
          <slot name="trigger">
            <!-- Default trigger if no slot provided -->
            <div class="default-trigger">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 12a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM5 17a1 1 0 100 2h10a1 1 0 100-2H5z" />
              </svg>
            </div>
          </slot>
        </div>

        <!-- Main content slot -->
        <slot
          :is-dragging="isDragging"
          :is-pressed="isPressed"
        />
      </div>
    </div>

    <!-- When no bounds, render draggable element directly -->
    <div
      v-else
      ref="draggableRef"
      class="draggable-element no-bounds"
      :class="draggableClass"
    >
      <!-- Trigger slot - optional element that initiates dragging -->
      <div
        v-if="$slots.trigger || triggerSelector"
        ref="triggerRef"
        class="draggable-trigger"
        :class="triggerClass"
      >
        <slot name="trigger">
          <!-- Default trigger if no slot provided -->
          <div class="default-trigger">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 12a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM5 17a1 1 0 100 2h10a1 1 0 100-2H5z" />
            </svg>
          </div>
        </slot>
      </div>

      <!-- Main content slot -->
      <slot
        :is-dragging="isDragging"
        :is-pressed="isPressed"
      />
    </div>
  </div>
</template>

<style scoped>
.draggable-container {
  position: relative;
}

.draggable-bounds {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  overflow: hidden;
}

.default-bounds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  pointer-events: none;
  z-index: 1;
}

.draggable-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  user-select: none;
  touch-action: none;
  z-index: 10;
}

.draggable-element.no-bounds {
  /* When no bounds, use relative positioning */
  position: relative;
  top: auto;
  left: auto;
  transform: none;
}

.draggable-element.is-dragging {
  cursor: grabbing;
  z-index: 1000;
}

.draggable-trigger {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  cursor: grab;
  padding: 0.5rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.draggable-trigger:hover {
  background: rgba(0, 0, 0, 0.2);
}

.draggable-trigger.is-pressed {
  cursor: grabbing;
  background: rgba(0, 0, 0, 0.3);
}

.default-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #666;
}

.default-trigger svg {
  width: 16px;
  height: 16px;
}

/* State classes */
.is-dragging .draggable-element {
  cursor: grabbing;
  z-index: 1000;
}

.is-pressed .draggable-trigger {
  cursor: grabbing;
  background: rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .draggable-trigger {
    padding: 0.75rem;
  }

  .default-trigger {
    width: 24px;
    height: 24px;
  }

  .default-trigger svg {
    width: 20px;
    height: 20px;
  }
}
</style>
