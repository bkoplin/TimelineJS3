/**
 * Touch Navigation Composable for VueTimelineJS3
 * 
 * Provides touch/swipe gesture detection with enable/disable control
 */

import { ref, onMounted, onUnmounted } from 'vue'

export interface TouchNavigationOptions {
  enabled?: boolean
  element?: HTMLElement | null
  minSwipeDistance?: number
  velocityThreshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  preventDefaultOnSwipe?: boolean
}

interface TouchData {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  isSwiping: boolean
}

export function useTouchNavigation(options: TouchNavigationOptions) {
  const isEnabled = ref(options.enabled !== false)
  const minSwipeDistance = options.minSwipeDistance || 50 // pixels
  const velocityThreshold = options.velocityThreshold || 0.3 // pixels per millisecond
  
  let targetElement: HTMLElement | null = null
  const touchData = ref<TouchData>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false
  })

  function getTouchPoint(event: TouchEvent): { x: number; y: number } {
    const touch = event.touches[0] || event.changedTouches[0]
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }

  function handleTouchStart(event: TouchEvent) {
    if (!isEnabled.value) return
    
    const point = getTouchPoint(event)
    touchData.value = {
      startX: point.x,
      startY: point.y,
      startTime: Date.now(),
      currentX: point.x,
      currentY: point.y,
      isSwiping: false
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isEnabled.value || !touchData.value.startTime) return
    
    const point = getTouchPoint(event)
    touchData.value.currentX = point.x
    touchData.value.currentY = point.y
    
    const deltaX = Math.abs(point.x - touchData.value.startX)
    const deltaY = Math.abs(point.y - touchData.value.startY)
    
    // Detect if user is swiping (moved enough to be intentional)
    if (deltaX > 10 || deltaY > 10) {
      touchData.value.isSwiping = true
      
      // Prevent default scrolling if horizontal swipe is dominant
      if (options.preventDefaultOnSwipe !== false && deltaX > deltaY) {
        event.preventDefault()
      }
    }
  }

  function handleTouchEnd(_event: TouchEvent) {
    if (!isEnabled.value || !touchData.value.startTime) return
    
    const endTime = Date.now()
    const duration = endTime - touchData.value.startTime
    const deltaX = touchData.value.currentX - touchData.value.startX
    const deltaY = touchData.value.currentY - touchData.value.startY
    const distanceX = Math.abs(deltaX)
    const distanceY = Math.abs(deltaY)
    const velocityX = distanceX / duration
    const velocityY = distanceY / duration
    
    // Determine swipe direction
    // Horizontal swipe (left/right)
    if (distanceX > minSwipeDistance && distanceX > distanceY && velocityX > velocityThreshold) {
      if (deltaX > 0) {
        // Swipe right
        options.onSwipeRight?.()
      } else {
        // Swipe left
        options.onSwipeLeft?.()
      }
    }
    // Vertical swipe (up/down)
    else if (distanceY > minSwipeDistance && distanceY > distanceX && velocityY > velocityThreshold) {
      if (deltaY > 0) {
        // Swipe down
        options.onSwipeDown?.()
      } else {
        // Swipe up
        options.onSwipeUp?.()
      }
    }
    
    // Reset touch data
    touchData.value = {
      startX: 0,
      startY: 0,
      startTime: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false
    }
  }

  function handleTouchCancel(_event: TouchEvent) {
    // Reset on cancel
    touchData.value = {
      startX: 0,
      startY: 0,
      startTime: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false
    }
  }

  function enable() {
    isEnabled.value = true
  }

  function disable() {
    isEnabled.value = false
  }

  function attach() {
    targetElement = options.element || null
    if (!targetElement) return
    
    targetElement.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false })
    targetElement.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false })
    targetElement.addEventListener('touchend', handleTouchEnd as EventListener)
    targetElement.addEventListener('touchcancel', handleTouchCancel as EventListener)
  }

  function detach() {
    if (targetElement) {
      targetElement.removeEventListener('touchstart', handleTouchStart as EventListener)
      targetElement.removeEventListener('touchmove', handleTouchMove as EventListener)
      targetElement.removeEventListener('touchend', handleTouchEnd as EventListener)
      targetElement.removeEventListener('touchcancel', handleTouchCancel as EventListener)
      targetElement = null
    }
  }

  onMounted(() => {
    if (isEnabled.value && options.element) {
      attach()
    }
  })

  onUnmounted(() => {
    detach()
  })

  return {
    isEnabled,
    enable,
    disable,
    attach,
    detach,
    touchData
  }
}
