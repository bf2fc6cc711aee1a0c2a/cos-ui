const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ChunkMapper = require('@redhat-cloud-services/frontend-components-config/chunk-mapper');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const { federatedModuleName } = require('./package.json');
const { dependencies } = require('../../package.json');

const fileRegEx = /\.(png|woff|woff2|eot|ttf|svg|gif|jpe?g|png)(\?[a-z0-9=.]+)?$/;
const singletonDeps = [
  'axios',
  'react',
  'react-dom',
  'react-router-dom',
  'react-redux',
  '@patternfly/react-core',
  '@patternfly/react-charts',
  '@patternfly/react-table',
  '@patternfly/react-icons',
  '@patternfly/react-styles',
  '@patternfly/react-tokens',
];
module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';
  const isDemoApp = !!argv.hot; // kinda hacky, but if we have hot reload enabled then we are running the demo app, so we need these to be eagerly loaded
  return {
    entry: {
      // we add an entrypoint with the same name as our name in ModuleFederationPlugin.
      // This merges the two "chunks" together. When a remoteEntry is placed on the page,
      // the code in this kas-connectors entrypoint will execute as part of the remoteEntry startup.
      main: './src/index.tsx',
    },
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.join(__dirname, 'src'),
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.css|s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
          sideEffects: true,
        },
        {
          test: fileRegEx,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new Dotenv({
        systemvars: true,
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? '[id].[contenthash:8].css' : '[name].css',
        chunkFilename: isProduction ? '[id].[contenthash:8].css' : '[id].css',
        ignoreOrder: true, // Enable to remove warnings about conflicting order
      }),
      new ModuleFederationPlugin({
        name: federatedModuleName,
        filename: `${federatedModuleName}${
          isProduction ? '[chunkhash:8]' : ''
        }.js`,
        exposes: {
          './OpenshiftManagedConnectors': './src/federated',
        },
        shared: !isDemoApp
          ? {
              ...dependencies,
              ...singletonDeps.reduce((acc, dep) => {
                acc[dep] = {
                  singleton: true,
                  requiredVersion: dependencies[dep],
                };
                return acc;
              }, {}),
            }
          : Object.entries(dependencies).reduce((acc, [dep, version]) => {
              acc[dep] = {
                singleton: true,
                eager: true,
                requiredVersion: version,
              };
              return acc;
            }, {}),
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
      new ChunkMapper({
        modules: [federatedModuleName],
      }),
    ].filter(Boolean),
  };
};
