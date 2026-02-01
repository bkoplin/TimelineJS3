import { App } from 'vue'
import VueTimelineJS3 from './components/VueTimelineJS3.vue'
import '@fortawesome/fontawesome-free/css/all.css'
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

// Default export
export default {
  install,
  VueTimelineJS3
}
