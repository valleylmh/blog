const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');
const { marked } = require('marked');
const hljs = require('highlight.js');
const juice = require('juice');
const sharp = require('sharp');

// 加载项目根目录下的 .env 文件
require('dotenv').config({ path: path.join(__dirname, '../.env') });

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-' // 微信对 class 有过滤，但 inline style 会被 juice 保留
});
const myTheme = `
wrapper { font-size: 16px; line-height: 2em; letter-spacing: 0.1em; }
pre, code {
  font-size: 0.8em;
  line-height: 1.8em;
  font-family: Roboto, 'Courier New', Consolas, Inconsolata, Courier, monospace;
  margin: auto 5px;
}
code {
  white-space: pre-wrap;
  border-radius: 2px;
  display: inline;
}
pre {
  font-size: 15px;
  line-height: 1.4em;
  display: block !important;
}

pre code {
  white-space: pre;
  overflow: auto;
  border-radius: 3px;
  padding: 1px 1px;
  display: block !important;
}
strong, b{
  color: #ff896e;
}

em, i {
  color: #22ab39;
}

hr {
  border: 1px solid #22ab39;
  margin: 1.5em auto;
}

p {
  margin: 1.5em 5px !important;
}

table, pre, dl, blockquote, q, ul, ol {
  margin: 10px 5px;
}

ul, ol {
  padding-left: 15px;
}

li {
  margin: 10px;
}

li p {
  margin: 10px 0 !important;
}

ul ul, ul ol, ol ul, ol ol {
  margin: 0;
  padding-left: 10px;
}

ul {
  list-style-type: circle;
}

dl {
  padding: 0;
}

dl dt {
  font-size: 1em;
  font-weight: bold;
  font-style: italic;
}

dl dd {
  margin: 0 0 10px;
  padding: 0 10px;
}

blockquote, q {
  border-left: 2px solid #22ab39;
  padding: 0 10px;
  color: #777;
  quotes: none;
  margin-left: 1em;
}

blockquote::before, blockquote::after, q::before, q::after {
  content: none;
}

h1, h2, h3, h4, h5, h6 {
  margin: 20px 0 10px;
  padding: 0;
  font-weight: bold !important;
  color: #22ab39 !important;
  text-align: center !important;
  margin: 1.5em 5px !important;
  padding: 0.5em 1em !important;
}

h1 {
  font-size: 24px !important;
  border-bottom: 1px solid #ddd !important;
}

h2 {
  font-size: 20px !important;
  border-bottom: 1px solid #eee !important;
}

h3 {
  font-size: 18px;
}

h4 {
  font-size: 16px;
}


table {
  padding: 0;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 1em;
  font: inherit;
  border: 0;
  margin: 0 auto;
}

tbody {
  margin: 0;
  padding: 0;
  border: 0;
}

table tr {
  border: 0;
  border-top: 1px solid #CCC;
  background-color: white;
  margin: 0;
  padding: 0;
}

table tr:nth-child(2n) {
  background-color: #F8F8F8;
}

table tr th, table tr td {
  font-size: 16px;
  border: 1px solid #CCC;
  margin: 0;
  padding: 5px 10px;
}

table tr th {
  font-weight: bold;
  color: #eee;
  border: 1px solid #009688;
  background-color: #009688;
}`
// --- 配置区 ---
const CONFIG = {
  // 从环境变量读取，安全性更高
  appId: process.env.WECHAT_APPID,
  appSecret: process.env.WECHAT_APPSECRET,
  // 修正路径：直接存放在当前目录下的 .wechat_token.json
  tokenFile: path.join(__dirname, '.wechat_token.json')
};
/**
 * 1. 缓存式获取 Access Token (避免频繁请求接口被封)
 */
async function getAccessToken() {
  if (await fs.pathExists(CONFIG.tokenFile)) {
    const cached = await fs.readJson(CONFIG.tokenFile);
    if (cached.expires_at > Date.now()) return cached.token;
  }

  if (!CONFIG.appId || !CONFIG.appSecret) {
    throw new Error('❌ 未找到微信 AppID 或 AppSecret，请检查项目根目录下的 .env 文件！');
  }

  console.log(`正在请求 Token (AppID: ${CONFIG.appId?.slice(0, 6)}... Secret: ${CONFIG.appSecret?.slice(0, 4)}***)`);

  const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${CONFIG.appId}&secret=${CONFIG.appSecret}`);
  const token = res.data.access_token;
  if (!token) throw new Error('❌ 无法获取微信 Token, 详情:' + JSON.stringify(res.data));
  await fs.writeJson(CONFIG.tokenFile, {
    token,
    expires_at: Date.now() + (res.data.expires_in - 200) * 1000
  });
  return token;
}

/**
 * 2. 智能压缩并上传图片
 */
async function uploadAndCompressImg(token, imgPath, isCover = false) {
  let buffer = await fs.readFile(imgPath);
  const meta = await sharp(buffer).metadata();

  // 如果超过 2MB 或宽度太大，进行处理
  if (buffer.length > 2 * 1024 * 1024 || meta.width > 1200) {
    buffer = await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  const type = isCover ? 'material/add_material?type=image' : 'media/uploadimg';
  // 关键修正：确保第一个参数使用的是 ? 而不是 &
  const separator = type.includes('?') ? '&' : '?';
  const url = `https://api.weixin.qq.com/cgi-bin/${type}${separator}access_token=${token}`;

  const form = new FormData();
  form.append('media', buffer, { filename: path.basename(imgPath) });

  const formHeaders = form.getHeaders();
  // 获取表单真实长度，很多微信网关会校验这个
  const len = await new Promise((resolve, reject) => {
    form.getLength((err, length) => {
      if (err) reject(err);
      resolve(length);
    });
  });

  const res = await axios.post(url, form, {
    headers: {
      ...formHeaders,
      'Content-Length': len,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    proxy: false,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
  return isCover ? res.data.media_id : res.data.url;
}

/**
 * 3. 核心流：Markdown 转 微信草稿
 */
async function publishArticle(mdPath, coverPath, title, isPreview = false) {
  try {
    const baseDir = path.dirname(mdPath);

    // A. 读取内容并去掉头部 YAML
    let content = await fs.readFile(mdPath, 'utf-8');
    content = content.replace(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*/, '');

    // B. 转换 Markdown 并高亮代码
    let html = marked.parse(content);

    let token = null;
    if (!isPreview) {
      console.log('--- 准备获取 Token ---');
      token = await getAccessToken();
      console.log('--- Token 获取成功 ---');
    }

    // C. 处理正文图片 (正则匹配并上传替换)
    const imgRegex = /<img [^>]*src=["']([^"']+)["'][^>]*>/g;
    let match;
    const imgMatches = [];
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) imgMatches.push(match[1]);
    }

    console.log(`检测到 ${imgMatches.length} 张正文图片`);

    for (const oldSrc of imgMatches) {
      if (!oldSrc) continue;
      
      if (!oldSrc.includes('http')) {
        let absolutePath;
        if (oldSrc.startsWith('/')) {
          absolutePath = path.join(__dirname, '../docs/public', oldSrc);
        } else {
          absolutePath = path.resolve(baseDir, oldSrc);
        }

        if (isPreview) {
          console.log(`[预览模式] 跳过图片上传: ${absolutePath}`);
          html = html.replace(oldSrc, 'file://' + absolutePath.replace(/\\/g, '/'));
        } else {
          console.log(`正在上传正文图片: ${absolutePath}`);
          const wxUrl = await uploadAndCompressImg(token, absolutePath);
          if (!wxUrl) {
            console.warn(`⚠️ 图片上传失败，保留原路径: ${absolutePath}`);
            continue;
          }
          html = html.replace(oldSrc, wxUrl);
        }
      }
    }

    // D. 注入 CSS 样式
    console.log('--- 准备注入 CSS (Juice) ---');
    const finalHtml = juice(`<style>${myTheme}</style><div class="wrapper">${html}</div>`);
    console.log('--- CSS 注入成功 ---');

    if (isPreview) {
      const previewPath = path.join(__dirname, 'preview.html');
      console.log('--- 准备写入预览文件 ---');
      await fs.writeFile(previewPath, `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>微信文章预览 - ${title}</title>
                    <style>
                        body { background: #f0f2f5; padding: 20px; display: flex; justify-content: center; }
                        .phone-mockup { 
                            background: white; 
                            width: 375px; 
                            border: 1px solid #ddd; 
                            border-radius: 8px; 
                            padding: 20px; 
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="phone-mockup">
                        <h2 style="text-align: left; margin-bottom: 20px; color: #333;">${title}</h2>
                        ${finalHtml}
                    </div>
                </body>
                </html>
            `);
      console.log(`✅ 预览文件已生成: ${previewPath}`);
      console.log(`请在浏览器中打开该文件查看效果。`);
      return;
    }

    // E. 上传封面并创建草稿 (非预览模式)
    const absoluteCoverPath = path.resolve(process.cwd(), coverPath);
    console.log(`正在上传封面图: ${absoluteCoverPath}`);
    const thumbId = await uploadAndCompressImg(token, absoluteCoverPath, true);
    console.log('--- 封面图上传成功 ---');
    const res = await axios.post(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`, {
      articles: [{
        title,
        content: finalHtml,
        thumb_media_id: thumbId,
        author: 'Valley',
        need_open_comment: 1
      }]
    });

    console.log('✅ 发布成功！草稿 ID:', res.data.media_id);
  } catch (err) {
    console.error('❌ 自动化失败:', err.response?.data || err.message);
  }
}

// --- 调用示例 (在项目根目录运行: node wechat/wechatAutoPost.js [preview]) ---
const args = process.argv.slice(2);
const isPreviewMode = args.includes('preview');

publishArticle(
  './docs/ai/articles/date/20260329.md',
  './docs/public/images/articles/20260329/cover.png',
  'AI 中转站的“三板斧”：鉴别真假模型的“试金石”',
  isPreviewMode
);
