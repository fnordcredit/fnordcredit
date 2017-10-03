// webpack.config.js:

const path = require('path');
const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');

const usingNixOS = process.env.NIX_PROFILES != undefined;
const preBuildScripts = usingNixOS ? [] : ['flow'];

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx']
  },
  entry:  [
    path.resolve(__dirname, 'src/index.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: 'dist/'
  },
  module: {
    loaders: [
      { test: /\.(woff2?|eot|ttf|svg)$/, loader: "file-loader" },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.js(x)?$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new WebpackShellPlugin({onBuildStart:preBuildScripts})
  ],
  devtool: 'source-map'
};
