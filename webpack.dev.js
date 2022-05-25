const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')

module.exports = merge.smart(
  {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: ['./src/template', './src/css'],
      contentBasePublicPath: ['/', '/css'],
      stats: 'verbose',
      openPage: '/index.html',
      disableHostCheck: true,
    },
    module: {
      rules: [{
        test: /\.less$/,
        use: ['style-loader'],
      }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/template/index.html',
      }),
    ],
  }, common,
)
