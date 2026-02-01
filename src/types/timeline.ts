/**
 * Core TypeScript type definitions for VueTimelineJS3
 */

/**
 * Date precision levels for display and plotting
 */
export type DatePrecision = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year'

/**
 * Flexible date input - accepts multiple formats
 */
export type FlexibleDate = TimelineDate | Date | string | number

export interface TimelineDate {
  year: string | number
  month?: string | number
  day?: string | number
  hour?: string | number
  minute?: string | number
  second?: string | number
  millisecond?: string | number
  format?: string
  display_text?: string
}

export interface TimelineMedia {
  url?: string
  caption?: string
  credit?: string
  thumbnail?: string
  alt?: string
  title?: string
  link?: string
  link_target?: string
}

export interface TimelineText {
  headline?: string
  text?: string
}

export interface TimelineLocation {
  name?: string
  lat?: number
  lon?: number
  zoom?: number
  line?: boolean
  icon?: string
}

export interface TimelineEvent {
  start_date: TimelineDate | FlexibleDate  // Now accepts multiple formats
  end_date?: TimelineDate | FlexibleDate   // Now accepts multiple formats
  text?: TimelineText
  media?: TimelineMedia
  location?: TimelineLocation
  background?: {
    url?: string
    color?: string
  }
  unique_id?: string
  group?: string
  display_date?: string
  autolink?: boolean
  type?: string
  precision?: DatePrecision  // NEW: Optional precision override
}

export interface TimelineTitle {
  text?: TimelineText
  media?: TimelineMedia
  background?: {
    url?: string
    color?: string
  }
  unique_id?: string
  autolink?: boolean
}

export interface TimelineEra {
  start_date: TimelineDate
  end_date: TimelineDate
  text?: TimelineText
  unique_id?: string
}

export interface TimelineScale {
  human?: boolean
  cosmological?: boolean
}

export interface TimelineData {
  title?: TimelineTitle
  events: TimelineEvent[]
  eras?: TimelineEra[]
  scale?: string
}

export interface TimelineOptions {
  // Display
  width?: number | string
  height?: number | string
  hash_bookmark?: boolean
  default_bg_color?: string
  scale_factor?: number
  initial_zoom?: number
  zoom_sequence?: number[]
  
  // Navigation
  timenav_position?: 'bottom' | 'top'
  optimal_tick_width?: number
  base_class?: string
  timenav_height?: number
  timenav_height_percentage?: number
  timenav_mobile_height_percentage?: number
  timenav_height_min?: number
  marker_height_min?: number
  marker_width_min?: number
  marker_padding?: number
  start_at_slide?: number
  start_at_end?: boolean
  menubar_height?: number
  
  // Interaction
  use_bc?: boolean
  duration?: number
  ease?: string
  dragging?: boolean
  trackResize?: boolean
  map_type?: string
  slide_padding_lr?: number
  slide_default_fade?: string
  language?: string
  ga_property_id?: string
  track_events?: string[]
  script_path?: string
  
  // Icon customization - Full icon system support
  /** Icon definitions for all timeline icons. Supports Font Awesome classes, Vue components, SVG strings, image URLs, or HTML */
  icons?: {
    // Menu bar icons
    zoomIn?: string | object
    zoomOut?: string | object
    goToStart?: string | object
    goToEnd?: string | object
    // Navigation icons
    nextSlide?: string | object
    prevSlide?: string | object
    // Marker icons
    markerDefault?: string | object
    markerActive?: string | object
    markerHover?: string | object
    // Media type icons
    mediaImage?: string | object
    mediaVideo?: string | object
    mediaAudio?: string | object
    mediaWebsite?: string | object
    mediaDocument?: string | object
    mediaMap?: string | object
    mediaEmbed?: string | object
    // State icons
    loading?: string | object
    error?: string | object
    warning?: string | object
    info?: string | object
    success?: string | object
    // UI icons
    close?: string | object
    expand?: string | object
    collapse?: string | object
    share?: string | object
    download?: string | object
    fullscreen?: string | object
    exitFullscreen?: string | object
    [key: string]: any  // Allow custom icon names
  }
  
  // Animation configuration
  /** Enable/disable animations */
  animations_enabled?: boolean
  /** Animation duration in milliseconds */
  animation_duration?: number
  /** Animation easing function */
  animation_easing?: string
  /** Respect prefers-reduced-motion setting */
  respect_reduced_motion?: boolean
  
  // D3 Scale Configuration (NEW - transparent control over timeline positioning)
  /** Padding around timeline as percentage of total span (0.1 = 10% padding on each side) */
  timeline_padding?: number
  /** Minimum span in milliseconds when all events are at same time */
  min_timeline_span?: number
  /** Number of axis ticks to display */
  axis_tick_count?: number
  /** Custom D3 scale configuration */
  scale_config?: {
    /** Override display width */
    displayWidth?: number
    /** Override screen multiplier */
    screenMultiplier?: number
    /** Override padding */
    padding?: number
    /** Override minimum span */
    minSpan?: number
  }
  
  // Keyboard Navigation
  /** Enable/disable keyboard navigation (arrow keys, home/end, etc.) */
  keyboard_navigation_enabled?: boolean
  /** Custom keyboard key bindings */
  keyboard_navigation_keys?: {
    next?: string[]
    previous?: string[]
    first?: string[]
    last?: string[]
    select?: string[]
    escape?: string[]
    zoomIn?: string[]
    zoomOut?: string[]
  }
  
  // Touch Navigation
  /** Enable/disable touch/swipe navigation */
  touch_navigation_enabled?: boolean
  /** Minimum swipe distance in pixels to trigger navigation */
  swipe_min_distance?: number
  /** Swipe velocity threshold (pixels per millisecond) */
  swipe_velocity_threshold?: number
  /** Prevent default scrolling behavior during swipes */
  swipe_prevent_default?: boolean
  
  // Loading State (NEW)
  /** Show skeleton loader during initial load */
  show_skeleton?: boolean
  /** Duration to show skeleton before transitioning to content (ms) */
  show_skeleton_duration?: number
  /** Icon pack to use (default: 'fontawesome') */
  icon_pack?: string
  
  // Virtual Scrolling (NEW - for large datasets)
  /** Enable/disable virtual scrolling (auto-enables for large datasets) */
  virtual_scrolling_enabled?: boolean
  /** Number of slides to buffer before/after current slide */
  virtual_buffer_size?: number
  /** Auto-enable virtual scrolling when event count exceeds this threshold */
  virtual_threshold?: number
  /** Enable/disable virtual rendering of markers */
  virtual_markers_enabled?: boolean
  /** Auto-enable virtual markers when event count exceeds this threshold */
  virtual_marker_threshold?: number
  
  // Pan & Zoom Animations (NEW)
  /** Enable/disable pan animation during zoom (centers on current event) */
  pan_during_zoom?: boolean
  /** Enable/disable auto-center on slide navigation */
  auto_center_on_navigate?: boolean
  
  // Debug mode
  /** Show debug information (virtual scrolling stats, etc.) */
  debug?: boolean
}

export interface TimelinePropertyMapping {
  event?: {
    startDate?: string
    endDate?: string
    headline?: string
    text?: string
    media?: string
    group?: string
    uniqueId?: string
    precision?: string  // NEW: Support precision mapping
  }
  date?: {
    year?: string
    month?: string
    day?: string
    hour?: string
    minute?: string
    second?: string
    millisecond?: string  // NEW: Support millisecond mapping
  }
}

export interface TimelineEmits {
  // Navigation events
  'change': (data: { unique_id: string; slide_index: number }) => void
  'nav_next': () => void
  'nav_previous': () => void
  'back_to_start': () => void
  'forward_to_end': () => void
  
  // Zoom events
  'zoom_in': (data: { zoom_level: number }) => void
  'zoom_out': (data: { zoom_level: number }) => void
  
  // Lifecycle events
  'ready': () => void
  'dataloaded': () => void
  'loaded': (data: { scale: string; eras: TimelineEra[]; events: TimelineEvent[]; title?: TimelineTitle }) => void
  
  // Interaction events
  'hash_updated': (data: { unique_id: string; hashbookmark: string }) => void
  'color_change': (data: { unique_id: string }) => void
  'background_change': (data: { unique_id: string }) => void
  
  // Manipulation events
  'added': (data: { unique_id: string }) => void
  'removed': (data: { unique_id: string }) => void
  'slideAdded': (data: { unique_id: string }) => void
  'slideRemoved': (data: { unique_id: string }) => void
  'dateAdded': (data: { unique_id: string }) => void
  'dateRemoved': (data: { unique_id: string }) => void
  'eraAdded': (data: { unique_id: string }) => void
  
  // Media events
  'media_loaded': (data: { unique_id: string }) => void
  
  // Drag events
  'dragstart': (data: { x: number; y: number }) => void
  'dragmove': (data: { x: number; y: number }) => void
  'dragend': (data: { x: number; y: number }) => void
  
  // Marker events
  'markerclick': (data: { unique_id: string }) => void
  'markerblur': (data: { unique_id: string }) => void
  
  // Swipe events (mobile)
  'swipe_left': () => void
  'swipe_right': () => void
  'swipe_up': () => void
  'swipe_down': () => void
  
  // Keyboard navigation events
  'keyboard_navigation': (data: { key: string; action: string }) => void
}
