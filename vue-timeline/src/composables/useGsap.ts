import { reactifyObject } from '@vueuse/core'
import { gsap } from './registerGsap'

/**
 * Vue 3 composable for GSAP animations
 * Provides a convenient wrapper around GSAP functions for Vue components
 * Uses @vueuse/core reactifyObject to make GSAP reactive-friendly
 */
export function useGsap() {
  // Create reactive versions of core GSAP functions
  // Note: reactify works best with functions that return values
  // For GSAP, we'll create wrapper functions that work with Vue's reactivity

  /**
   * Animate elements to specified properties (reactive)
   * @param targets - Element(s) to animate
   * @param vars - Animation properties and options
   * @returns GSAP Tween instance
   */
  const to = (targets: gsap.TweenTarget, vars: gsap.TweenVars) => {
    return gsap.to(targets, vars)
  }

  /**
   * Animate elements from specified properties (reactive)
   * @param targets - Element(s) to animate
   * @param vars - Animation properties and options
   * @returns GSAP Tween instance
   */
  const from = (targets: gsap.TweenTarget, vars: gsap.TweenVars) => {
    return gsap.from(targets, vars)
  }

  /**
   * Animate elements from and to specified properties (reactive)
   * @param targets - Element(s) to animate
   * @param fromVars - Initial animation properties
   * @param toVars - Final animation properties
   * @returns GSAP Tween instance
   */
  const fromTo = (
    targets: gsap.TweenTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
  ) => {
    return gsap.fromTo(targets, fromVars, toVars)
  }

  /**
   * Create a new timeline for sequencing animations (reactive)
   * @param vars - Timeline configuration options
   * @returns GSAP Timeline instance
   */
  const timeline = (vars?: gsap.TimelineVars) => {
    return gsap.timeline(vars)
  }

  /**
   * Set properties immediately without animation (reactive)
   * @param targets - Element(s) to set properties on
   * @param vars - Properties to set
   * @returns GSAP Tween instance
   */
  const set = (targets: gsap.TweenTarget, vars: gsap.TweenVars) => {
    return gsap.set(targets, vars)
  }

  /**
   * Kill all animations on the specified targets (reactive)
   * @param targets - Element(s) to kill animations on
   * @param properties - Specific properties to kill (optional)
   */
  const killTweensOf = (
    targets: gsap.TweenTarget,
    properties?: string | string[],
  ) => {
    return gsap.killTweensOf(targets, properties)
  }

  /**
   * Create a delay (reactive)
   * @param duration - Duration of the delay in seconds
   * @param callback - Function to call after delay
   * @param params - Parameters to pass to callback
   * @returns GSAP Tween instance
   */
  const delayedCall = (duration: number, callback: () => void, params?: any[]) => {
    return gsap.delayedCall(duration, callback, params)
  }

  /**
   * Get a quickTo function for optimized repeated animations (reactive)
   * @param targets - Element(s) to animate
   * @param property - Property to animate
   * @param vars - Animation options
   * @returns QuickTo function
   */
  const quickTo = (
    targets: gsap.TweenTarget,
    property: string,
    vars?: gsap.TweenVars,
  ) => {
    return gsap.quickTo(targets, property, vars)
  }

  // Create reactive versions using reactifyObject for utility functions
  const reactiveUtils = reactifyObject({
    getTweensOf: gsap.getTweensOf,
    isTweening: gsap.isTweening,
    parseEase: gsap.parseEase,
  })

  return {
    // Core GSAP functions (work with Vue reactivity through closure)
    to,
    from,
    fromTo,
    timeline,
    set,
    killTweensOf,
    delayedCall,
    quickTo,
    // Reactive utility functions
    ...reactiveUtils,
    // Original GSAP object for advanced usage
    gsap,
    // Reactive GSAP object for specific use cases
    gsapReactive: reactifyObject(gsap),
  }
}
