<script lang="ts" setup>
import type { gsap } from '@/composables/useGsap'
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

// Reactive properties to track draggable state
const draggableBounds = toReactive(useElementBounding(containerRef))

// Reactive refs that get updated through draggable callbacks
const autoScroll = ref(0)
const deltaX = ref(0)
const deltaY = ref(0)
const endRotation = ref(0)
const endX = ref(0)
const endY = ref(0)
const isDragging = ref(false)
const isPressed = ref(false)
const isThrowing = ref(false)
const lockAxis = ref(false)
const maxRotation = ref(0)
const maxX = ref(0)
const maxY = ref(0)
const minX = ref(0)
const minY = ref(0)
const minRotation = ref(0)
const pointerEvent = ref<TouchEvent | PointerEvent>()
const pointerX = ref(0)
const pointerY = ref(0)
const rotation = ref(0)
const scrollProxy = ref<any>()
const startX = ref(0)
const startY = ref(0)
const target = ref<HTMLElement | SVGElement>()
const tween = ref<gsap.core.Tween>()
const vars = ref<Draggable.Vars>()
const x = ref(0)
const y = ref(0)

// Function to update reactive properties from draggable instance
function updateReactiveProperties() {
  if (!draggableInstance.value) {
    return
  }

  const instance = draggableInstance.value
  autoScroll.value = instance.autoScroll
  deltaX.value = instance.deltaX
  deltaY.value = instance.deltaY
  endRotation.value = instance.endRotation
  endX.value = instance.endX
  endY.value = instance.endY
  isDragging.value = instance.isDragging
  isPressed.value = instance.isPressed
  isThrowing.value = instance.isThrowing
  lockAxis.value = instance.lockAxis
  maxRotation.value = instance.maxRotation
  maxX.value = instance.maxX
  maxY.value = instance.maxY
  minX.value = instance.minX
  minY.value = instance.minY
  minRotation.value = instance.minRotation
  pointerEvent.value = instance.pointerEvent
  pointerX.value = instance.pointerX
  pointerY.value = instance.pointerY
  rotation.value = instance.rotation
  scrollProxy.value = instance.scrollProxy
  startX.value = instance.startX
  startY.value = instance.startY
  target.value = instance.target
  tween.value = instance.tween
  vars.value = instance.vars
  x.value = instance.x
  y.value = instance.y
}

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

// function tweenTo(position: { x?: number, y?: number }) {
//   if (isDefined(draggableInstance)) {
//     gsap.to(draggableInstance.value.target, {
//       scrollTo: {
//         x: position.x ?? x.value,
//         y: position.y ?? y.value,
//       },
//       onComplete: () => {
//         update(true)
//       },
//     })
//   }
// }

function startDrag(event: Event, align?: boolean) {
  draggableInstance.value?.startDrag(event, align)
}

function timeSinceDrag() {
  return draggableInstance.value?.timeSinceDrag() ?? 0
}

function update(applyBounds?: boolean, sticky?: boolean) {
  const result = draggableInstance.value?.update(applyBounds, sticky)
  updateReactiveProperties()
  return result
}

// Create the draggable configuration from props
function createDraggableConfig(): Draggable.Vars {
  const config: Draggable.Vars = { ...props }

  // Remove Vue-specific props
  delete config.disabled

  // Set up event callbacks to emit Vue events and update reactive properties
  config.onClick = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('click', event, draggableInstance.value)
    }
    props.onClick?.(event)
  }

  config.onDrag = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('drag', event, draggableInstance.value)
    }
    props.onDrag?.(event)
  }

  config.onDragEnd = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('dragend', event, draggableInstance.value)
    }
    props.onDragEnd?.(event)
  }

  config.onDragStart = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('dragstart', event, draggableInstance.value)
    }
    props.onDragStart?.(event)
  }

  config.onMove = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('move', event, draggableInstance.value)
    }
    props.onMove?.(event)
  }

  config.onPress = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('press', event, draggableInstance.value)
    }
    props.onPress?.(event)
  }

  config.onRelease = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('release', event, draggableInstance.value)
    }
    props.onRelease?.(event)
  }

  config.onThrowComplete = (event: Event) => {
    updateReactiveProperties()
    if (draggableInstance.value) {
      emit('throwcomplete', event, draggableInstance.value)
    }
    props.onThrowComplete?.(event)
  }

  config.onThrowUpdate = (event: Event) => {
    updateReactiveProperties()
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

  // Update reactive properties immediately
  updateReactiveProperties()
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
  containerRef,
  deltaX,
  deltaY,
  draggableBounds,
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
  //   tweenTo,
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
