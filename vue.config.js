const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  assetsDir: 'assets',
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      },
    },
    devtool: process.env.VUE_APP_SOURCEMAPS ? 'source-map' : false,
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
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
