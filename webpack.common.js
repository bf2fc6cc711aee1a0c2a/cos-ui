const { dependencies, federatedModuleName } = require('./package.json');
delete dependencies.serve; // Needed for nodeshift bug
const ChunkMapper = require('@redhat-cloud-services/frontend-components-config/chunk-mapper');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
//const BG_IMAGES_DIRNAME = 'bgimages';
const path = require('path');
const webpack = require('webpack');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-styles/css/') ||
  stylesheet.includes('@patternfly/react-core/');

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';
  const isDevelopment = argv && argv.mode === 'development';
  const entryName = process.env.DEMO_APP === 'true' ? federatedModuleName : 'app';
  return {
    entry: {
      [entryName]: path.resolve(__dirname, 'src', 'index.tsx'),
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => ({
                  before: [
                    isDevelopment && new ReactRefreshTypeScript(),
                  ].filter(Boolean),
                }),
                transpileOnly: isDevelopment, // dev type checking is done via fork-ts-checker-webpack-plugin
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
          include: (stylesheet) => !isPatternflyStyles(stylesheet),
          sideEffects: true,
        },
        {
          test: /\.css$/,
          include: isPatternflyStyles,
          use: ['null-loader'],
          sideEffects: true,
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              limit: 5000,
              name: isProduction ? '[contenthash:8].[ext]' : '[name].[ext]',
            },
          },
        },
        {
          test: /\.(svg|jpg|jpeg|png|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                name: isProduction ? '[contenthash:8].[ext]' : '[name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.(json)$/i,
          include: path.resolve(__dirname, 'src/locales'),
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'locales',
                name: isProduction ? '[contenthash:8].[ext]' : '[name].[ext]',
              },
            },
          ],
        },
      ],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      // new CopyPlugin({
      //   patterns: [{ from: './favicon.png', to: 'images' }],
      // }),
      new CopyPlugin({
        patterns: [{ from: './locales', to: 'locales' }],
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[contenthash:8].css',
        insert: (linkTag) => {
          const preloadLinkTag = document.createElement('link');
          preloadLinkTag.rel = 'preload';
          preloadLinkTag.as = 'style';
          preloadLinkTag.href = linkTag.href;
          document.head.appendChild(preloadLinkTag);
          document.head.appendChild(linkTag);
        },
      }),
      new ChunkMapper({
        modules: [federatedModuleName],
      }),
      new webpack.container.ModuleFederationPlugin({
        name: federatedModuleName,
        filename: `${federatedModuleName}${
          isProduction ? '[chunkhash:8]' : ''
        }.js`,
        exposes: {
          './OpenshiftManagedConnectors': './src/AppFederated',
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies['react'],
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
          },
          'react-router-dom': {
            singleton: false, // consoledot needs this to be off to be able to upgrade the router to v6. We don't need this to be a singleton, so let's keep this off
            requiredVersion: dependencies['react-router-dom'],
          },
          '@rhoas/app-services-ui-shared': {
            singleton: true,
            requiredVersion: dependencies['@rhoas/app-services-ui-shared'],
          },
          '@patternfly/quickstarts': {
            singleton: true,
            requiredVersion: '*',
          },
        },
      }),
    ].filter(Boolean),
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
    },
  };
};
