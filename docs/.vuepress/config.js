
const path = require('path')
const vue2 = require('../vue2.x/sidebar')
const vue3 = require('../vue3.x/sidebar')
const dataStructure = require('../dataStructure/sidebar')
const algorithm = require('../algorithm/sidebar')
const nodeJs = require('../nodeJs/sidebar')
const trainingJs = require('../trainingJs/sidebar')
const jobJs = require('../companyJob/sidebar')
// console.log(path.resolve(__dirname, './public/bdunion.txt'))
module.exports = {
  // base: '/',
  dest: 'dist',
  title: '一界码农',
  description: '越努力越幸运',
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.jpg' }],
    ['meta', { name: 'referrer', content: 'no-referrer' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['meta', { name: 'baidu-site-verification', content: 'code-IoDDvZg9UC' }],
    ['meta', { name: 'baidu_union_verify', content: 'ef8729d54c118ea2f89c9b5813838aaa' }],
    ['meta', { name: 'renderer', content: 'webkit' }],
    ['meta', { 'http-equiv': 'X-UA-Compatible', content: 'edge' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover' }],
    [ // 添加百度站长平台
      "script", {}, `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?a40ea45f7e812f35bb88ba0db4f7e663";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
      `
    ],
    ['script', {src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'}],
  ],
  locales: {
    '/': {lang: 'zh-CN'}
  },
  additionalPages: [
    // { // 百度联盟推广
    //   path: '/bdunion.txt/',
    //   filePath: path.resolve(__dirname, './public/bdunion.txt')
    // }
  ],
  themeConfig: {
    editLinks: false,
    docsDir: 'docs',
    logo: '/logo.jpg',
    algolia: {
      // 申请邮件成功会返回下面的apiKey和indexName
      apiKey: '79ccf0632a76664033618fcec9968e1b',
      indexName: 'valleylmh',
      // 自己在algoia注册的是没法爬取，除非不用这个插件
      // appId: '9SS6JJUJ4Z',
      // apiKey: '8aa26175ecbc4cba2eb6395325e77be0',
      // indexName: 'blog',
    },
    nav: [
      {
        text: 'FrontEnd',
        ariaLabel: '只要学得动，就往死里学',
        items: [
          { text: '工作笔录', link: '/companyJob/' },
          { text: '学习路线', link: '/roadmap/' },
          { text: 'Vue.js 3', link: '/vue3.x/notes/' },
          { text: 'Vue.js 2', link: '/vue2.x/' },
        ]
      },
      {
        text: '前端进阶',
        ariaLabel: '学会简单就是不简单',
        items: [
          { text: 'Node.js', link: '/nodeJs/notes/' },
          { text: '数据结构', link: '/dataStructure/' },
          { text: '算法', link: '/algorithm/' },
          { text: '手撕JS', link: '/trainingJs/' },
        ]
      },
      {
        text: '随笔', //link: '/study_life/',
        ariaLabel: '生活的理想就是为了理想的生活',
        items: [
          { text: '买房小记', link: '/life/house/' },
          { text: '年度总结', link: '/life/year/' },
          { text: '杂记', link: '/life/other/' },
          { text: '老喻的人生算法课', link: '/life_algorithm/' },
        ]
      },
      // { text: '投资学习', link: '/invest/' },
      { text: 'github', link: 'https://github.com/valleylmh/vuepress-blog' },
    ],
    sidebar: {
      '/nodeJs/notes/': [
        {
          title: 'nodeJs学习向全栈进阶',
          collapsable: false,
          children: nodeJs
        }
      ],
      '/dataStructure/': [
        {
          title: '进阶学习之数据结构',
          collapsable: false,
          children: dataStructure
        }
      ],
      '/algorithm/': [
        {
          title: '进阶学习之算法',
          collapsable: false,
          children: algorithm
        }
      ],
      '/trainingJs/': [
        {
          title: '手撕JS练习基本功',
          collapsable: false,
          children: trainingJs
        }
      ],
      '/vue3.x/notes/': [
        {
          title: 'VueJs3.0核心源码解析',
          collapsable: false,
          children: vue3
        }
      ],
      '/vue2.x/': [
        {
          title: 'Vue2.x版本',
          collapsable: false,
          children: vue2
        }
      ],
      '/life/year/': [
        {
          title: '年度总结',
          collapsable: false,
          children: ['2019','2020','2021','2022','2023','2024']
        },
      ],
      '/companyJob/': [
        {
          title: '工作笔录',
          collapsable: false,
          children: jobJs
        }
      ],
      '/life/house/': [
        ['buy-house', '2021年记录杭州买房大事'],
        ['prepare-buy-house', '杭州看房小记（一）'],
        ['prepare-buy-house2', '看房小记（二）'],
        ['prepare-buy-house3', '看房小记（三）——买房自测'],
      ],
      '/life/other/': [
        ['homeTown01', '老家农村的结婚：赤裸裸的金钱交易'],
        ['homeTown02', '老家农村的结婚（二）——故事篇']
      ],
      '/life_algorithm/': [
        ['', '为什么推荐'],
        '01_A', '02_A', '03_A', '04_A', '05_B', '06_B', '07_B', '08_B', '09_B', '10_B', '11_B', '12_B', '13_B', '14_B', '15_B', '16_B', '17_B', '18_B', 
      ],
    },
    lastUpdated: '上次更新',
  },
  plugins: [
    ['@vuepress/back-to-top'],
  ]
}
