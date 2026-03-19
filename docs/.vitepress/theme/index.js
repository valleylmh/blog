import DefaultTheme from 'vitepress/theme'
import './custom.css'
import 'viewerjs/dist/viewer.min.css'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import { useRoute } from 'vitepress'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    // 注册全局组件（可选，可在 Markdown 中使用 <vImageViewer> 标签）
    ctx.app.component('vImageViewer', vImageViewer)
  },
  setup() {
    const route = useRoute()
    // 启用插件，自动为所有图片添加无级缩放功能
    imageViewer(route)
  }
}