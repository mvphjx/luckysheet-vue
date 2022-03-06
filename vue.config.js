module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    // ico Loader
    // config.module
    //     .rule('ico')
    //     .test(/\.ico$/)
    //     .use('url-loader')
    //     .end()
  },
  configureWebpack:{

  }
  // module:{
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: ['style-loader','css-loader']
  //     }
  //   ]
  // }
}
