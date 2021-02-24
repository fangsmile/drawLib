/*
 * @Author: your name
 * @Date: 2021-02-21 11:47:56
 * @LastEditTime: 2021-02-24 15:54:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \drawing-webpack\webpack.config.js
 */
const TerserPlugin = require('terser-webpack-plugin') // 引入压缩插件
const glob = require('glob');
const path = require('path');
var enter=glob.sync("./drawing/**/*.ts").reduce((entries, p) => {
    const name = path.basename(p, '.ts') //获取路径的文件名 aaa/bbb.js => bbb
    return { ...entries, [name]: p }
  }, {});
var enterArr=glob.sync("./drawing/**/*.ts").reduce((entries, p) => {
    return [ ...entries, p ]
  }, []);
module.exports = {
    mode: 'development', // 因为默认是production 默认会进行压缩
    entry: {...enter,'index':enterArr,'index.min':enterArr},
    output: {
        path:path.resolve(__dirname, 'dist/src'),
        filename: "[name].js",
        library: "drawing",
        libraryExport: "default", // 不添加的话引用的时候需要 tools.default
        libraryTarget: "umd", // var this window ...
    },
    module:{
        rules:[
            {
                test: /\.ts$/,
                use: [
                  {
                    loader: 'babel-loader'
                  },
                  {
                    loader: 'ts-loader'
                  }
                ]
              },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({ // 使用压缩插件
                include: /\.min\.js$/
            })
        ]
    }
}