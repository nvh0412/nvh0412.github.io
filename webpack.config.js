const path = require('path');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'src/app'),
  build: path.join(__dirname, '')
}

module.exports = {
  entry: {
    app: PATHS.app
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { 
        test: /\.jsx?$/,
        include: PATHS.app,
        loader: 'babel',
        query: {
          cacheDirectory: true
        }
      },
      { 
        test: /\.css$/,
        include: PATHS.app,
        loader: "style!css"
      }
    ]
  },  
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}
