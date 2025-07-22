import { reactifyObject } from '@vueuse/core'
import { onBeforeUnmount, ref } from 'vue'
import { Draggable, gsap, InertiaPlugin } from '@/composables/registerGsap'


// Define types
/** Target element(s) for draggable functionality - can be selector string, single element, or array of elements */
type DraggableTarget = string | HTMLElement | HTMLElement[]

export interface DraggableOptions {
  /**
   * Type of draggable movement allowed
   * @default 'x,y'
   */
  type?: 'x' | 'y' | 'x,y' | 'rotation' | 'scroll' | 'scrollTop' | 'scrollLeft'

  /**
   * Resistance when dragging near edges (0-1, where 1 is maximum resistance)
   * @default 0.65
   */
  edgeResistance?: number

  /**
   * Element or selector that constrains dragging area
   * @example '#bounds-container' or document.querySelector('.bounds')
   */
  bounds?: string | HTMLElement | null

  /**
   * Element or selector that acts as drag handle
   * @example '.drag-handle' or document.querySelector('.trigger')
   */
  trigger?: string | HTMLElement | null

  /**
   * Enable throwing/momentum physics
   * @default false
   */
  throwProps?: boolean

  /**
   * Snap configuration for constraining movement to specific positions
   * @example { x: [0, 50, 100], y: [0, 25, 50] }
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
   * Enable inertia physics for natural movement
   * @default false
   */
  inertia?: boolean

  /**
   * Lock dragging to single axis after movement begins
   * @default false
   */
  lockAxis?: boolean

  /**
   * Allow right-click context menu during dragging
   * @default false
   */
  allowContextMenu?: boolean

  /**
   * Allow default browser event behavior
   * @default false
   */
  allowEventDefault?: boolean

  /**
   * Allow native touch scrolling on mobile
   * @default true
   */
  allowNativeTouchScrolling?: boolean

  /**
   * Auto-scroll speed when dragging near viewport edges
   * @default 0
   */
  autoScroll?: number

  /**
   * Function to test if element should be clickable vs draggable
   * @param element - Element to test
   * @returns true if element should remain clickable
   */
  clickableTest?: (element: HTMLElement | SVGElement) => boolean

  /**
   * CSS cursor style during dragging
   * @default 'move'
   */
  cursor?: string

  /**
   * Allow dragging of clickable elements
   * @default false
   */
  dragClickables?: boolean

  /**
   * Resistance when starting to drag (0-1)
   * @default 0
   */
  dragResistance?: number

  /**
   * Force 3D GPU acceleration
   * @default true
   */
  force3D?: boolean

  /**
   * Enable live snapping during drag vs only on release
   * @default false
   */
  liveSnap?: boolean

  /**
   * Minimum distance in pixels before drag begins
   * @default 2
   */
  minimumMovement?: number

  /**
   * Tolerance for overshooting snap points
   * @default 0
   */
  overshootTolerance?: number

  /**
   * Temporarily boost z-index during dragging
   * @default true
   */
  zIndexBoost?: boolean

  // Event callbacks
  /** Fired continuously while dragging */
  onDrag?: (event?: Event) => void
  /** Fired when dragging starts */
  onDragStart?: (event?: Event) => void
  /** Fired when dragging ends */
  onDragEnd?: (event?: Event) => void
  /** Fired when mouse/touch press occurs */
  onPress?: (event?: Event) => void
  /** Fired when mouse/touch release occurs */
  onRelease?: (event?: Event) => void
  /** Fired during throw/momentum animation */
  onThrowUpdate?: (event?: Event) => void
  /** Fired when throw/momentum animation completes */
  onThrowComplete?: (event?: Event) => void
}

/**
 * Vue composable for GSAP Draggable functionality
 * Provides reactive draggable utilities with automatic cleanup
 */
export function useDraggable() {
  // Store active draggable instances for cleanup
  const draggableInstances = ref<Draggable[]>([])

  /**
   * Create a draggable instance
   * @param targets - Element(s) to make draggable
   * @param options - Draggable configuration options
   * @returns Draggable instance
   */
  const create = (
    targets: DraggableTarget,
    options: DraggableOptions = {},
  ): Draggable[] => {
    const draggables = Draggable.create(targets as any, options as any)

    // Store instances for cleanup
    draggableInstances.value.push(...draggables)

    return draggables
  }

  /**
   * Create a draggable element with X and Y movement
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createXY = (
    targets: DraggableTarget,
    options: Omit<DraggableOptions, 'type'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'x,y',
      edgeResistance: 0.65,
      ...options,
    })
  }

  /**
   * Create a draggable element with only X movement
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createX = (
    targets: DraggableTarget,
    options: Omit<DraggableOptions, 'type'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'x',
      edgeResistance: 0.65,
      ...options,
    })
  }

  /**
   * Create a draggable element with only Y movement
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createY = (
    targets: DraggableTarget,
    options: Omit<DraggableOptions, 'type'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'y',
      edgeResistance: 0.65,
      ...options,
    })
  }

  /**
   * Create a rotatable draggable element
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createRotation = (
    targets: DraggableTarget,
    options: Omit<DraggableOptions, 'type'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'rotation',
      ...options,
    })
  }

  /**
   * Create a scrollable draggable element
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createScroll = (
    targets: DraggableTarget,
    options: Omit<DraggableOptions, 'type'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'scroll',
      ...options,
    })
  }

  /**
   * Create a draggable with snap functionality
   * @param targets - Element(s) to make draggable
   * @param snapConfig - Snap configuration
   * @param options - Additional configuration options
   * @returns Draggable instance
   */
  const createWithSnap = (
    targets: DraggableTarget,
    snapConfig: NonNullable<DraggableOptions['snap']>,
    options: Omit<DraggableOptions, 'snap'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'x,y',
      snap: snapConfig,
      ...options,
    })
  }

  /**
   * Create a draggable with bounds
   * @param targets - Element(s) to make draggable
   * @param bounds - Bounds element or selector
   * @param options - Additional configuration options
   * @returns Draggable instance
   */
  const createWithBounds = (
    targets: DraggableTarget,
    bounds: string | HTMLElement,
    options: Omit<DraggableOptions, 'bounds'> = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'x,y',
      bounds,
      edgeResistance: 0.65,
      ...options,
    })
  }

  /**
   * Create a throwable draggable with inertia
   * @param targets - Element(s) to make draggable
   * @param options - Configuration options
   * @returns Draggable instance
   */
  const createThrowable = (
    targets: DraggableTarget,
    options: DraggableOptions = {},
  ): Draggable[] => {
    return create(targets, {
      type: 'x,y',
      inertia: true,
      throwProps: true, // Enable throwProps for compatibility
      edgeResistance: 0.65,
      ...options,
    })
  }

  /**
   * Kill a specific draggable instance
   * @param draggable - Draggable instance to kill
   */
  const kill = (draggable: Draggable) => {
    draggable.kill()
    const index = draggableInstances.value.indexOf(draggable)
    if (index > -1) {
      draggableInstances.value.splice(index, 1)
    }
  }

  /**
   * Kill all draggable instances
   */
  const killAll = () => {
    draggableInstances.value.forEach(draggable => draggable.kill())
    draggableInstances.value.length = 0
  }

  /**
   * Enable all draggable instances
   */
  const enableAll = () => {
    draggableInstances.value.forEach(draggable => draggable.enable())
  }

  /**
   * Disable all draggable instances
   */
  const disableAll = () => {
    draggableInstances.value.forEach(draggable => draggable.disable())
  }

  /**
   * Update all draggable instances (useful after DOM changes)
   */
  const updateAll = () => {
    draggableInstances.value.forEach(draggable => draggable.update())
  }

  /**
   * Get all active draggable instances
   */
  const getAll = () => draggableInstances

  /**
   * Check if any draggables are currently being dragged
   */
  const isAnyDragging = () => {
    return draggableInstances.value.some(draggable => draggable.isDragging)
  }

  /**
   * Check if any draggables are currently pressed
   */
  const isAnyPressed = () => {
    return draggableInstances.value.some(draggable => draggable.isPressed)
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    killAll()
  })

  // Create reactive versions of the functions
  const reactive = reactifyObject({
    create,
    createXY,
    createX,
    createY,
    createRotation,
    createScroll,
    createWithSnap,
    createWithBounds,
    createThrowable,
    kill,
    killAll,
    enableAll,
    disableAll,
    updateAll,
  })

  return {
    // Direct functions (non-reactive)
    create,
    createXY,
    createX,
    createY,
    createRotation,
    createScroll,
    createWithSnap,
    createWithBounds,
    createThrowable,
    kill,
    killAll,
    enableAll,
    disableAll,
    updateAll,

    // Reactive versions
    reactive: {
      ...reactive,
    },

    // Non-reactive utilities
    getAll,
    isAnyDragging,
    isAnyPressed,

    // Direct access to Draggable for advanced usage
    Draggable,
  }
}

export default useDraggable
