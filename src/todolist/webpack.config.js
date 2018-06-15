const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const isDev = process.env.NODE_ENV === 'development'
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')

const config = {
    target: 'web',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'bundle.[hash:8].js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use: [
                    {
                        loader: 'url-loader', //把图片转换成base64位代码，直接写入js里面，减少http请求，对于小图片作用很大
                        options: {
                            limit: 1024,  //对于图片小于1024进行转译成base64位代码
                            name: '[name].[ext]' //定义输出名称，现在的定义代表按照输入格式进行输出，name是图片名称，ext是格式
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HTMLPlugin(),
        new webpack.DefinePlugin({
           'process.env': {
               NODE_ENV: isDev ? '"development"' : '"production"'
           }
        })
    ]
}
if (isDev) {
    config.module.rules.push({
            test: /\.styl/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true,
                    }
                },
                'stylus-loader'
            ]
     })
    config.devtool = '#cheap-module-eval-source-map'
    config.devServer = {
        port: '8000',
        host: '127.0.0.1',
        overlay: {
            errors: true,
        },
        open: true, //自动打开浏览器
        hot: true //不用全面加载页面，可以实现之前输入保留和下面的config.plugin共同实现功能
    }
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry = {
        app: path.join(__dirname, 'src/index.html'),
        vendor: ['vue']
    }
    config.output.filename = '[name].[chunkhash:8].js'
    config.module.rules.push(
        {
            test: /\.styl/,
            use: ExtractPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    'stylus-loader'
                ]
            })
     })
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css')
    )
    config.optimization = {
        splitChunks:{
            cacheGroups:{
                commons:{
                    chunks: 'initial',
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0
                },
                vendor:{
                    test:/node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 10,
                    enforce: true
                }
            }
        },
        runtimeChunk: true
    }
}
module.exports = config

