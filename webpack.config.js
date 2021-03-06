const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const glob = require('glob');
const webpack = require('webpack');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HappyPack = require('happypack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const parts = require('./webpack.parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({ title: 'Webpack demo' }),
      new webpack.NamedModulesPlugin(),
      new DuplicatePackageCheckerPlugin(),
      new HappyPack({
        loaders: [
          // Capture Babel loader
          'babel-loader',
        ],
      }),
      new HardSourceWebpackPlugin(),
    ],
  },
  parts.loadFonts({
    options: {
      name: '[name].[hash].[ext]',
    },
  }),
  parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
  {
    performance: {
      hints: 'warning', // "error" or false are valid too
      maxEntrypointSize: 50000, // in bytes, default 250k
      maxAssetSize: 450000, // in bytes
    },
    output: {
      chunkFilename: '[name].[chunkhash].js',
      filename: '[name].[chunkhash].js',
    },
    recordsPath: path.join(__dirname, 'records.json'),
  },
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[hash].[ext]',
    },
  }),
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.extractBundles([
    {
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource),
    },
    {
      name: 'manifest',
      minChunks: Infinity, // tells webpack not to move any modules to the resulting bundle
    },
  ]),
  parts.clean(PATHS.build),
  parts.attachRevision(),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  parts.setFreeVariable('process.env.NODE_ENV', 'production'),
]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.lintJavaScript(),
  parts.loadImages(),
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({
    type: 'cheap-module-eval-source-map',
  }),
  parts.dontParse({
    name: 'react',
    path: path.resolve(__dirname, 'node_modules/react/umd/react.production.min.js'),
  }),
]);

module.exports = (env) => {
  // to allow choosing babel plugins for each target (development/production)
  process.env.BABEL_ENV = env;

  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
};
