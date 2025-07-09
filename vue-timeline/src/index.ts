import type { App } from 'vue'
import { createPinia } from 'pinia'
import Timeline from './components/Timeline.vue'
import 'uno.css'
// import './style/main.css'

export { Timeline }

export default {
  install: (app: App): void => {
    app.use(createPinia())
    app.component('Timeline', Timeline)
  },
}
