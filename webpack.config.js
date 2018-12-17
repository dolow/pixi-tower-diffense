const webpack = require('webpack');
const path    = require('path');

module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || process.env.WEBPACK_ENV || argv.mode || 'development';

  return {
    mode: mode,
    entry: {
      index: path.join(__dirname, 'src', 'index.ts'),
    },

    output: {
      path: path.join(__dirname, 'lib'),
      filename: (mode === 'production')
        ? 'tower-diffence.min.js'
        : 'tower-diffence.js',
      library: 'tower-diffence',
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

    devtool: (mode === 'production') ? false : 'source-map',

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
