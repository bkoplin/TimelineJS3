# VueTimelineJS3 Component Architecture

This document describes the internal component structure of VueTimelineJS3, explaining the role of each component, their interactions, properties, and emitters.

## Component Hierarchy

```
VueTimelineJS3 (Root)
├── TimelineSkeleton (Loading state)
├── TimelineMenuBar (Top menu bar)
├── TimelineSlider (Main content area)
│   └── TimelineSlide (Individual slides)
│       └── TimelineMedia (Media display)
└── TimelineNav (Bottom navigation)
    └── TimelineMessage (Error/loading messages)
```

---

## Component Details

### VueTimelineJS3

**Location:** `src/components/VueTimelineJS3.vue`

**Purpose:** Main container component that orchestrates the entire timeline application. It manages global state, coordinates child components, and provides the public API for timeline control.

**Why it exists:**
- Acts as the entry point and public interface for the timeline library
- Manages application-level state (current slide, loading, ready states)
- Coordinates data flow between child components
- Provides dependency injection for shared services (icons, options, state)

**Interactions:**
- **Parent → Component:** Receives timeline data and options from consumer application
- **Component → Children:** Provides data, options, and icon provider via Vue's `provide/inject`
- **Children → Component:** Receives events from all child components and re-emits them
- **Component → Parent:** Emits comprehensive event system for external integration

**Props:**
```typescript
interface Props {
  data: TimelineData              // Timeline events, title, and eras
  options?: Partial<TimelineOptions>  // Configuration settings
  propertyMapping?: TimelinePropertyMapping  // Custom data structure mapping
}
```

**Emitters:**
```typescript
{
  'ready': void                   // Timeline is fully loaded and ready
  'dataloaded': void             // Data has been loaded
  'loaded': { scale, eras, events, title }  // Detailed load info
  'change': { unique_id, slide_index }  // Current slide changed
  'nav_next': void               // Next navigation triggered
  'nav_previous': void           // Previous navigation triggered
  'back_to_start': void          // Jump to first slide
  'forward_to_end': void         // Jump to last slide
  'zoom_in': { zoom_level }      // Zoom in triggered
  'zoom_out': { zoom_level }     // Zoom out triggered
  'markerclick': { unique_id }   // Timeline marker clicked
  'markerblur': { unique_id }    // Marker lost focus
  'swipe_left': void             // Swipe left gesture
  'swipe_right': void            // Swipe right gesture
  'swipe_up': void               // Swipe up gesture
  'swipe_down': void             // Swipe down gesture
  'keyboard_navigation': { key, action }  // Keyboard nav event
  'media_loaded': { unique_id }  // Media finished loading
  'hash_updated': { unique_id, hashbookmark }  // URL hash changed
  'color_change': { unique_id }  // Color theme changed
  'background_change': { unique_id }  // Background changed
  'added': { unique_id }         // Event added
  'removed': { unique_id }       // Event removed
}
```

**Exposed Methods:**
```typescript
{
  goTo(index: number): void
  goToId(id: string): void
  goToNext(): void
  goToPrev(): void
  goToStart(): void
  goToEnd(): void
  getData(index: number): TimelineEvent
  getDataById(id: string): TimelineEvent
  enableKeyboardNavigation(): void
  disableKeyboardNavigation(): void
  enableTouchNavigation(): void
  disableTouchNavigation(): void
}
```

---

### TimelineSkeleton

**Location:** `src/components/TimelineSkeleton.vue`

**Purpose:** Displays an animated loading skeleton while the timeline is initializing, providing visual feedback during the loading state.

**Why it exists:**
- Improves perceived performance by showing content placeholders
- Provides professional UX during initial data loading
- Reduces perceived wait time with shimmer animations

**Interactions:**
- **VueTimelineJS3 → Component:** Shown during initial mount with fade-out transition
- **Component → VueTimelineJS3:** No direct interaction (display-only component)

**Props:**
```typescript
interface Props {
  markerCount?: number  // Number of skeleton markers to display (default: 5)
}
```

**Emitters:** None (display-only component)

**Features:**
- Shimmer animation with gradient effect
- Responsive layout matching actual timeline structure
- Reduced motion support for accessibility
- Skeleton placeholders for menubar, slides, and navigation

---

### TimelineMenuBar

**Location:** `src/components/TimelineMenuBar.vue`

**Purpose:** Provides top-level navigation controls for zooming and jumping to timeline boundaries.

**Why it exists:**
- Offers quick access to common timeline actions
- Provides zoom controls for timenav scale adjustment
- Enables fast navigation to start/end of timeline

**Interactions:**
- **VueTimelineJS3 → Component:** Receives icon provider and options (menubar height)
- **Component → VueTimelineJS3:** Emits user action events (zoom, navigation)

**Props:** None (uses injected values)

**Injected Dependencies:**
```typescript
{
  'timeline-options': TimelineOptions  // Configuration including menubar_height
  'iconProvider': IconProvider         // Icon rendering service
}
```

**Emitters:**
```typescript
{
  'zoom-in': void      // User clicked zoom in button
  'zoom-out': void     // User clicked zoom out button
  'go-to-start': void  // User clicked go to start button
  'go-to-end': void    // User clicked go to end button
}
```

**Features:**
- Customizable icons via icon provider
- Configurable height via options
- Hover states with transitions
- Accessibility support with title attributes

---

### TimelineSlider

**Location:** `src/components/TimelineSlider.vue`

**Purpose:** Manages the horizontal carousel of timeline slides with smooth transitions and virtual scrolling.

**Why it exists:**
- Displays timeline events as navigable slides
- Handles slide transitions and animations
- Implements virtual scrolling for performance with large datasets
- Provides navigation arrows for slide-by-slide browsing

**Interactions:**
- **VueTimelineJS3 → Component:** Receives events, title, current index, and options
- **Component → TimelineSlide:** Renders visible slides with appropriate data
- **TimelineSlide → Component:** Receives click and media-loaded events
- **Component → VueTimelineJS3:** Emits slide change and media loaded events

**Props:**
```typescript
interface Props {
  events: readonly TimelineEvent[]  // Timeline events to display
  title?: TimelineTitle            // Optional title slide
  currentIndex: number             // Currently active slide index
  options: TimelineOptions         // Configuration options
}
```

**Emitters:**
```typescript
{
  'change': number       // User navigated to new slide index
  'media-loaded': string // Media finished loading (event ID)
}
```

**Features:**
- Virtual scrolling (auto-enables for 50+ events)
- Vue TransitionGroup for smooth slide transitions
- Previous/Next navigation buttons
- Disabled state for boundary slides
- Debug mode with virtual scrolling statistics
- Reduced motion support

**Exposed for Debugging:**
```typescript
{
  virtualStats: ComputedRef  // Virtual scrolling statistics
}
```

---

### TimelineSlide

**Location:** `src/components/TimelineSlide.vue`

**Purpose:** Renders an individual timeline slide with content, media, and optional background.

**Why it exists:**
- Displays event data in a structured, visually appealing format
- Supports both title slides and event slides with different layouts
- Handles background images/colors for visual variety
- Integrates media content with appropriate sanitization

**Interactions:**
- **TimelineSlider → Component:** Receives slide data and active state
- **Component → TimelineMedia:** Renders associated media if present
- **TimelineMedia → Component:** Receives media loaded event
- **Component → TimelineSlider:** Emits click and media-loaded events

**Props:**
```typescript
interface Props {
  data: TimelineEvent | TimelineTitle  // Slide content data
  isTitle: boolean                     // Whether this is the title slide
  isActive: boolean                    // Whether this slide is currently active
}
```

**Emitters:**
```typescript
{
  'click': void           // User clicked on the slide
  'media-loaded': void    // Associated media finished loading
}
```

**Features:**
- Background image/color support via dynamic styles
- Different styling for title vs. event slides
- HTML sanitization via DOMPurify for text content
- Responsive font sizing
- Background overlay with opacity
- Conditional media rendering

---

### TimelineMedia

**Location:** `src/components/TimelineMedia.vue`

**Purpose:** Displays various types of media (images, videos, embeds) with appropriate aspect ratios and fallbacks.

**Why it exists:**
- Handles multiple media types (images, YouTube, Vimeo)
- Provides consistent aspect ratio for videos (16:9)
- Shows captions and credits for media
- Offers fallback UI for unsupported media types

**Interactions:**
- **TimelineSlide → Component:** Receives media data to display
- **Component → TimelineSlide:** Emits loaded and error events
- **Component → External:** Loads media from URLs (images, iframe embeds)

**Props:**
```typescript
interface Props {
  media: TimelineMedia  // Media object with url, caption, credit, etc.
}
```

**Media Object Structure:**
```typescript
interface TimelineMedia {
  url?: string        // Media URL
  caption?: string    // Caption text
  credit?: string     // Credit/attribution text
  alt?: string        // Alt text for images
  link?: string       // Link URL
  link_target?: string // Link target (_blank, etc.)
}
```

**Emitters:**
```typescript
{
  'loaded': void  // Media successfully loaded
  'error': void   // Media failed to load
}
```

**Features:**
- Automatic media type detection (image extensions, YouTube, Vimeo)
- 16:9 aspect ratio for video embeds
- Responsive image sizing
- Placeholder UI for unsupported types
- Caption and credit display
- YouTube/Vimeo URL parsing and embed conversion

---

### TimelineNav

**Location:** `src/components/TimelineNav.vue`

**Purpose:** Provides timeline navigation with visual markers, eras, and zoom controls at the bottom of the timeline.

**Why it exists:**
- Offers visual overview of entire timeline
- Enables direct navigation by clicking markers
- Shows temporal relationships between events
- Displays era backgrounds for historical context
- Provides additional zoom controls

**Interactions:**
- **VueTimelineJS3 → Component:** Receives events, eras, current index, and options
- **Component → VueTimelineJS3:** Emits marker clicks and zoom events
- **Component → TimelinePositioning (composable):** Uses D3 scale for marker positioning
- **Component → VirtualMarkers (composable):** Implements virtual scrolling for markers

**Props:**
```typescript
interface Props {
  events: readonly TimelineEvent[]  // Timeline events to show as markers
  eras?: readonly TimelineEra[]     // Era backgrounds
  currentIndex: number              // Currently active event index
  options: TimelineOptions          // Configuration options
  position: 'top' | 'bottom'        // Navigation bar position
}
```

**Emitters:**
```typescript
{
  'marker-click': string  // User clicked a marker (event ID)
  'zoom-in': void        // User clicked zoom in button
  'zoom-out': void       // User clicked zoom out button
}
```

**Features:**
- Virtual scrolling for markers (auto-enables for 100+ markers)
- D3-based positioning for accurate temporal layout
- Marker active state highlighting
- Hover effects with scale transforms
- Era background visualization
- Configurable height
- Position variant (top/bottom)
- Debug mode with virtual marker statistics
- Reduced motion support
- Responsive marker flag sizing

**Exposed for Debugging:**
```typescript
{
  virtualStats: ComputedRef  // Virtual marker statistics
}
```

---

### TimelineMessage

**Location:** `src/components/TimelineMessage.vue`

**Purpose:** Displays centered overlay messages for loading, errors, and informational states.

**Why it exists:**
- Provides user feedback during loading states
- Shows error messages when issues occur
- Offers consistent messaging UI across the application
- Serves as fallback when skeleton loader is not enabled

**Interactions:**
- **VueTimelineJS3 → Component:** Shows when loading without skeleton
- **Component → VueTimelineJS3:** No direct interaction (display-only)

**Props:**
```typescript
interface Props {
  message: string                        // Message text to display
  type?: 'loading' | 'error' | 'info'   // Message type (default: 'loading')
}
```

**Emitters:** None (display-only component)

**Features:**
- Centered overlay positioning
- Icon display based on message type
- Semi-transparent background
- Shadow for depth
- Icon customization via icon provider

---

## Component Communication Patterns

### Data Flow

1. **Top-Down (Props):**
   ```
   VueTimelineJS3 (data, options)
     → TimelineSlider (events, currentIndex)
       → TimelineSlide (data, isActive)
         → TimelineMedia (media)
   ```

2. **Bottom-Up (Events):**
   ```
   TimelineMedia (loaded)
     → TimelineSlide (media-loaded)
       → TimelineSlider (media-loaded)
         → VueTimelineJS3 (media_loaded)
   ```

3. **Dependency Injection:**
   ```
   VueTimelineJS3 provides:
     - timeline-state
     - timeline-options
     - timeline-positioning
     - iconProvider
   
   All children inject as needed
   ```

### State Management

- **Centralized State:** VueTimelineJS3 holds primary state (current slide, loading, ready)
- **Local State:** Each component manages its own UI state (hover, transitions)
- **Computed State:** D3 positioning and virtual scrolling computed in real-time
- **Immutable Data:** All timeline data is read-only, never mutated

### Event Propagation

1. User clicks marker in TimelineNav
2. TimelineNav emits 'marker-click' with event ID
3. VueTimelineJS3 handles event, updates currentIndex
4. Updated index flows down to TimelineSlider and TimelineNav
5. Components react to new active state
6. VueTimelineJS3 emits 'change' event to parent application

---

## Composables Used by Components

### useTimelineState
- **Used by:** VueTimelineJS3
- **Purpose:** Manages timeline state (events, current slide, loading states)

### useTimelinePositioning
- **Used by:** VueTimelineJS3, TimelineNav
- **Purpose:** D3-based positioning calculations for markers and eras

### useVirtualSlides
- **Used by:** TimelineSlider
- **Purpose:** Virtual scrolling implementation for slides

### useVirtualMarkers
- **Used by:** TimelineNav
- **Purpose:** Virtual scrolling implementation for navigation markers

### useIconProvider
- **Used by:** VueTimelineJS3
- **Purpose:** Icon rendering service with customization support

### useKeyboardNavigation
- **Used by:** VueTimelineJS3
- **Purpose:** Keyboard event handling for navigation

### useTouchNavigation
- **Used by:** VueTimelineJS3
- **Purpose:** Touch/swipe gesture detection

### usePropertyMapping
- **Used by:** VueTimelineJS3
- **Purpose:** Maps custom data structures to timeline format

---

## Performance Optimizations

1. **Virtual Scrolling:**
   - TimelineSlider: Renders only visible slides + buffer (50+ events)
   - TimelineNav: Renders only visible markers + buffer (100+ markers)
   - Memory reduction: 90%+ for large datasets

2. **Transition Optimizations:**
   - Vue TransitionGroup for efficient DOM updates
   - will-change: transform for GPU acceleration
   - Reduced motion support disables transitions

3. **Lazy Loading:**
   - Media loads only when visible
   - Skeleton shown during initial load
   - Progressive enhancement approach

4. **Code Splitting:**
   - ES modules with tree-shaking
   - Composables loaded on-demand
   - Icon sets loaded only when used

---

## Accessibility Features

1. **Keyboard Navigation:**
   - Arrow keys for slide navigation
   - Home/End for first/last slide
   - +/- for zoom control
   - Configurable key bindings

2. **ARIA Support:**
   - Button titles for screen readers
   - Disabled states properly marked
   - Focus management

3. **Reduced Motion:**
   - All transitions respect prefers-reduced-motion
   - Animations disabled for accessibility
   - Instant transitions when needed

4. **Touch Support:**
   - Swipe gestures for mobile navigation
   - Configurable sensitivity
   - Works alongside keyboard/mouse

---

## Best Practices for Component Development

1. **Props:** Always use TypeScript interfaces, make props readonly
2. **Emitters:** Define event payloads with TypeScript
3. **Styles:** Use UnoCSS utilities for static styles, scoped CSS for animations
4. **State:** Keep component state minimal, inject shared state
5. **Performance:** Use computed values, avoid watchers when possible
6. **Accessibility:** Include ARIA labels, keyboard support, reduced motion
7. **Testing:** Each component should be testable in isolation

---

## Future Enhancements

Potential areas for component improvements:

1. **TimelineSlide:** Add slide templates/slots for customization
2. **TimelineNav:** Add era interaction (click to filter events)
3. **TimelineMedia:** Support more media types (audio, 3D, AR)
4. **TimelineSkeleton:** Customize skeleton based on actual data structure
5. **All Components:** Add comprehensive unit tests with Vitest
