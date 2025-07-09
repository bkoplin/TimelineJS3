import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, presetWind4, transformerCompileClass, transformerDirectives, transformerVariantGroup } from 'unocss'

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
    'btn': 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'icon-btn': 'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600 !outline-none',
  },
  safelist: [
    // Add any classes that might be dynamically applied
  ],
  preflights: [
  ],
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      extendTheme: true,
      inlineImports: true,
      fonts: {
        sans: ['Aptos', 'DM Sans', 'Inter', 'Roboto'],
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
      
    }),
  ],
  transformers: [
    transformerCompileClass(),
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
