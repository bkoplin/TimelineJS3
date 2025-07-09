import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    tsconfigPaths(),
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
      resolvers: [
        (name: string) => {
          // Auto import icons from FontAwesome
          if (name.startsWith('FontAwesome')) {
            return {
              name,
              from: '@fortawesome/vue-fontawesome',
            }
          }
          // Auto import icons from AwesomeKit
          if (name.startsWith('byPrefixAndName')) {
            return {
              name,
              from: '@awesome.me/kit-fbc16e12c7/icons',
            }
          }
        },
      ],
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
        {
          from: '@fortawesome/vue-fontawesome',
          imports: ['FontAwesomeIcon', 'FontAwesomeLayers'],
        },
        {
          from: '@awesome.me/kit-fbc16e12c7/icons',
          imports: [
            'byPrefixAndName',
            'all',
            'fab',
            'fad',
            'fak',
            'fakd',
            'fal',
            'far',
            'fas',
            'fasds',
            'fasl',
            'fasr',
            'fass',
            'fast',
            'fat',
          ],
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
