import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Optimize SCSS compilation
        outputStyle: 'compressed',
        sourceMap: false
      }
    },
    // Enable CSS modules for better tree-shaking
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify CSS
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueTimelineJS3',
      fileName: (format) => `vue-timeline-js3.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'vue-timeline-js3.css';
          }
          return assetInfo.name as string;
        },
        // Manual chunk splitting for better caching
        manualChunks: undefined
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500
  }
})
