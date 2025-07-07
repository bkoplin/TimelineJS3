import Timeline from './components/Timeline.vue'
import 'uno.css'
import type { App } from 'vue'

export { Timeline }

export default {
  install: (app: App): void => {
    app.component('Timeline', Timeline)
  }
}
