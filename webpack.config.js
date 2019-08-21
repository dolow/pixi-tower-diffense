const webpack      = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path         = require('path');

module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || process.env.WEBPACK_ENV || argv.mode || 'development';
  const isProduction = (mode === 'production');

  return {
    mode: mode,
    entry: {
      index: path.join(__dirname, 'src', 'index.ts'),
    },

    output: {
      path: path.join(__dirname, 'www'),
      filename: isProduction
        ? 'tower-diffense.min.js'
        : 'tower-diffense.js',
      library: 'tower-diffense',
      libraryTarget: 'umd'
    },

    // typescript transpiling files
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            { loader: 'ts-loader' }
          ]
        }
      ]
    },

    // binding files
    resolve: {
      extensions: ['.js', '.ts'],
      modules: [
        path.resolve(__dirname, 'src'),
        "node_modules"
      ]
    },

    node: {
      fs: 'empty'
    },

    devtool: 'source-map',

    optimization: {
      minimizer: [
        // クラス名で比較している箇所を機能させる
        new TerserPlugin({
          sourceMap: !isProduction,
          terserOptions: {
            keep_classnames: true,
            keep_fnames: true
          }
        })
      ]
    },

    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ],

    devServer: {
      contentBase: path.join(__dirname, 'www'),
      compress: true,
      port: 8080
    }
  }
};
