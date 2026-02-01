import type { App } from 'vue'
import VueTimelineJS3 from './components/VueTimelineJS3.vue'
// Font Awesome icons are now handled by UnoCSS Icons preset
import 'virtual:uno.css'

// Export the component
export { VueTimelineJS3 }

// Export types
export * from './types/timeline'

// Export composables
export { useTimelineState } from './composables/useTimelineState'
export { useTimelineEvents } from './composables/useTimelineEvents'
export { usePropertyMapping } from './composables/usePropertyMapping'

// Plugin install function
export function install(app: App) {
  app.component('VueTimelineJS3', VueTimelineJS3)
}
