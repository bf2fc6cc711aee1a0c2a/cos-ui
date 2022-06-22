const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: './dist',
    },
    client: {
      overlay: false,
      webSocketURL: {
        hostname: 'stage.foo.redhat.com',
      }
    },
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    allowedHosts: 'all',
  },
  plugins: [
    new webpack.DefinePlugin({
      __BASE_PATH__: JSON.stringify(
        process.env.BASE_PATH || 'https://api.stage.openshift.com'
      ),
    }),
    new ReactRefreshWebpackPlugin({
      library: 'cos-ui',
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
});
