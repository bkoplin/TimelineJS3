/**
 * Core TypeScript type definitions for VueTimelineJS3
 */

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
  start_date: TimelineDate
  end_date?: TimelineDate
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
  
  // Icon customization
  icon_pack?: 'fontawesome' | 'custom'
  custom_icons?: Record<string, string>
  
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
  }
  date?: {
    year?: string
    month?: string
    day?: string
    hour?: string
    minute?: string
    second?: string
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
}
