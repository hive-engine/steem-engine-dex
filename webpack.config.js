const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const {
    AureliaPlugin,
    ModuleDependenciesPlugin
} = require('aurelia-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const ensureArray = config =>
    (config && (Array.isArray(config) ? config : [config])) || [];
const when = (condition, config, negativeConfig) =>
    condition ? ensureArray(config) : ensureArray(negativeConfig);

const title = 'Steem Engine - Smart Contracts on the STEEM blockchain';
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';
  
const loaders = {
    style: { loader: "style-loader" },
    css: { loader: "css-loader" },
    cssModules: {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          modules: true,
          modules: {
            localIdentName: '[name]__[local]____[hash:base64:5]'
          }
        }
    },
    postCss: { loader: "postcss-loader" },
};

const productionCss = [
    {
        loader: MiniCssExtractPlugin.loader,
    },
    loaders.cssModules, 
    loaders.postCss
];

const productionGlobalCss = [
    {
        loader: MiniCssExtractPlugin.loader,
    },
    loaders.css, 
    loaders.postCss
];

module.exports = ({ production, server, extractCss, coverage, analyze, karma} = {}) => ({
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [srcDir, 'node_modules'],
        alias: {
            'base-environment': path.resolve(__dirname, 'aurelia_project/environments/base'),
            'tslib': path.resolve(__dirname, 'node_modules/tslib')
        }
    },
    entry: {
        app: ['aurelia-bootstrapper']
    },
    mode: production ? 'production' : 'development',
    output: {
        path: outDir,
        publicPath: baseUrl,
        filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
        sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
        chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
    },
    performance: { hints: false },
    devServer: {
        contentBase: outDir,
        historyApiFallback: true
    },
    optimization: {
        concatenateModules: false,
    },
    devtool: production ? 'nosources-source-map' : 'cheap-module-eval-source-map',
    module: {
        rules: [
            { 
                test: /\.module.css$/,
                issuer: [{ not: [{ test: /\.html$/i }] }], 
                use: production ? productionCss : [loaders.style, loaders.cssModules, loaders.postCss] 
            },
            { 
                test: /^((?!\.module).)*css$/,
                issuer: [{ not: [{ test: /\.html$/i }] }], 
                use: production ? productionGlobalCss : [loaders.style, loaders.css, loaders.postCss] 
            },
            { 
                test: /\.css$/i, 
                issuer: [{ test: /\.html$/i }], 
                use: [loaders.css, loaders.postCss] 
            },
            { test: /\.html$/i, loader: 'html-loader' },
            { test: /\.ts$/, loader: 'ts-loader' },
            {
                test: /\.(png|gif|jpg|cur)$/i,
                loader: 'url-loader',
                options: { limit: 8192 }
            },
            {
                test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                loader: 'url-loader',
                options: { limit: 10000, mimetype: 'application/font-woff2' }
            },
            {
                test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                loader: 'url-loader',
                options: { limit: 10000, mimetype: 'application/font-woff' }
            },
            {
                test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                loader: 'file-loader'
            },
            ...when(coverage, {
                test: /\.[jt]s$/i,
                loader: 'istanbul-instrumenter-loader',
                include: srcDir,
                exclude: [/\.(spec|test)\.[jt]s$/i],
                enforce: 'post',
                options: { esModules: true }
            })
        ]
    },
    plugins: [
        ...when(!karma, new DuplicatePackageCheckerPlugin()),
        new AureliaPlugin({
            features: {
              ie: false,
              svg: false
            }
        }),
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new ModuleDependenciesPlugin({
            'aurelia-testing': ['./compile-spy', './view-spy']
        }),
        new HtmlWebpackPlugin({
            template: 'index.ejs',
            metadata: {
                title,
                server,
                baseUrl
            }
        }),
        ...when(extractCss, new MiniCssExtractPlugin({
            filename: production
                ? 'css/[name].[contenthash].bundle.css'
                : 'css/[name].[hash].bundle.css',
            chunkFilename: production
                ? 'css/[name].[contenthash].chunk.css'
                : 'css/[name].[hash].chunk.css'
        })),
        ...when(
            production || server,
            new CopyWebpackPlugin([
                { from: 'static', to: outDir, ignore: ['.*'] }
            ])
        ),
        new CopyWebpackPlugin([
            { from: 'src/locales/', to: 'locales/' }
        ]),
        ...when(analyze, new BundleAnalyzerPlugin())
    ]
});
