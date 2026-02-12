import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 自动扫描 posts/ 目录，生成侧边栏和导航
function getPostItems() {
    const postsDir = path.resolve(__dirname, '../posts')
    if (!fs.existsSync(postsDir)) return []

    const files = fs.readdirSync(postsDir)
        .filter(f => f.endsWith('.md'))
        .sort() // 按文件名字母排序

    return files.map(file => {
        const slug = file.replace('.md', '')
        const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
        // 从 markdown 的第一个 # 标题中提取文章标题
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1].trim() : slug

        return { text: title, link: `/posts/${slug}` }
    })
}

// 按标签/关键词自动分类
function categorizeItems(items) {
    const knowledgeKeywords = ['配置', '托管', 'Cloudflare', 'Telegram', 'OpenClaw', 'AI', '教程', '指南', '推文', '部署']
    const knowledge = []
    const life = []

    items.forEach(item => {
        const isKnowledge = knowledgeKeywords.some(k =>
            item.text.toLowerCase().includes(k.toLowerCase())
        )
        if (isKnowledge) {
            knowledge.push(item)
        } else {
            life.push(item)
        }
    })

    const sidebar = []
    if (knowledge.length > 0) {
        sidebar.push({ text: '知识库', items: knowledge })
    }
    if (life.length > 0) {
        sidebar.push({ text: '生活', items: life })
    }
    return sidebar
}

const allItems = getPostItems()
const sidebar = categorizeItems(allItems)

// 导航栏：固定首页 + 动态文章（最多展示 4 篇，其余在侧边栏浏览）
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
