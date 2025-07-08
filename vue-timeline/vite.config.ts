import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },
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
        /**
         * 'kevinEdition' | 'johnsonEdition'
         * @default 'kevinEdition'
         */
        edition: 'kevinEdition',
      },
      // options
    }),
    // https://github.com/unplugin/unplugin-vue-components
    Components({
      directoryAsNamespace: true,
      dts: './src/components.d.ts',
      collapseSamePrefixes: true,

    }),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        '@vueuse/math',
        {
          from: 'vue',
          imports: ['GlobalComponents'],
          type: true,
        },
      ],
      dts: './src/auto-imports.d.ts',
      vueTemplate: true,
      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: true, // Default `false`
        // provide path ending with `.mjs` or `.cjs` to generate the file with the respective format
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }),

    UnoCSS(),
  ],
})
