import { defineConfig } from 'unocss'

export default defineConfig({
  theme: {
    // Define your theme variables here
    colors: {
      'timeline-bg': '#ffffff',
      'timeline-text': '#333333',
      'timeline-marker': '#c34528',
      'timeline-title': '#000000',
      'timeline-line': '#cccccc',
      'timeline-active': '#0088cc',
    },
  },
  shortcuts: {
    // Define helpful shortcuts for common timeline styles
    'tl-container': 'w-full relative bg-timeline-bg',
    'tl-storyslider': 'w-full relative',
    'tl-timenav': 'w-full relative',
    'tl-menubar': 'absolute z-10 flex items-center justify-between',
    'tl-slide': 'w-full relative',
    'tl-marker': 'absolute cursor-pointer',
  },
  safelist: [
    // Add any classes that might be dynamically applied
    'tl-timeline',
    'tl-storyslider',
    'tl-timenav',
    'tl-menubar',
    'tl-slide-active',
    'tl-marker-active',
    'tl-layout-portrait',
    'tl-layout-landscape',
    'tl-mobile',
    'tl-skinny',
    'tl-medium',
  ],
})
