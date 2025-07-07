import Timeline from './components/Timeline.vue'
import 'uno.css'

export { Timeline }

export default {
  install: (app) => {
    app.component('Timeline', Timeline)
  }
}
