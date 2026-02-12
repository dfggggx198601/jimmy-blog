# 🚀 AI 全栈实战：从零搭建 VitePress 博客 + 自动抓取推文 + Cloudflare 部署 + GitHub Actions CI/CD

📅 2026-02-13 | 👤 作者: 吉米 (Jimmy) & AI 助手 | 🏷️ #AI #VitePress #Cloudflare #GitHub #教程 #全栈

> 本文完整记录了一次 AI 与人类协作的全栈项目实战。从零开始搭建 VitePress 博客，用无头浏览器从 X.com 抓取推文，部署到 Cloudflare Pages，最终实现 GitHub Actions 自动化 CI/CD。**任何 AI Agent 或开发者看完本文，都能完整复刻整个流程。**

---

## 📋 目录

1. [项目概览与架构](#项目概览与架构)
2. [环境准备](#环境准备)
3. [第一阶段：VitePress 博客搭建](#第一阶段-vitepress-博客搭建)
4. [第二阶段：X.com 推文抓取技术](#第二阶段-x-com-推文抓取技术)
5. [第三阶段：Cloudflare Pages 手动部署](#第三阶段-cloudflare-pages-手动部署)
6. [第四阶段：GitHub + Actions 自动化](#第四阶段-github-actions-自动化)
7. [第五阶段：AI 自动发布系统](#第五阶段-ai-自动发布系统)
8. [完整配置文件参考](#完整配置文件参考)
9. [踩坑记录与技巧总结](#踩坑记录与技巧总结)

---

## 项目概览与架构

### 最终效果

- 📝 一个部署在 Cloudflare Pages 上的 VitePress 静态博客
- 🔍 从 X.com 自动抓取并整理的推文合集
- 🤖 任何 AI Agent 通过一次 API 调用即可发布新文章
- 🔄 push 到 GitHub 后自动构建并部署

### 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| 博客框架 | VitePress | 基于 Vue 的静态站点生成器 |
| 部署平台 | Cloudflare Pages | 全球 CDN，免费托管 |
| CI/CD | GitHub Actions | 自动构建 + 部署 |
| 部署工具 | wrangler | Cloudflare 命令行工具 |
| 推文抓取 | 浏览器 + Cookie + JS | 无头浏览器模拟登录 |
| 域名 | Cloudflare DNS | 自定义域名绑定 |

### 架构图

```
开发者/AI Agent
      │
      ├─ 方式1: git push ──────┐
      │                         │
      ├─ 方式2: GitHub API ────┤
      │                         ▼
      │                    GitHub 仓库
      │                    (jimmy-blog)
      │                         │
      │                    GitHub Actions
      │                    ┌────┴────┐
      │                    │ npm ci   │
      │                    │ vitepress│
      │                    │  build   │
      │                    │ wrangler │
      │                    │  deploy  │
      │                    └────┬────┘
      │                         │
      │                         ▼
      │                  Cloudflare Pages
      │                  (blog.xxx.xyz)
      │                         │
      └─ 方式3: wrangler CLI ──┘
```

---

## 环境准备

### 前置条件

```bash
# 需要的软件
node --version   # Node.js >= 18
npm --version    # npm >= 9
git --version    # Git
gh --version     # GitHub CLI (可选，方便操作)
```

### 需要的账号和凭证

| 凭证 | 用途 | 获取方式 |
|------|------|---------|
| Cloudflare 账号 | 部署博客 | https://dash.cloudflare.com |
| Cloudflare Global API Key | API 操作 | My Profile → API Tokens → Global API Key |
| Cloudflare Account ID | 标识账户 | 通过 API 获取（下面会讲） |
| GitHub 账号 | 代码托管 + CI/CD | https://github.com |
| GitHub Personal Access Token | API 认证 | Settings → Developer settings → PATs |
| 你自己的域名（可选） | 自定义域名 | Cloudflare 管理 |

---

## 第一阶段：VitePress 博客搭建

### 1.1 初始化项目

```bash
# 创建项目目录
mkdir jimmy-blog && cd jimmy-blog

# 初始化 npm 项目
npm init -y

# 安装 VitePress（核心依赖）
npm install vitepress --save-dev
```

::: tip 💡 为什么选 VitePress？
- 基于 Vue 3 + Vite，构建速度极快
- Markdown 即内容，零学习成本
- 内置暗色模式、响应式布局、代码高亮
- 生成纯静态 HTML，适合 CDN 部署
:::

### 1.2 创建目录结构

```bash
mkdir -p .vitepress posts
```

最终目录结构如下：

```
jimmy-blog/
├── .vitepress/
│   └── config.mjs          # VitePress 配置文件
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 工作流
├── posts/                   # 文章目录（核心！）
│   ├── my-first-post.md
│   └── another-post.md
├── index.md                 # 首页
├── package.json
├── package-lock.json
├── .gitignore
└── AI_PUBLISH_GUIDE.md      # AI 发布指南
```

### 1.3 配置 package.json

在 `scripts` 中添加 VitePress 命令：

```json
{
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  }
}
```

### 1.4 创建首页 (index.md)

```markdown
---
layout: home

hero:
  name: "吉米的 OpenClaw 笔记"
  text: "AI 与人类的协作记忆"
  tagline: "把踩过的坑，变成以后好走的路。"
  actions:
    - theme: brand
      text: 查看经验总结
      link: /posts/telegram-config
    - theme: alt
      text: OpenClaw 推文精选
      link: /posts/openclaw-tweets

features:
  - title: 经验沉淀
    details: 记录每一次成功的配置和解决问题的过程。
  - title: AI 友好
    details: 结构化知识库，方便 AI 未来随时查阅。
  - title: 持续更新
    details: 随着探索的深入，内容会越来越丰富。
---
```

### 1.5 创建 VitePress 配置（自动发现文章版本）

这是本项目的**核心技巧之一**：配置文件自动扫描 `posts/` 目录，AI 发新文章时**无需修改任何配置文件**。

```javascript
// .vitepress/config.mjs
import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 自动扫描 posts/ 目录，生成侧边栏和导航
function getPostItems() {
  const postsDir = path.resolve(__dirname, '../posts')
  if (!fs.existsSync(postsDir)) return []

  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .sort()

  return files.map(file => {
    const slug = file.replace('.md', '')
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    // 从 markdown 中提取 # 标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : slug
    return { text: title, link: `/posts/${slug}` }
  })
}

// 按标题关键词自动分类
function categorizeItems(items) {
  const knowledgeKeywords = [
    '配置', '托管', 'Cloudflare', 'Telegram',
    'OpenClaw', 'AI', '教程', '指南', '推文', '部署'
  ]
  const knowledge = []
  const life = []

  items.forEach(item => {
    const isKnowledge = knowledgeKeywords.some(k =>
      item.text.toLowerCase().includes(k.toLowerCase())
    )
    if (isKnowledge) knowledge.push(item)
    else life.push(item)
  })

  const sidebar = []
  if (knowledge.length > 0) sidebar.push({ text: '知识库', items: knowledge })
  if (life.length > 0) sidebar.push({ text: '生活', items: life })
  return sidebar
}

const allItems = getPostItems()
const sidebar = categorizeItems(allItems)
const navItems = [{ text: '首页', link: '/' }]
allItems.slice(0, 4).forEach(item => navItems.push(item))

export default defineConfig({
  title: "吉米的 OpenClaw 笔记",
  description: "AI 经验与知识库",
  themeConfig: {
    nav: navItems,
    sidebar: sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dfggggx198601/jimmy-blog' }
    ]
  }
})
```

::: warning ⚠️ 关键设计决策
传统做法是在 `config.mjs` 中手动列出每篇文章。这意味着每次发新文章都需要同时改两个文件（文章 + 配置），对 AI 不友好。

我们的做法是**让配置自动读取文件系统**，AI 只需 `PUT` 一个 `.md` 文件即可，构建时会自动发现并生成导航。
:::

### 1.6 创建文章

每篇文章是 `posts/` 目录下的一个 `.md` 文件：

```markdown
# 文章标题

📅 2026-02-13 | 👤 作者: 吉米 | 🏷️ #标签1 #标签2

文章导语/摘要。

## 第一节

正文内容...

## 第二节

更多内容...
```

### 1.7 本地预览和构建

```bash
# 本地开发预览（热重载）
npx vitepress dev

# 构建生产版本
npx vitepress build

# 构建产物在 .vitepress/dist/ 目录
ls .vitepress/dist/
```

---

## 第二阶段：X.com 推文抓取技术

### 2.1 核心原理

X.com (Twitter) 没有公开的免费搜索 API。我们的方案是：

```
获取已登录的 Cookie → 无头浏览器加载 Cookie → 模拟已登录用户搜索 → JS 提取推文数据
```

### 2.2 获取 Cookie

从浏览器开发者工具中获取两个关键 Cookie：

1. 打开已登录的 X.com
2. `F12` → `Application` → `Cookies` → `https://x.com`
3. 复制：
   - **`auth_token`**：登录身份令牌
   - **`ct0`**：CSRF Token

### 2.3 设置 Cookie 到无头浏览器

```javascript
// 在浏览器控制台执行
document.cookie = "auth_token=<你的token>; domain=.x.com; path=/; secure; SameSite=None";
document.cookie = "ct0=<你的ct0>; domain=.x.com; path=/; secure; SameSite=None";
```

设置后导航到 `https://x.com/home`，即可以已登录状态访问。

### 2.4 搜索推文

X.com 搜索支持以下高级语法：

```
# 搜索中文推文（热门）
https://x.com/search?q=OpenClaw%20lang%3Azh&src=typed_query&f=top

# 搜索中文推文（最新）
https://x.com/search?q=OpenClaw%20lang%3Azh&src=typed_query&f=live

# 通用搜索
https://x.com/search?q=OpenClaw&src=typed_query&f=top
```

### 2.5 JS 批量提取推文数据

在搜索结果页面执行以下 JavaScript，批量提取推文信息：

```javascript
(() => {
    const tweets = [];
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    articles.forEach((article, i) => {
        const nameEl = article.querySelector('[data-testid="User-Name"]');
        const textEl = article.querySelector('[data-testid="tweetText"]');
        const timeEl = article.querySelector('time');
        const linkEl = article.querySelector('a[href*="/status/"]');

        tweets.push({
            index: i + 1,
            user: nameEl ? nameEl.innerText.replace(/\n/g, ' | ') : 'unknown',
            text: textEl ? textEl.innerText : '',
            time: timeEl ? timeEl.getAttribute('datetime') : '',
            link: linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '',
        });
    });
    return JSON.stringify(tweets, null, 2);
})()
```

### 2.6 滚动加载更多

X.com 使用无限滚动加载。需要多次滚动并重复提取：

```javascript
// 滚动并等待加载
window.scrollBy(0, 1500);
// 等待 3 秒后再次执行提取脚本
```

### 2.7 查看书签

```
导航到 https://x.com/i/bookmarks
同样使用上面的 JS 提取脚本 + 滚动加载
```

::: tip 💡 技巧：关键词过滤
在提取后，用关键词过滤 OpenClaw 相关推文：

```javascript
const keywords = ['openclaw', 'open claw', '小龙虾'];
const filtered = tweets.filter(t =>
  keywords.some(k => t.text.toLowerCase().includes(k))
);
```
:::

---

## 第三阶段：Cloudflare Pages 手动部署

### 3.1 获取 Cloudflare Account ID

```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "X-Auth-Email: <你的邮箱>" \
  -H "X-Auth-Key: <你的Global API Key>" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

输出中的 `id` 字段就是你的 Account ID。

### 3.2 查看已有 Pages 项目

```bash
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/pages/projects" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  -H "Content-Type: application/json" \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
for p in data['result']:
    print(f\"项目: {p['name']}  域名: {p.get('domains', [])}\")
"
```

### 3.3 使用 wrangler 部署

```bash
# 安装 wrangler（Cloudflare 官方 CLI）
# 不需要全局安装，npx 会自动下载

# 构建 VitePress
npx vitepress build

# 部署到 Cloudflare Pages
CLOUDFLARE_API_KEY=<你的Key> \
CLOUDFLARE_EMAIL=<你的邮箱> \
npx wrangler pages deploy .vitepress/dist --project-name=jimmy-blog
```

::: warning ⚠️ 首次使用 npx wrangler
会提示安装 wrangler 包，输入 `y` 确认即可。文件较大（~50MB），需要耐心等待。
:::

### 3.4 手动添加 DNS 记录（自定义域名）

```bash
# 1. 获取 Zone ID
curl -s "https://api.cloudflare.com/client/v4/zones?name=<你的域名>" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['result'][0]['id'])"

# 2. 添加 CNAME 记录
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"blog","content":"jimmy-blog-xxx.pages.dev","proxied":true}'

# 3. 绑定自定义域名到 Pages 项目
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/pages/projects/jimmy-blog/domains" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  -H "Content-Type: application/json" \
  --data '{"name":"blog.xxx.xyz"}'
```

---

## 第四阶段：GitHub + Actions 自动化

### 4.1 创建 .gitignore

```
node_modules/
.vitepress/dist/
.vitepress/cache/
```

### 4.2 创建 GitHub Actions 工作流

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Blog to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:   # 允许手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build VitePress
        run: npx vitepress build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .vitepress/dist --project-name=jimmy-blog
```

### 4.3 初始化 Git 并推送到 GitHub

```bash
# 配置 Git
git config --global user.name "<你的用户名>"
git config --global user.email "<你的邮箱>"

# 初始化仓库
cd jimmy-blog
git init
git add -A
git commit -m "初始提交：VitePress 博客 + 自动发现文章 + GitHub Actions"

# 方式一：使用 GitHub CLI（推荐）
gh auth login  # 按提示登录
gh repo create jimmy-blog --public --source=. --push \
  --description "VitePress 博客，支持 AI Agent 自动发布"

# 方式二：手动创建仓库后推送
# 在 GitHub 网页创建空仓库后：
git remote add origin https://<TOKEN>@github.com/<用户名>/jimmy-blog.git
git push -u origin main
```

::: tip 💡 Git Push 认证技巧
如果 `git push` 一直卡住，通常是认证问题。可以把 Token 直接嵌入 remote URL：

```bash
git remote set-url origin https://<GITHUB_TOKEN>@github.com/<用户名>/jimmy-blog.git
git push origin main
```
:::

### 4.4 创建 Cloudflare Pages 专用 API Token

GitHub Actions 需要一个 Cloudflare API Token（不是 Global API Key）。通过 API 创建：

```bash
# Step 1: 查找 "Pages Write" 权限组 ID
curl -s "https://api.cloudflare.com/client/v4/user/tokens/permission_groups" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  | python3 -c "
import json, sys
for g in json.load(sys.stdin)['result']:
    if 'page' in g['name'].lower():
        print(f\"{g['id']}: {g['name']}\")
"

# 输出中找到：
# 8d28297797f24fb8a0c332fe0866ec89: Pages Write
# e247aedd66bd41cc9193af0213416666: Pages Read

# Step 2: 创建 Token
curl -s -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <API Key>" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "jimmy-blog-deploy",
    "policies": [{
      "effect": "allow",
      "resources": {
        "com.cloudflare.api.account.<ACCOUNT_ID>": "*"
      },
      "permission_groups": [
        {"id": "8d28297797f24fb8a0c332fe0866ec89"}
      ]
    }]
  }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data['success']:
    print(f\"✅ Token: {data['result']['value']}\")
else:
    print(f\"❌ Error: {data['errors']}\")
"
```

### 4.5 配置 GitHub Secrets

```bash
# 使用 gh CLI 配置（最方便）
cd jimmy-blog
gh secret set CLOUDFLARE_API_TOKEN --body "<上一步获取的Token>"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "<你的Account ID>"
```

### 4.6 验证 CI/CD 流水线

```bash
# 手动触发一次 Actions
gh workflow run deploy.yml

# 查看运行状态
gh run list --workflow="deploy.yml" --limit 1 --json status,conclusion

# 预期输出：
# [{"conclusion":"success","status":"completed"}]
```

---

## 第五阶段：AI 自动发布系统

### 5.1 发布方式：GitHub API

AI Agent 只需要一次 HTTP 调用：

```python
import requests
import base64

GITHUB_TOKEN = "<your-token>"
REPO = "dfggggx198601/jimmy-blog"

def publish_post(filename: str, title: str, markdown_content: str):
    """发布一篇新文章到博客

    Args:
        filename: 文件名（英文小写+连字符，不含 .md）
        title: 文章标题
        markdown_content: 完整的 Markdown 内容
    """
    url = f"https://api.github.com/repos/{REPO}/contents/posts/{filename}.md"
    encoded = base64.b64encode(markdown_content.encode('utf-8')).decode('utf-8')

    response = requests.put(url, json={
        "message": f"新文章：{title}",
        "content": encoded
    }, headers={
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    })

    if response.status_code == 201:
        print(f"✅ 发布成功！1-2 分钟后上线")
        print(f"   URL: https://blog.440700.xyz/posts/{filename}.html")
    else:
        print(f"❌ 失败: {response.status_code} {response.json().get('message')}")

    return response.json()
```

### 5.2 curl 版本

```bash
# 1. 将 Markdown 内容 Base64 编码
CONTENT=$(echo '# 我的新文章\n\n正文内容...' | base64)

# 2. 调用 GitHub API
curl -X PUT \
  "https://api.github.com/repos/<用户名>/jimmy-blog/contents/posts/new-post.md" \
  -H "Authorization: token <GITHUB_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"新文章\",\"content\":\"$CONTENT\"}"
```

### 5.3 更新已有文章

更新文章需要先获取文件的 `sha`：

```python
def update_post(filename: str, new_content: str, commit_message: str):
    url = f"https://api.github.com/repos/{REPO}/contents/posts/{filename}.md"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}

    # 1. 获取当前文件的 sha
    current = requests.get(url, headers=headers).json()
    sha = current['sha']

    # 2. 更新文件
    encoded = base64.b64encode(new_content.encode('utf-8')).decode('utf-8')
    response = requests.put(url, json={
        "message": commit_message,
        "content": encoded,
        "sha": sha
    }, headers=headers)

    return response.json()
```

### 5.4 文章格式规范

```markdown
# 文章标题（必须，自动提取为导航标题）

📅 日期 | 👤 作者: xxx | 🏷️ #标签

正文...

## 小节标题

更多内容...
```

**文件命名规则**：
- ✅ `my-article-title.md`（英文小写+连字符）
- ❌ `我的文章.md`（避免中文）
- ❌ `My Article.md`（避免空格和大写）

**自动分类**：标题包含 `AI`, `教程`, `配置`, `部署` 等关键词 → 知识库；其他 → 生活。

---

## 完整配置文件参考

### package.json

```json
{
  "name": "jimmy-blog",
  "version": "1.0.0",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  }
}
```

### .gitignore

```
node_modules/
.vitepress/dist/
.vitepress/cache/
```

---

## 踩坑记录与技巧总结

### 🪤 坑 1：npm install 超时

**现象**：`npm install vitepress` 长时间无响应。

**解决**：
```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm
cnpm install vitepress --save-dev
```

### 🪤 坑 2：git push 卡住

**现象**：`git push origin main` 一直没有响应。

**原因**：git 在等待密码输入，但终端不显示提示。

**解决**：
```bash
# 方案一：将 Token 嵌入 URL
git remote set-url origin https://<TOKEN>@github.com/<用户名>/仓库名.git

# 方案二：禁用终端提示
GIT_TERMINAL_PROMPT=0 git push origin main
```

### 🪤 坑 3：Cloudflare API Token 权限组 ID

**现象**：创建 API Token 时报 `Permission group not found`。

**原因**：权限组 ID 不是固定的，不能从文档中直接复制。

**解决**：先查询可用的权限组：
```bash
curl -s ".../user/tokens/permission_groups" | python3 -c "
import json, sys
for g in json.load(sys.stdin)['result']:
    if 'page' in g['name'].lower():
        print(f\"{g['id']}: {g['name']}\")
"
```

### 🪤 坑 4：wrangler 首次使用需确认安装

**现象**：`npx wrangler` 提示 `Ok to proceed? (y)` 后卡住。

**解决**：
```bash
# 在命令中使用 npx -y 自动确认
npx -y wrangler pages deploy ...
```

### 💡 技巧 1：Cloudflare API 万能模板

所有 Cloudflare API 调用都用这个模板：

```bash
curl -s -X <METHOD> "https://api.cloudflare.com/client/v4/<ENDPOINT>" \
  -H "X-Auth-Email: <邮箱>" \
  -H "X-Auth-Key: <Global API Key>" \
  -H "Content-Type: application/json" \
  [--data '<JSON数据>'] \
  | python3 -m json.tool  # 格式化输出
```

### 💡 技巧 2：X.com 搜索语法

```
关键词 lang:zh           # 限定中文
关键词 from:用户名        # 来自特定用户
关键词 since:2026-01-01  # 从某日期开始
关键词 until:2026-02-13  # 到某日期结束
关键词 min_faves:100     # 最少100赞
```

### 💡 技巧 3：用 python3 -c 做 JSON 处理

替代 `jq`（macOS 默认不装），用 Python 单行脚本处理 JSON：

```bash
# 提取特定字段
curl ... | python3 -c "import json,sys; print(json.load(sys.stdin)['result']['id'])"

# 遍历数组
curl ... | python3 -c "
import json, sys
for item in json.load(sys.stdin)['result']:
    print(item['name'])
"

# 格式化输出
curl ... | python3 -m json.tool
```

### 💡 技巧 4：GitHub Actions + Cloudflare 的最小权限原则

不要在 GitHub Secrets 中存储 Global API Key。创建一个**仅有 Pages Write 权限**的 API Token，降低泄露风险。

---

## 🎉 总结

| 步骤 | 命令/工具 | 耗时 |
|------|----------|------|
| VitePress 安装 | `npm install vitepress` | ~30s |
| 本地构建 | `npx vitepress build` | ~2s |
| 手动部署 | `npx wrangler pages deploy` | ~5s |
| GitHub 推送 | `git push origin main` | ~3s |
| Actions 自动部署 | 自动触发 | ~60s |
| AI 发新文章 | GitHub API PUT 调用 | ~1s |

**从零到上线，整个过程不超过 30 分钟。**

这就是 AI 时代的内容发布工作流 —— 人类负责决策，AI 负责执行。🚀

::: info 💬 声明
本文由 AI 助手与吉米 (Jimmy) 协作完成。所有命令和流程均经过实际验证。
最后更新：2026-02-13
:::
