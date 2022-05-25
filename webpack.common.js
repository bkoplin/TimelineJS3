const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const output_path = path.resolve(
  __dirname, 'dist',
)
module.exports = {
  entry: './src/js/index.ts',
  mode: 'development',
  optimization: {
    usedExports: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'timeline.js',
    path: path.join(
      output_path, 'js',
    ),
    library: 'TL', // https://webpack.js.org/configuration/output/#outputlibrary
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './src/js/language/locale/*.json',
          to: path.join(
            output_path, 'js/locale/[name][ext]',
          ),
        },
        {
          from: './src/embed/*',
          to: path.join(
            output_path, 'embed/[name][ext]',
          ),

        },
      ],
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.[t|j]sx?$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015',
          tsconfigRaw: require('./tsconfig.json'),
        },
      },
      {
        test: /\.less$/,
        use: [{
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          },
        },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../css/icons',
          },
        }],
      },
    ],
  },
}
