const path = require('path');
// const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('babel-register');

module.exports = {
  entry: './src/main.js',
  cache: false,
  mode:'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'adaguc-webmapjs-reactdemo.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.woff2$|\.eot$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader?name=[name].[ext]' // <-- retain original file name
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals:{
    jquery: 'jQuery',
    moment: 'moment'
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  devServer: {
    overlay: true
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
module.loaders = [
  { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }
];
