import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
      collections: {
        // Use Font Awesome icons from CDN for better tree-shaking
        fa: () => import('@iconify-json/fa6-solid').then(i => i.icons as any)
      }
    })
  ],
  // Safelist specific Font Awesome icons that are used
  safelist: [
    // Menu icons
    'i-fa-magnifying-glass-plus',
    'i-fa-magnifying-glass-minus', 
    'i-fa-backward-fast',
    'i-fa-forward-fast',
    
    // Navigation icons
    'i-fa-chevron-left',
    'i-fa-chevron-right',
    
    // Marker icons
    'i-fa-circle',
    'i-fa-circle-dot',
    
    // Media type icons
    'i-fa-image',
    'i-fa-video',
    'i-fa-volume-high',
    'i-fa-globe',
    'i-fa-file',
    'i-fa-map-location-dot',
    'i-fa-code',
    
    // State icons
    'i-fa-spinner',
    'i-fa-triangle-exclamation',
    'i-fa-circle-exclamation',
    'i-fa-circle-info',
    'i-fa-circle-check',
    
    // UI icons
    'i-fa-xmark',
    'i-fa-expand',
    'i-fa-compress',
    'i-fa-share-nodes',
    'i-fa-download',
    'i-fa-plus',
    'i-fa-minus'
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
