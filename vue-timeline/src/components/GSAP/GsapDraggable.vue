<script lang="ts" setup>
import type { gsap } from 'gsap'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Draggable } from '@/composables/useGsap'

// Define props that match Draggable.Vars interface
interface Props {
  // All Draggable.Vars properties
  activeCursor?: string
  allowContextMenu?: boolean
  allowEventDefault?: boolean
  allowNativeTouchScrolling?: boolean
  autoScroll?: number
  bounds?: gsap.DOMTarget | Draggable.BoundsMinMax | Draggable.BoundsRectangle | Draggable.BoundsRotation
  callbackScope?: object
  clickableTest?: (element: HTMLElement | SVGElement) => void
  cursor?: string
  dragClickables?: boolean
  dragResistance?: number
  edgeResistance?: number
  force3D?: 'auto' | boolean
  inertia?: boolean | gsap.InertiaVars
  liveSnap?: boolean | Draggable.SnapValue | Draggable.SnapObject
  lockAxis?: boolean
  maxDuration?: number
  minDuration?: number
  minimumMovement?: number
  onClick?: gsap.Callback
  onClickParams?: any[]
  onDrag?: gsap.Callback
  onDragParams?: any[]
  onDragStart?: gsap.Callback
  onDragStartParams?: any[]
  onDragEnd?: gsap.Callback
  onDragEndParams?: any[]
  onLockAxis?: (event: Event) => void
  onMove?: gsap.Callback
  onMoveParams?: any[]
  onPress?: gsap.Callback
  onPressParams?: any[]
  onPressInit?: gsap.Callback
  onPressInitParams?: any[]
  onRelease?: gsap.Callback
  onReleaseParams?: any[]
  onThrowComplete?: gsap.Callback
  onThrowCompleteParams?: any[]
  onThrowUpdate?: gsap.Callback
  onThrowUpdateParams?: any[]
  overshootTolerance?: number
  resistance?: number
  snap?: Draggable.SnapValue | Draggable.SnapObject
  throwProps?: boolean | gsap.InertiaVars
  throwResistance?: number
  trigger?: gsap.DOMTarget
  type?: Draggable.DraggableType
  zIndexBoost?: boolean
  
  // Vue-specific props
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// Define all possible events based on Draggable.CallbackType
const emit = defineEmits<{
  click: [event: Event, draggable: Draggable]
  drag: [event: Event, draggable: Draggable]
  dragend: [event: Event, draggable: Draggable]
  dragstart: [event: Event, draggable: Draggable]
  move: [event: Event, draggable: Draggable]
  press: [event: Event, draggable: Draggable]
  release: [event: Event, draggable: Draggable]
  throwcomplete: [event: Event, draggable: Draggable]
  throwupdate: [event: Event, draggable: Draggable]
}>()

const containerRef = ref<HTMLElement>()
const draggableInstance = ref<Draggable>()

// Computed properties that expose Draggable instance properties
const autoScroll = computed(() => draggableInstance.value?.autoScroll ?? 0)
const deltaX = computed(() => draggableInstance.value?.deltaX ?? 0)
const deltaY = computed(() => draggableInstance.value?.deltaY ?? 0)
const endRotation = computed(() => draggableInstance.value?.endRotation ?? 0)
const endX = computed(() => draggableInstance.value?.endX ?? 0)
const endY = computed(() => draggableInstance.value?.endY ?? 0)
const isDragging = computed(() => draggableInstance.value?.isDragging ?? false)
const isPressed = computed(() => draggableInstance.value?.isPressed ?? false)
const isThrowing = computed(() => draggableInstance.value?.isThrowing ?? false)
const lockAxis = computed(() => draggableInstance.value?.lockAxis ?? false)
const maxRotation = computed(() => draggableInstance.value?.maxRotation ?? 0)
const maxX = computed(() => draggableInstance.value?.maxX ?? 0)
const maxY = computed(() => draggableInstance.value?.maxY ?? 0)
const minX = computed(() => draggableInstance.value?.minX ?? 0)
const minY = computed(() => draggableInstance.value?.minY ?? 0)
const minRotation = computed(() => draggableInstance.value?.minRotation ?? 0)
const pointerEvent = computed(() => draggableInstance.value?.pointerEvent)
const pointerX = computed(() => draggableInstance.value?.pointerX ?? 0)
const pointerY = computed(() => draggableInstance.value?.pointerY ?? 0)
const rotation = computed(() => draggableInstance.value?.rotation ?? 0)
const scrollProxy = computed(() => draggableInstance.value?.scrollProxy)
const startX = computed(() => draggableInstance.value?.startX ?? 0)
const startY = computed(() => draggableInstance.value?.startY ?? 0)
const target = computed(() => draggableInstance.value?.target)
const tween = computed(() => draggableInstance.value?.tween)
const vars = computed(() => draggableInstance.value?.vars)
const x = computed(() => draggableInstance.value?.x ?? 0)
const y = computed(() => draggableInstance.value?.y ?? 0)

// Methods that proxy to the Draggable instance
function addEventListener(type: Draggable.CallbackType, callback: gsap.Callback) {
  draggableInstance.value?.addEventListener(type, callback)
}

function applyBounds(bounds: gsap.DOMTarget | Draggable.BoundsMinMax | Draggable.BoundsRectangle | Draggable.BoundsRotation) {
  draggableInstance.value?.applyBounds(bounds)
}

function disable(type?: string | object) {
  return draggableInstance.value?.disable(type)
}

function dispatchEvent(type: Draggable.CallbackType) {
  return draggableInstance.value?.dispatchEvent(type) ?? false
}

function enable(type?: string | object) {
  return draggableInstance.value?.enable(type)
}

function enabled(value?: boolean) {
  if (value !== undefined) {
    return draggableInstance.value?.enabled(value)
  }
  return draggableInstance.value?.enabled() ?? false
}

function endDrag(event: Event) {
  draggableInstance.value?.endDrag(event)
}

function getDirection(from: 'start' | 'velocity' | gsap.DOMTarget) {
  return draggableInstance.value?.getDirection(from)
}

function hitTest(testObject: Draggable.TestObject, threshold?: number | string) {
  return draggableInstance.value?.hitTest(testObject, threshold) ?? false
}

function kill() {
  return draggableInstance.value?.kill()
}

function removeEventListener(type: Draggable.CallbackType, callback: gsap.Callback) {
  draggableInstance.value?.removeEventListener(type, callback)
}

function startDrag(event: Event, align?: boolean) {
  draggableInstance.value?.startDrag(event, align)
}

function timeSinceDrag() {
  return draggableInstance.value?.timeSinceDrag() ?? 0
}

function update(applyBounds?: boolean, sticky?: boolean) {
  return draggableInstance.value?.update(applyBounds, sticky)
}

// Create the draggable configuration from props
function createDraggableConfig(): Draggable.Vars {
  const config: Draggable.Vars = { ...props }
  
  // Remove Vue-specific props
  delete config.disabled

  // Set up event callbacks to emit Vue events
  config.onClick = (event: Event) => {
    if (draggableInstance.value) {
      emit('click', event, draggableInstance.value)
    }
    props.onClick?.(event)
  }

  config.onDrag = (event: Event) => {
    if (draggableInstance.value) {
      emit('drag', event, draggableInstance.value)
    }
    props.onDrag?.(event)
  }

  config.onDragEnd = (event: Event) => {
    if (draggableInstance.value) {
      emit('dragend', event, draggableInstance.value)
    }
    props.onDragEnd?.(event)
  }

  config.onDragStart = (event: Event) => {
    if (draggableInstance.value) {
      emit('dragstart', event, draggableInstance.value)
    }
    props.onDragStart?.(event)
  }

  config.onMove = (event: Event) => {
    if (draggableInstance.value) {
      emit('move', event, draggableInstance.value)
    }
    props.onMove?.(event)
  }

  config.onPress = (event: Event) => {
    if (draggableInstance.value) {
      emit('press', event, draggableInstance.value)
    }
    props.onPress?.(event)
  }

  config.onRelease = (event: Event) => {
    if (draggableInstance.value) {
      emit('release', event, draggableInstance.value)
    }
    props.onRelease?.(event)
  }

  config.onThrowComplete = (event: Event) => {
    if (draggableInstance.value) {
      emit('throwcomplete', event, draggableInstance.value)
    }
    props.onThrowComplete?.(event)
  }

  config.onThrowUpdate = (event: Event) => {
    if (draggableInstance.value) {
      emit('throwupdate', event, draggableInstance.value)
    }
    props.onThrowUpdate?.(event)
  }

  return config
}

// Initialize draggable
function initDraggable() {
  if (!containerRef.value) {
    return
  }

  const config = createDraggableConfig()
  const [instance] = Draggable.create(containerRef.value, config)
  draggableInstance.value = instance

  // Handle disabled state
  if (props.disabled) {
    instance.disable()
  }
}

// Clean up draggable
function destroyDraggable() {
  if (draggableInstance.value) {
    draggableInstance.value.kill()
    draggableInstance.value = undefined
  }
}

// Watch for disabled prop changes
watch(() => props.disabled, (disabled) => {
  if (draggableInstance.value) {
    if (disabled) {
      draggableInstance.value.disable()
    }
    else {
      draggableInstance.value.enable()
    }
  }
})

// Watch for other prop changes and recreate draggable
watch(() => ({ ...props }), () => {
  destroyDraggable()
  nextTick(() => {
    initDraggable()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initDraggable()
  })
})

onUnmounted(() => {
  destroyDraggable()
})

// Expose all properties and methods to parent
defineExpose({
  // Properties
  autoScroll,
  deltaX,
  deltaY,
  endRotation,
  endX,
  endY,
  isDragging,
  isPressed,
  isThrowing,
  lockAxis,
  maxRotation,
  maxX,
  maxY,
  minX,
  minY,
  minRotation,
  pointerEvent,
  pointerX,
  pointerY,
  rotation,
  scrollProxy,
  startX,
  startY,
  target,
  tween,
  vars,
  x,
  y,
  
  // Methods
  addEventListener,
  applyBounds,
  disable,
  dispatchEvent,
  enable,
  enabled,
  endDrag,
  getDirection,
  hitTest,
  kill,
  removeEventListener,
  startDrag,
  timeSinceDrag,
  update,
  
  // Direct access to instance
  instance: draggableInstance,
})
</script>

<template>
  <div ref="containerRef">
    <slot />
  </div>
</template>
