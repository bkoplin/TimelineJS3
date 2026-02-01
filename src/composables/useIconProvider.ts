/**
 * Icon Provider Composable
 * 
 * Provides a flexible system for customizing all icons throughout the timeline.
 * Supports Font Awesome, custom components, SVG strings, image URLs, and HTML.
 */

import { ref, computed, h, type Component, type VNode } from 'vue'

export type IconType = 
  | string              // Font Awesome class or HTML string
  | Component           // Vue component
  | VNode               // Rendered VNode
  | { svg: string }     // SVG string
  | { url: string }     // Image URL

export interface IconDefinitions {
  // Menu bar icons
  zoomIn?: IconType
  zoomOut?: IconType
  goToStart?: IconType
  goToEnd?: IconType
  
  // Navigation icons
  nextSlide?: IconType
  prevSlide?: IconType
  
  // Marker icons
  markerDefault?: IconType
  markerActive?: IconType
  markerHover?: IconType
  
  // Media type icons
  mediaImage?: IconType
  mediaVideo?: IconType
  mediaAudio?: IconType
  mediaWebsite?: IconType
  mediaDocument?: IconType
  mediaMap?: IconType
  mediaEmbed?: IconType
  
  // State icons
  loading?: IconType
  error?: IconType
  warning?: IconType
  info?: IconType
  success?: IconType
  
  // UI icons
  close?: IconType
  expand?: IconType
  collapse?: IconType
  share?: IconType
  download?: IconType
  fullscreen?: IconType
  exitFullscreen?: IconType
}

// Default Font Awesome icons
const defaultIcons: Required<IconDefinitions> = {
  // Menu bar
  zoomIn: 'fa-solid fa-magnifying-glass-plus',
  zoomOut: 'fa-solid fa-magnifying-glass-minus',
  goToStart: 'fa-solid fa-backward-fast',
  goToEnd: 'fa-solid fa-forward-fast',
  
  // Navigation
  nextSlide: 'fa-solid fa-chevron-right',
  prevSlide: 'fa-solid fa-chevron-left',
  
  // Markers
  markerDefault: 'fa-solid fa-circle',
  markerActive: 'fa-solid fa-circle-dot',
  markerHover: 'fa-solid fa-circle',
  
  // Media types
  mediaImage: 'fa-solid fa-image',
  mediaVideo: 'fa-solid fa-video',
  mediaAudio: 'fa-solid fa-volume-high',
  mediaWebsite: 'fa-solid fa-globe',
  mediaDocument: 'fa-solid fa-file',
  mediaMap: 'fa-solid fa-map-location-dot',
  mediaEmbed: 'fa-solid fa-code',
  
  // State
  loading: 'fa-solid fa-spinner fa-spin',
  error: 'fa-solid fa-triangle-exclamation',
  warning: 'fa-solid fa-circle-exclamation',
  info: 'fa-solid fa-circle-info',
  success: 'fa-solid fa-circle-check',
  
  // UI
  close: 'fa-solid fa-xmark',
  expand: 'fa-solid fa-expand',
  collapse: 'fa-solid fa-compress',
  share: 'fa-solid fa-share-nodes',
  download: 'fa-solid fa-download',
  fullscreen: 'fa-solid fa-expand',
  exitFullscreen: 'fa-solid fa-compress'
}

export function useIconProvider(customIcons: Partial<IconDefinitions> = {}) {
  const icons = ref<Required<IconDefinitions>>({
    ...defaultIcons,
    ...customIcons
  })
  
  /**
   * Update icon definitions at runtime
   */
  function updateIcons(newIcons: Partial<IconDefinitions>) {
    icons.value = {
      ...icons.value,
      ...newIcons
    }
  }
  
  /**
   * Get an icon by name
   */
  function getIcon(name: keyof IconDefinitions): IconType {
    return icons.value[name]
  }
  
  /**
   * Render an icon to a VNode
   */
  function renderIcon(iconType: IconType, attrs: Record<string, any> = {}): VNode {
    // Handle Vue component
    if (typeof iconType === 'object' && 'render' in iconType) {
      return h(iconType as Component, attrs)
    }
    
    // Handle VNode
    if (typeof iconType === 'object' && 'type' in iconType) {
      return iconType as VNode
    }
    
    // Handle SVG string
    if (typeof iconType === 'object' && 'svg' in iconType) {
      return h('span', {
        ...attrs,
        innerHTML: iconType.svg,
        class: ['timeline-icon-svg', attrs.class].filter(Boolean).join(' ')
      })
    }
    
    // Handle image URL
    if (typeof iconType === 'object' && 'url' in iconType) {
      return h('img', {
        ...attrs,
        src: iconType.url,
        class: ['timeline-icon-img', attrs.class].filter(Boolean).join(' ')
      })
    }
    
    // Handle string (Font Awesome class or HTML)
    if (typeof iconType === 'string') {
      // Check if it looks like HTML
      if (iconType.trim().startsWith('<')) {
        return h('span', {
          ...attrs,
          innerHTML: iconType,
          class: ['timeline-icon-html', attrs.class].filter(Boolean).join(' ')
        })
      }
      
      // Otherwise treat as Font Awesome class
      return h('i', {
        ...attrs,
        class: [iconType, attrs.class].filter(Boolean).join(' ')
      })
    }
    
    // Fallback
    return h('span', attrs)
  }
  
  /**
   * Create a helper function to render a specific icon by name
   */
  function createIconRenderer(name: keyof IconDefinitions) {
    return (attrs: Record<string, any> = {}) => {
      return renderIcon(getIcon(name), attrs)
    }
  }
  
  /**
   * Computed icon renderers for common icons
   */
  const iconRenderers = computed(() => ({
    zoomIn: createIconRenderer('zoomIn'),
    zoomOut: createIconRenderer('zoomOut'),
    goToStart: createIconRenderer('goToStart'),
    goToEnd: createIconRenderer('goToEnd'),
    nextSlide: createIconRenderer('nextSlide'),
    prevSlide: createIconRenderer('prevSlide'),
    markerDefault: createIconRenderer('markerDefault'),
    markerActive: createIconRenderer('markerActive'),
    markerHover: createIconRenderer('markerHover'),
    loading: createIconRenderer('loading'),
    error: createIconRenderer('error'),
    warning: createIconRenderer('warning'),
    info: createIconRenderer('info'),
    success: createIconRenderer('success')
  }))
  
  /**
   * Check if an icon is defined
   */
  function hasIcon(name: keyof IconDefinitions): boolean {
    return !!icons.value[name]
  }
  
  /**
   * Get all icon definitions
   */
  function getAllIcons(): Required<IconDefinitions> {
    return { ...icons.value }
  }
  
  return {
    icons: computed(() => icons.value),
    updateIcons,
    getIcon,
    renderIcon,
    createIconRenderer,
    iconRenderers,
    hasIcon,
    getAllIcons
  }
}
