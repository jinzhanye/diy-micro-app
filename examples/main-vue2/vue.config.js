const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080, // 端口号
    https: false, // https:{type:Boolean}
    proxy: 'http://localhost:3000' // 没有将子应用的静态资源替换成绝对路径，这里临时解决方案，利用 proxy 将所有找不到的静态资源请求到子应用，也就是 localhost:3000
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('diy-micro-app', path.join(__dirname, '../../src/index.js'))
  },
})
