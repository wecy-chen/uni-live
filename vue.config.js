const fs = require('fs')
const path = require('path')
let baseConfig = require('./src/config/index')
const resolve = file => path.resolve(__dirname, file)
const { copyValue } = require('./src/utils/file')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin
// 是否为生产环境
const isProduction = process.env.NODE_ENV !== 'development'

if (fs.existsSync(resolve('./project.config.js'))) {
  const projectConfig = require('./project.config.js')
  copyValue(projectConfig, baseConfig)
}

process.env.VUE_APP_CONFIG = JSON.stringify(baseConfig)

module.exports = {
  devServer: {
    disableHostCheck: true
  }
}
