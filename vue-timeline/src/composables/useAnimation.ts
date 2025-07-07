import type { Ref } from 'vue'
import { useRafFn, useTransition } from '@vueuse/core'
import { ref } from 'vue'

export interface AnimationOptions {
  duration: number
  easing?: string | ((t: number) => number)
  onComplete?: () => void
  onUpdate?: (value: any) => void
}

export interface AnimationTarget {
  [key: string]: string | number
}

// Easing functions
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t),
}

export function useAnimation() {
  const isRunning = ref(false)
  const currentAnimation = ref<any>(null)

  // Simple property animation using @vueuse transitions
  function animateProperty(
    element: Ref<HTMLElement | null>,
    property: string,
    from: number,
    to: number,
    options: AnimationOptions,
  ) {
    if (!element.value) {
      return { stop: () => {} }
    }

    const endValue = ref(to)
    
    const transition = useTransition(endValue, {
      duration: options.duration,
      transition: options.easing as any || easings.easeInOutQuint,
    })

    // Update the element property
    const { pause, resume } = useRafFn(() => {
      if (element.value && transition.value !== undefined) {
        if (property === 'left' || property === 'top' || property === 'width' || property === 'height') {
          element.value.style[property as any] = `${transition.value}px`
        }
        else {
          element.value.style[property as any] = transition.value.toString()
        }
        
        options.onUpdate?.(transition.value)
        
        // Check if animation is complete
        if (Math.abs(transition.value - to) < 0.1) {
          pause()
          isRunning.value = false
          options.onComplete?.()
        }
      }
    })

    isRunning.value = true
    
    // Start the transition
    endValue.value = to

    return {
      stop: () => {
        pause()
        isRunning.value = false
      },
      pause,
      resume,
    }
  }

  // Animate multiple properties
  function animate(
    element: Ref<HTMLElement | null>,
    targets: AnimationTarget,
    options: AnimationOptions,
  ) {
    if (!element.value) {
      return { stop: () => {} }
    }

    const animations: any[] = []
    let completedCount = 0
    const totalAnimations = Object.keys(targets).length

    const handleComplete = () => {
      completedCount++
      if (completedCount >= totalAnimations) {
        isRunning.value = false
        options.onComplete?.()
      }
    }

    // Start animations for each property
    Object.entries(targets).forEach(([property, targetValue]) => {
      const currentValue = getCurrentValue(element.value!, property)
      const numericTarget = Number.parseFloat(targetValue.toString())
      
      const animation = animateProperty(
        element,
        property,
        currentValue,
        numericTarget,
        {
          ...options,
          onComplete: handleComplete,
        },
      )
      
      animations.push(animation)
    })

    currentAnimation.value = {
      stop: () => {
        animations.forEach(anim => anim.stop())
        isRunning.value = false
      },
    }

    return currentAnimation.value
  }

  // Get current value of a CSS property
  function getCurrentValue(element: HTMLElement, property: string): number {
    const computedStyle = window.getComputedStyle(element)
    const value = computedStyle.getPropertyValue(property)
    
    if (property === 'left' || property === 'top') {
      // For position properties, get from element.style or computed position
      const styleValue = element.style[property as any]
      if (styleValue) {
        return Number.parseFloat(styleValue)
      }
      return element.getBoundingClientRect()[property as 'left' | 'top']
    }
    
    return Number.parseFloat(value) || 0
  }

  // Stop current animation
  function stop() {
    if (currentAnimation.value) {
      currentAnimation.value.stop()
      currentAnimation.value = null
    }
    isRunning.value = false
  }

  return {
    isRunning,
    animate,
    animateProperty,
    stop,
    easings,
  }
}

// Factory function that mimics the original Animate utility
export function Animate(
  element: HTMLElement | Ref<HTMLElement | null>,
  targets: AnimationTarget,
  options: AnimationOptions = { duration: 1000 },
) {
  const elementRef = ref(element)
  const { animate } = useAnimation()
  
  return animate(elementRef, targets, options)
}
