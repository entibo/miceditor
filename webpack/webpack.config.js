// @ts-check

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')


const root = path.resolve(__dirname, '..')

/** @type { import('webpack').Configuration } */
module.exports = {

  mode: 'development',

  // context: root,

  entry: path.resolve(root, 'src', 'main.js'),

  output: {
    path: path.resolve(root, 'dist'),
    filename: 'main.js',
  },

  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.ts', 'mjs', '.js', '.pcss', '.svelte'],
    mainFields: ['browser', 'module', 'main'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        }
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        loader: 'svelte-loader',
        options: {
          emitCss: true,
        },
      },
      {
        test: /\.p?css$/,
        use: [
          'style-loader', /* MiniCssExtractPlugin.loader, */
          {
            loader: 'css-loader',
            options: { 
              url: false,
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('tailwindcss'),
              ],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    /* new MiniCssExtractPlugin({  }), */
  ],

}