import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'

export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: vue({
          reactivityTransform: true
        })
      }
    }),
    UnoCSS(),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'VueTimelineJS',
      fileName: (format) => `vue-timelinejs.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@vueuse/core': 'VueUse'
        }
      }
    }
  }
})
