const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = defineConfig({
  assetsDir: 'assets',
  transpileDependencies: true,
  configureWebpack: {
    optimization: {
      splitChunks: {
        maxSize: 500 * 1024,
      },
    },
    devtool: process.env.VUE_APP_SOURCEMAPS ? 'source-map' : false,
    plugins: [
      new NodePolyfillPlugin({
        additionalAliases: ['process']
      }),
      new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 1000 * 1024,
      }),
    ],
    devServer: {
      allowedHosts: 'all',
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws',
      },
    },
  },
})
