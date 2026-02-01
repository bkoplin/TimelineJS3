import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    })
  ],
  theme: {
    colors: {
      'timeline': {
        primary: '#c34528',
        secondary: '#333',
        background: '#fff',
        text: '#333',
        border: '#ccc'
      }
    }
  },
  shortcuts: {
    'tl-button': 'px-4 py-2 rounded bg-timeline-primary text-white hover:opacity-80 cursor-pointer',
    'tl-card': 'bg-white rounded shadow p-4'
  }
})
