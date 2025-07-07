import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import postcssNesting from 'postcss-nesting'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'VueTimelineJS',
      fileName: format => `vue-timelinejs.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core'],
      output: {
        globals: {
          'vue': 'Vue',
          '@vueuse/core': 'VueUse',
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssNesting(),
      ],
    },
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: vue({
          reactivityTransform: true,
        }),
      },
      version: 3,
      defineModels: true,
      exportExpose: true,
      defineProp: {
        edition: 'kevinEdition',
      },
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        '@vueuse/math',
        {
          'vue-router/auto': ['useLink'],
        },
      ],
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        globalsPropValue: true,
      },
    }),
    UnoCSS(),
  ],
})
