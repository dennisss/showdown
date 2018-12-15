const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');
const grunt = require('grunt');

module.exports = {
  mode: 'production',
  entry: {
    'showdown': './src/index.ts',
    'showdown.min': './src/index.ts'
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'showdown',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: "(typeof window !== 'undefined' ? window : this)",
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { configFile: path.resolve(__dirname, 'tsconfig.umd.json') }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      include: /\.min\.js$/,
      sourceMap: true
    })]
  },
  externals: {
    jsdom: 'jsdom'
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `${pkg.name} v ${pkg.version} - ${grunt.template.today("dd-mm-yyyy")}`
    })
  ]
};
