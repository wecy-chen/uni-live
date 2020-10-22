// const url = 'xcx.fenxiangqu.cn' // 开发版
// const url = "api-newretail.feihongzyg.com"; //飞鸿
// const url = 'zygysb.fenxiangqu.cn' // 演示

module.exports = {
  // 项目名称
  name: 'uni-video',
  /**
   * nginx 配置
   */
  nginx: {
    // 域名
    server_name: '',
    // nginx端口
    NGPOST: 8851,
    // nginx 配置文件目录
    road: '/usr/local/nginx/conf.d',
    // nginx 启用程序
    sbin: '/usr/local/nginx/sbin/nginx',
    // https 证书所在路径
    ssl_path: '/usr/local/nginx/ssl',
    // https key文件
    key: '',
    // https cat文件
    cat: ''
  }
}
