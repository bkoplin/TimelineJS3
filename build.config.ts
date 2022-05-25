// build.config.ts
import path from 'path'
import {
  defineBuildConfig,
} from 'unbuild'
// import {
//   build,
// } from 'esbuild'
// import {
//   lessLoader,
// } from 'esbuild-plugin-less'
import rollupPluginLess from 'rollup-plugin-less'
// import rollupPluginWindicss from 'rollup-plugin-windicss'

export default defineBuildConfig({
  declaration: true,
  entries: [
    './src/js/index',
  ],
  hooks: {
    'rollup:options': function (
      ctx, options,
    ) {
      options.plugins = [
        rollupPluginLess({
          insert: true,
        }),
        ...options.plugins,
      ]
    },
  },
  rollup: {
    dts: {
      compilerOptions: {
        noEmitOnError: false,
      },
    },
    emitCJS: true,
    // esbuild: {
    //   minify: true,
    // },
  },
})
