const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    context: path.resolve(__dirname, 'src'),

    mode: 'development',
    entry: {
        main: './app.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js'
    },

    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },

    devServer: {
        port: 8081
    },

    plugins: [
        new HtmlWebpackPlugin({
            favicon: './assets/favicon.ico',
            title: 'Sudoku',
            minify: true
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        })
    ],
    module: {
        rules: [
        {
            test: /\.(sa|sc|c)ss$/,
            use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                hmr: devMode,
                },
            },
            'css-loader',
            'postcss-loader',
            'sass-loader',
            ],
        },
        ],
    },
};