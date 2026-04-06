// 小程序全局配置
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/check/index',
    'pages/analyzing/index',
    'pages/result/index',
    'pages/report/index',
    'pages/rewrite/index',
    'pages/interview/index',
    'pages/history/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '简历体检',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0f172a',
  },
  // 底部 Tab 栏
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#818cf8',
    backgroundColor: '#1e293b',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/history/index',
        text: '记录',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
  // 云开发环境 ID（上线前替换为真实环境 ID）
  cloud: true,
})
