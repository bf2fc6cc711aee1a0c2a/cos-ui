const path = require('path');
const url = require('@rollup/plugin-url');
const svgr = require('@svgr/rollup').default;
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins = [
      url(),
      svgr({
        // configure however you like, this is just an example
        ref: true,
        memo: true,
        svgoConfig: {
          plugins: [
            { removeViewBox: false },
            { removeAttrs: { attrs: 'g:(stroke|fill):((?!^none$).)*' } },
          ],
        },
      }),
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        extract: path.resolve('dist/cos-ui-app.css'),
      }),
      ...config.plugins,
    ];

    return config;
  },
};
