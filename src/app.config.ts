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
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '简历改造',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
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
  cloud: true,
})
