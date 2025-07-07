import type { Ref } from 'vue'
import { usePointerSwipe } from '@vueuse/core'
import { ref } from 'vue'

export interface SwipeConstraint {
  top: boolean | number
  bottom: boolean | number
  left: boolean | number
  right: boolean | number
}

export interface SwipeOptions {
  enable: {
    x: boolean
    y: boolean
  }
  constraint: SwipeConstraint
  snap: boolean
}

export interface SwipeEvents {
  dragstart: (event: PointerEvent) => void
  dragmove: (event: PointerEvent) => void
  dragend: (event: PointerEvent) => void
}

export function useSwipable(
  element: Ref<HTMLElement | null>,
  targetElement: Ref<HTMLElement | null>,
  options: SwipeOptions,
) {
  const isEnabled = ref(true)
  const isDragging = ref(false)
  const startPosition = ref({ x: 0, y: 0 })
  const currentPosition = ref({ x: 0, y: 0 })
  const constraint = ref<SwipeConstraint>(options.constraint)
  
  // Event handlers
  const events = ref<Partial<SwipeEvents>>({})
  
  const { distanceX, distanceY, isSwiping } = usePointerSwipe(element, {
    onSwipeStart(e: PointerEvent) {
      if (!isEnabled.value) {
        return
      }
      
      isDragging.value = true
      startPosition.value = { x: e.clientX, y: e.clientY }
      
      if (targetElement.value) {
        const rect = targetElement.value.getBoundingClientRect()
        currentPosition.value = { x: rect.left, y: rect.top }
      }
      
      events.value.dragstart?.(e)
    },
    
    onSwipe(e: PointerEvent) {
      if (!isEnabled.value || !isDragging.value || !targetElement.value) {
        return
      }
      
      let newX = currentPosition.value.x
      let newY = currentPosition.value.y
      
      // Calculate new position based on enabled axes
      if (options.enable.x) {
        newX = currentPosition.value.x + distanceX.value
      }
      if (options.enable.y) {
        newY = currentPosition.value.y + distanceY.value
      }
      
      // Apply constraints
      const constrainedPosition = applyConstraints(newX, newY)
      
      // Apply position to target element
      targetElement.value.style.transform = `translate(${constrainedPosition.x}px, ${constrainedPosition.y}px)`
      
      events.value.dragmove?.(e)
    },
    
    onSwipeEnd(e: PointerEvent) {
      if (!isEnabled.value) {
        return
      }
      
      isDragging.value = false
      
      // Handle snap if enabled
      if (options.snap && targetElement.value) {
        handleSnap()
      }
      
      events.value.dragend?.(e)
    },
  })

  // Apply position constraints
  function applyConstraints(x: number, y: number): { x: number, y: number } {
    let constrainedX = x
    let constrainedY = y
    
    // Apply left constraint
    if (typeof constraint.value.left === 'number' && constrainedX < constraint.value.left) {
      constrainedX = constraint.value.left
    }
    
    // Apply right constraint
    if (typeof constraint.value.right === 'number' && constrainedX > constraint.value.right) {
      constrainedX = constraint.value.right
    }
    
    // Apply top constraint
    if (typeof constraint.value.top === 'number' && constrainedY < constraint.value.top) {
      constrainedY = constraint.value.top
    }
    
    // Apply bottom constraint
    if (typeof constraint.value.bottom === 'number' && constrainedY > constraint.value.bottom) {
      constrainedY = constraint.value.bottom
    }
    
    return { x: constrainedX, y: constrainedY }
  }

  // Handle snap behavior
  function handleSnap(): void {
    if (!targetElement.value) {
      return
    }
    
    // Simple snap to nearest grid point (you can customize this)
    const currentTransform = targetElement.value.style.transform
    const matches = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/)
    
    if (matches) {
      const x = parseFloat(matches[1])
      const y = parseFloat(matches[2])
      
      // Snap to nearest 50px grid
      const snappedX = Math.round(x / 50) * 50
      const snappedY = Math.round(y / 50) * 50
      
      const constrainedPosition = applyConstraints(snappedX, snappedY)
      targetElement.value.style.transform = `translate(${constrainedPosition.x}px, ${constrainedPosition.y}px)`
    }
  }

  // Enable/disable swipe
  function enable(): void {
    isEnabled.value = true
  }

  function disable(): void {
    isEnabled.value = false
    isDragging.value = false
  }

  // Update constraints
  function updateConstraint(newConstraint: Partial<SwipeConstraint>): void {
    constraint.value = { ...constraint.value, ...newConstraint }
  }

  // Event listener management
  function on<K extends keyof SwipeEvents>(event: K, handler: SwipeEvents[K]): void {
    events.value[event] = handler
  }

  function off<K extends keyof SwipeEvents>(event: K): void {
    delete events.value[event]
  }

  // Get current position
  function getPosition(): { x: number, y: number } {
    if (!targetElement.value) {
      return { x: 0, y: 0 }
    }
    
    const rect = targetElement.value.getBoundingClientRect()
    return { x: rect.left, y: rect.top }
  }

  // Set position programmatically
  function setPosition(x: number, y: number): void {
    if (!targetElement.value) {
      return
    }
    
    const constrainedPosition = applyConstraints(x, y)
    targetElement.value.style.transform = `translate(${constrainedPosition.x}px, ${constrainedPosition.y}px)`
    currentPosition.value = constrainedPosition
  }

  return {
    // Reactive state
    isEnabled,
    isDragging,
    isSwiping,
    distanceX,
    distanceY,
    currentPosition,
    
    // Methods
    enable,
    disable,
    updateConstraint,
    on,
    off,
    getPosition,
    setPosition,
  }
}
