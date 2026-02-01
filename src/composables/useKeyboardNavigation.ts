/**
 * Keyboard Navigation Composable for VueTimelineJS3
 * 
 * Provides keyboard navigation functionality with enable/disable control
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface KeyboardNavigationOptions {
  enabled?: boolean
  element?: HTMLElement | null
  onNext?: () => void
  onPrevious?: () => void
  onFirst?: () => void
  onLast?: () => void
  onSelect?: () => void
  onEscape?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
}

export interface KeyboardNavigationKeys {
  next?: string[]
  previous?: string[]
  first?: string[]
  last?: string[]
  select?: string[]
  escape?: string[]
  zoomIn?: string[]
  zoomOut?: string[]
}

const defaultKeys: KeyboardNavigationKeys = {
  next: ['ArrowRight', 'Right'],
  previous: ['ArrowLeft', 'Left'],
  first: ['Home'],
  last: ['End'],
  select: [' ', 'Enter', 'Space'],
  escape: ['Escape', 'Esc'],
  zoomIn: ['+', '='],
  zoomOut: ['-', '_']
}

export function useKeyboardNavigation(
  options: KeyboardNavigationOptions,
  customKeys?: KeyboardNavigationKeys
) {
  const isEnabled = ref(options.enabled !== false)
  const keys = { ...defaultKeys, ...customKeys }
  let targetElement: HTMLElement | Document | null = null

  function handleKeydown(event: KeyboardEvent) {
    if (!isEnabled.value) return

    const key = event.key
    
    // Check if key matches any configured action
    if (keys.next?.includes(key)) {
      event.preventDefault()
      options.onNext?.()
    } else if (keys.previous?.includes(key)) {
      event.preventDefault()
      options.onPrevious?.()
    } else if (keys.first?.includes(key)) {
      event.preventDefault()
      options.onFirst?.()
    } else if (keys.last?.includes(key)) {
      event.preventDefault()
      options.onLast?.()
    } else if (keys.select?.includes(key)) {
      // Only if an element is focused
      if (document.activeElement !== document.body) {
        event.preventDefault()
        options.onSelect?.()
      }
    } else if (keys.escape?.includes(key)) {
      event.preventDefault()
      options.onEscape?.()
    } else if (keys.zoomIn?.includes(key) && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      options.onZoomIn?.()
    } else if (keys.zoomOut?.includes(key) && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      options.onZoomOut?.()
    }
  }

  function enable() {
    isEnabled.value = true
  }

  function disable() {
    isEnabled.value = false
  }

  function attach() {
    targetElement = options.element || document
    targetElement.addEventListener('keydown', handleKeydown as EventListener)
  }

  function detach() {
    if (targetElement) {
      targetElement.removeEventListener('keydown', handleKeydown as EventListener)
      targetElement = null
    }
  }

  onMounted(() => {
    if (isEnabled.value) {
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
    detach
  }
}
