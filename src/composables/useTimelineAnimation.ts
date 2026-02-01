/**
 * Animation utilities and composable
 * Provides smooth animations for timeline interactions
 */

import { ref, computed, onMounted } from 'vue'

export interface AnimationConfig {
  /** Enable animations (can be disabled for accessibility) */
  enabled?: boolean
  /** Default animation duration in milliseconds */
  duration?: number
  /** Default easing function */
  easing?: string
  /** Respect prefers-reduced-motion setting */
  respectMotionPreference?: boolean
}

const defaultConfig: AnimationConfig = {
  enabled: true,
  duration: 600,
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design standard easing
  respectMotionPreference: true
}

/**
 * Animation composable for timeline components
 */
export function useTimelineAnimation(config?: AnimationConfig) {
  const mergedConfig = { ...defaultConfig, ...config }
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = ref(false)
  
  onMounted(() => {
    if (typeof window !== 'undefined' && mergedConfig.respectMotionPreference) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches
      
      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
      })
    }
  })
  
  // Should animations be enabled?
  const animationsEnabled = computed(() => {
    if (!mergedConfig.enabled) return false
    if (mergedConfig.respectMotionPreference && prefersReducedMotion.value) return false
    return true
  })
  
  // Get animation duration (0 if disabled)
  const duration = computed(() => {
    return animationsEnabled.value ? (mergedConfig.duration || 600) : 0
  })
  
  // Get animation easing
  const easing = computed(() => {
    return mergedConfig.easing || 'ease'
  })
  
  // Get CSS transition string
  const transitionStyle = computed(() => {
    if (!animationsEnabled.value) return 'none'
    return `${duration.value}ms ${easing.value}`
  })
  
  /**
   * Create a CSS transition for a specific property
   */
  function createTransition(property: string, customDuration?: number, customEasing?: string): string {
    if (!animationsEnabled.value) return 'none'
    const dur = customDuration || duration.value
    const ease = customEasing || easing.value
    return `${property} ${dur}ms ${ease}`
  }
  
  /**
   * Animate a value over time using requestAnimationFrame
   */
  function animateValue(
    from: number,
    to: number,
    onUpdate: (value: number) => void,
    customDuration?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!animationsEnabled.value) {
        onUpdate(to)
        resolve()
        return
      }
      
      const dur = customDuration || duration.value
      const startTime = performance.now()
      
      function step(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / dur, 1)
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress
        
        const currentValue = from + (to - from) * eased
        onUpdate(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          resolve()
        }
      }
      
      requestAnimationFrame(step)
    })
  }
  
  /**
   * Interpolate between two values with easing
   */
  function interpolate(from: number, to: number, progress: number): number {
    // Ease-in-out cubic
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    
    return from + (to - from) * eased
  }
  
  return {
    animationsEnabled,
    duration,
    easing,
    transitionStyle,
    createTransition,
    animateValue,
    interpolate
  }
}

/**
 * Easing functions for animations
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
}
