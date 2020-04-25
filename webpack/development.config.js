// @ts-check

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const root = path.resolve(__dirname, '..')

const typeCheck = !!process.env.TYPECHECK

/** @type { import('webpack').Configuration } */
module.exports = {

  mode: 'development',
  
  devtool: false,

  devServer: {
    host: '0.0.0.0',
    publicPath: '/dist/',
    liveReload: false,
    hotOnly: true,
  },

  stats: {
    children: false,
  },

  entry: path.resolve(root, 'src', 'main.js'),

  output: {
    publicPath: '/dist/',
    path: path.resolve(root, 'dist'),
    filename: 'main.js',
  },

  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.ts', '.js', '.pcss', '.svelte'],
    mainFields: ['browser', 'module', 'main'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: !typeCheck,
        }
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        loader: 'svelte-loader-hot',
        options: {
          dev: true,
          emitCss: true,
          hotReload: true,
          hotOptions: {
            noPreserveState: true,
            optimistic: true,
          },
        },
      },
      {
        test: /\.p?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
              reloadAll: true,
            },
          },
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
    new MiniCssExtractPlugin({
      filename: 'main.css',
    })
  ],

}