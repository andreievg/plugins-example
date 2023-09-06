const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
const path = require('path');
const dependencies = require('./package.json').devDependencies;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const fs = require('fs');

const localPlugins = fs
  .readdirSync('./src/plugins')
  .map((fileName) => ({ fileName, fullFileName: path.join('./src/plugins', fileName) }))
  .filter(({ fullFileName }) => fs.lstatSync(fullFileName).isDirectory());

module.exports = (env) => {
  const isProduction = !!env.production;

  return {
    entry: './src/index.ts',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? undefined : 'source-map',
    devServer: {
      hot: true,
      static: isProduction ? path.join(__dirname, 'dist') : path.join(__dirname, 'public'),

      port: 3005,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      open: true,
    },
    resolve: {
      extensions: ['.js', '.css', '.ts', '.tsx'],
      plugins: [new TsconfigPathsPlugin()],
    },
    output: {
      publicPath: '/',
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      chunkFilename: '[contenthash].js',
      clean: {
        keep: (asset) => asset.includes('.gitignore'), // see dist/.gitignore for comments
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      usedExports: true,
    },
    module: {
      rules: [
        {
          test: /\.[t|j]sx?$/,
          loader: isProduction ? 'ts-loader' : 'swc-loader',
          exclude: /node_modules/,
          options: isProduction
            ? {
                /* ts-loader options */
              }
            : {
                /* swc-loader options */
                jsc: {
                  parser: {
                    dynamicImport: true,
                    syntax: 'typescript',
                    tsx: true,
                  },
                  target: 'es2015',
                },
              },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(woff(2)?|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: './fonts/[name][ext]',
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new ReactRefreshWebpackPlugin(),
      new webpack.DefinePlugin({
        API_HOST: JSON.stringify(env.API_HOST),
        LOCAL_PLUGINS: JSON.stringify(localPlugins),
        PLUGIN_URL: JSON.stringify(env.PLUGIN_URL),
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new ModuleFederationPlugin({
        name: 'host',
        shared: [
          {
            '@openmsupply-client/common': {
              eager: true,
            },
            react: {
              singleton: true,
              eager: true,
              requiredVersion: dependencies.react,
            },
            'react-dom': {
              singleton: true,
              eager: true,
              requiredVersion: dependencies['react-dom'],
            },
          },
        ],
      }),
    ],
  };
};
