const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const deps = require("./package.json").peerDependencies;

const BG_IMAGES_DIRNAME = 'bgimages';
const useContentHash = true; // TODO figure out if needed

module.exports = {
  entry: {
    // we add an entrypoint with the same name as our name in ModuleFederationPlugin.
    // This merges the two "chunks" together. When a remoteEntry is placed on the page,
    // the code in this kas-connectors entrypoint will execute as part of the remoteEntry startup.
    main: "./src/index.tsx",
  },
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 1337,
    https: true,
    allowedHosts: ['prod.foo.redhat.com']
  },
  output: {
    // public path can be what it normally is, not a absolute, hardcoded url
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ]
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../../node_modules/patternfly'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css')
        ],
        use: ["style-loader", "css-loader"]
      },
      {
        test: /bootstrap\.tsx$/,
        loader: "bundle-loader",
        options: {
          lazy: true,
        },
      },
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react", "@babel/preset-typescript"],
        },
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, '../../node_modules/patternfly/dist/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/fonts'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/pficon')
        ],
        use: {
          loader: 'file-loader',
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: 'fonts',
            name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]'
          }
        }
      },
      {
        test: /\.svg$/,
        include: input => input.indexOf('background-filter.svg') > 1,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000,
              outputPath: 'svgs',
              name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader if they live under a 'bgimages' directory
        // this is primarily useful when applying a CSS background using an SVG
        include: input => input.indexOf(BG_IMAGES_DIRNAME) > -1,
        use: {
          loader: 'svg-url-loader',
          options: {}
        }
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader when they don't live under a 'bgimages',
        // 'fonts', or 'pficon' directory, those are handled with other loaders
        include: input => (
          (input.indexOf(BG_IMAGES_DIRNAME) === -1) &&
          (input.indexOf('fonts') === -1) &&
          (input.indexOf('background-filter') === -1) &&
          (input.indexOf('pficon') === -1)
        ),
        use: {
          loader: 'raw-loader',
          options: {}
        }
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../../node_modules/patternfly'),
          path.resolve(__dirname, '../../node_modules/@patternfly/patternfly/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/dist/styles/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(__dirname, '../../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images')
        ],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000,
              outputPath: 'images',
              name: useContentHash ? '[contenthash].[ext]' : '[name].[ext]'
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
    new ModuleFederationPlugin({
      name: "kas-connectors",
      remotes: {
        // will be dynamic
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      excludeChunks: ["kas-connectors"],
    }),
  ],
};