/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: './dist',
    },
    client: {
      overlay: true,
    },
    historyApiFallback: true,
    //open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    allowedHosts: 'all',
  },
  plugins: [
    // new CopyPlugin({
    //   patterns: [{ from: './src/keycloak.dev.json', to: 'keycloak.json' }],
    // }),
    new webpack.DefinePlugin({
      __BASE_PATH__: JSON.stringify(
        process.env.BASE_PATH || 'https://api.stage.openshift.com'
      ),
    }),
  ],
});
