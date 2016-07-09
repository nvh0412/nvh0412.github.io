const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./libs/parts');
const TARGET = process.env.npm_lifecycle_event;

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

const common = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].[hash].js',
    // This is used for require.ensure. The setup
    // will work without but this is useful to set.
    chunkFilename: '[chunkhash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Vagabond'
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

var config;

//Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common,
      {
        devtool: 'source-map'
      },
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
      parts.minify(),
      parts.setFavicon(),
      parts.setupCSS(PATHS.app),
      parts.setupImage(PATHS.app),
      parts.setupBabel(PATHS.app)
    );
    break;
  case 'stats':
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      }),
      parts.setupCSS(PATHS.app),
      parts.setupImage(PATHS.app),
      parts.setupBabel(PATHS.app)
    );
}

module.exports = validate(config);
