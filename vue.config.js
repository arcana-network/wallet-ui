const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const webpack = require('webpack')

module.exports = defineConfig({
  assetsDir: 'assets',
  transpileDependencies: true,
  configureWebpack: {
    optimization: {
      splitChunks: {
        maxSize: 500 * 1024,
      },
    },
    // resolve: {
    //   fallback: {
    //     buffer: require.resolve('buffer/'),
    //     crypto: require.resolve('crypto-browserify'),
    //     stream: require.resolve('stream-browserify'),
    //     zlib: false,
    //     https: false,
    //     http: false,
    //     path: false,
    //     fs: false,
    //   },
    // },
    devtool: process.env.VUE_APP_SOURCEMAPS ? 'source-map' : false,
    plugins: [
      new NodePolyfillPlugin({
        additionalAliases: ['process'],
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
