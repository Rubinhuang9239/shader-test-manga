const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const TerserPlugin = require('terser-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {index: './src/index.tsx'},
  devtool: 'inline-source-map',
  output: {
    filename: 'manga_shader_test_main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    host: '0.0.0.0',
    https: true,
    contentBase: './dist',
    hot: true,
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  // target: 'web',
  plugins: [
    // new CopyPlugin({
    //   patterns: [
    //     { from: 'src/assets', to: 'assets' },
    //   ],
    // }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif|vert|frag|gltf|fbx|hdr)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: "assets/[ext]/[name]_[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin({
  //     parallel: true,
  //     terserOptions: {
  //       format: { comments: false },
  //     },
  //     extractComments: false,
  //   })],
  // },
};

