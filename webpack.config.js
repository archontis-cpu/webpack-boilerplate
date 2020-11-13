const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const ESLintPlugin = require("eslint-webpack-plugin");
const webpack = require("webpack");
const chalk = require("chalk");
const path = require("path");

const mode = process.env.NODE_ENV;
const isDev = mode === "development";

function getOptimizationOptions() {
  const prodOptions = {
    minimize: true, 
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
    // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
    // instead of having their own. This also helps with long-term caching, since the chunks will only
    // change when actual code changes, not the webpack runtime.
    runtimeChunk: {
      name: "runtime",
    },
    // tree-shaking
    usedExports: true,
  }

  const defaultOptions = {
    splitChunks: {
      chunks: "all",
    },
  }

  return {
    ...defaultOptions,
    ...(!isDev ? prodOptions : null),
  }
}

const getWebpackPlugins = () => {
  const base = [
    new HtmlWebpackPlugin({
      title: "Webpack Boilerplate",
      template: path.resolve(__dirname, "./public/template.html"),
      favicon: path.resolve(__dirname, "./public/favicon.png"),
      filename: "index.html",
      minify: {
        collapseWhitespace: !isDev,
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/assets"),
          to: "assets",
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css',
    }),
    new CleanWebpackPlugin(),
  ]

  if (isDev) {
    return [
      ...base,   
      new webpack.HotModuleReplacementPlugin(),
      // new webpack.SourceMapDevToolPlugin({
      //   filename: '[name].js.map',
      //   exclude: ['vendor.js']
      // }),
      // new ESLintPlugin({ fix: true, formatter: "table" }),
    ];
  }

  return [...base, new BundleAnalyzerPlugin()];
}

const PORT = 8080;

function getDevServerOptions() {
  return {
    contentBase: path.join(__dirname, "build"),
    open: true,
    compress: true,
    hot: true,
    port: PORT,
    publicPath: "/",
  }
}

function getCSSLoaders() {
  return [
    isDev ? "style-loader" : MiniCssExtractPlugin.loader, 
    "css-loader",
    'postcss-loader',
  ]
}

console.log(chalk.black.bgGreen.bold("Environment set to", mode, "mode"));

module.exports = {
  // context: "src",
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: isDev ? "[name].bundle.js" : "js/[name].[contenthash].bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@styles": path.resolve(__dirname, "src", "styles"),
      "@assets": path.resolve(__dirname, "src", "assets"),
    }
  },
  plugins: getWebpackPlugins(),
  devServer: getDevServerOptions(),
  optimization: getOptimizationOptions(),
  devtool: isDev ? 'source-map' : '',
  module: {
    rules: [
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: "asset/inline",
      },
      {
        test: /.scss$/,
        use: [ ...getCSSLoaders(), "sass-loader" ],
      },
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          { loader: "babel-loader" },
        ],
      },
    ]
  },
}