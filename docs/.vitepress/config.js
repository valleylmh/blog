const path = require('path')
const vue2 = require('../vue2.x/sidebar')
const vue3 = require('../vue3.x/sidebar')
const dataStructure = require('../dataStructure/sidebar')
const algorithm = require('../algorithm/sidebar')
const nodeJs = require('../nodeJs/sidebar')
const trainingJs = require('../trainingJs/sidebar')
const jobJs = require('../companyJob/sidebar')
const openClawSidebar = require('../ai/openclaw/sidebar')

function convertSidebar(sidebarConfig) {
  const result = {}
  const processGroup = (group, key) => {
    if (Array.isArray(group)) {
      return { text: group[1] || group[0], link: (key + group[0]) }
    }
    if (typeof group === 'string') {
      const text = group === '' ? '简介' : (group.split('/').pop().replace(/\.md$/, '') || group)
      const link = (key + group)
      return { text, link: link.endsWith('/') || link.endsWith('.md') ? link : (link + '.md') }
    }
    const item = {
      text: group.text || group.title || '章节'
    }
    if (group.link) {
      const link = (key + group.link)
      item.link = link.endsWith('/') || link.endsWith('.md') ? link : (link + '.md')
    }
    if (group.children || group.items) {
      item.items = (group.children || group.items).map(child => processGroup(child, key))
    }
    if (group.collapsable !== undefined || group.collapsed !== undefined) {
      item.collapsed = group.collapsable === false ? false : (group.collapsed !== undefined ? group.collapsed : true)
    }
    return item
  }

  for (const key in sidebarConfig) {
    result[key] = (sidebarConfig[key] || []).map(group => processGroup(group, key))
  }
  return result
}

module.exports = {
  outDir: '../dist',
  ignoreDeadLinks: true,
  cleanUrls: false,
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
    [
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
    ['script', { src: 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js' }],
  ],
  locales: {
    root: { label: '简体中文', lang: 'zh-CN' }
  },
  themeConfig: {
    logo: '/logo.jpg',
    outline: {
      label: '页面导航',
      level: [2, 3],
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    algolia: {
      appId: 'BH4D9OD16A', // Vitepress algolia require appId
      apiKey: '79ccf0632a76664033618fcec9968e1b',
      indexName: 'valleylmh',
    },
    nav: [
      {
        text: 'AI驱动',
        items: [
          { text: 'openclaw养虾记', link: '/ai/openclaw/' },
        ]
      },
      {
        text: 'FrontEnd',
        items: [
          {
            text: '基础/框架',
            items: [
              { text: '工作笔录', link: '/companyJob/' },
              { text: '学习路线', link: '/roadmap/' },
              { text: 'Vue.js 3', link: '/vue3.x/notes/' },
              { text: 'Vue.js 2', link: '/vue2.x/' },
            ]
          },
          {
            text: '前端进阶',
            items: [
              { text: 'Node.js', link: '/nodeJs/notes/' },
              { text: '数据结构', link: '/dataStructure/' },
              { text: '算法', link: '/algorithm/' },
              { text: '手撕JS', link: '/trainingJs/' },
            ]
          }
        ]
      },
      {
        text: '随笔',
        items: [
          { text: '年度总结', link: '/life/year/' },
          { text: '杂记', link: '/life/other/' },
          { text: '老喻的人生算法课', link: '/life_algorithm/' },
        ]
      },
      { text: 'github', link: 'https://github.com/valleylmh/vuepress-blog' },
    ],
    sidebar: convertSidebar({
      '/ai/openclaw/': openClawSidebar,
      '/nodeJs/notes/': nodeJs,
      '/dataStructure/': dataStructure,
      '/algorithm/': algorithm,
      '/trainingJs/': trainingJs,
      '/vue3.x/notes/': vue3,
      '/vue2.x/': vue2,
      '/life/year/': [
        {
          title: '年度总结',
          collapsable: false,
          children: ['2019', '2020', '2021', '2022', '2023', '2024']
        },
      ],
      '/companyJob/': jobJs,
      '/life/other/': [
        {
          title: '买房小记',
          collapsable: false,
          children: [
            ['house/buy-house', '2021年记录杭州买房大事'],
            ['house/prepare-buy-house', '杭州看房小记（一）'],
            ['house/prepare-buy-house2', '看房小记（二）'],
            ['house/prepare-buy-house3', '看房小记（三）——买房自测'],
          ]
        },
        ['homeTown01', '老家农村的结婚：赤裸裸的金钱交易'],
        ['homeTown02', '老家农村的结婚（二）——故事篇']
      ],
      '/life_algorithm/': [
        ['', '为什么推荐'],
        '01_A', '02_A', '03_A', '04_A', '05_B', '06_B', '07_B', '08_B', '09_B', '10_B', '11_B', '12_B', '13_B', '14_B', '15_B', '16_B', '17_B', '18_B',
      ],
    }),
  }
}
