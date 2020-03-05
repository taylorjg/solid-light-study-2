/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { version } = require('./package.json')

const PUBLIC_FOLDER = path.resolve(__dirname, 'server', 'public')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: PUBLIC_FOLDER,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: '.', from: '*.html' },
      { context: '.', from: '*.css' }
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html',
      version
    })
  ],
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader'
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    contentBase: PUBLIC_FOLDER
  }
}
