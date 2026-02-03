# 项目开发指南 (GEMINI.md)

## 1. 项目概述
本项目名为“赤心巡天·天机阁”，旨在基于现有的 Markdown 资料构建一个现代化的、交互式的“赤心巡天”小说维基（Wiki）网站。

## 2. 核心规范 (Core Mandates)

### 2.1 语言规范 (Language)
*   **交互语言**：AI 的思考过程 (Thinking Process)、回答内容 (Response) 必须全程使用 **简体中文**。
*   **代码注释**：所有代码文件中的注释必须使用 **简体中文**。
*   **文档语言**：项目文档和提交记录 (Commit Message) 使用 **简体中文**。

### 2.2 技术栈 (Tech Stack)
*   **包管理器**: [pnpm](https://pnpm.io/)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **核心框架**: [Vue 3](https://vuejs.org/) (SPA 架构)
*   **路由管理**: [Vue Router](https://router.vuejs.org/)
*   **状态管理**: [Pinia](https://pinia.vuejs.org/)
*   **UI 框架**: [Element Plus](https://element-plus.org/) + [Tailwind CSS](https://tailwindcss.com/)
*   **数据可视化**: [Apache ECharts](https://echarts.apache.org/)
*   **数据处理**: 
    *   `markdown-it` (前端渲染 Markdown)
    *   Node.js Scripts (构建时预处理数据为 JSON)

## 3. 目录结构设计 (Directory Structure)
```
/
├── public/                 # 静态资源 & 生成的 JSON 数据 (data/)
├── src/                    # 源代码
│   ├── assets/             # 图片、样式
│   ├── components/         # 公共组件
│   ├── layouts/            # 页面布局 (Default, FullScreen)
│   ├── pages/              # 页面视图 (Home, CharacterDetail, Graph)
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态
│   └── utils/              # 工具函数
├── docs/                   # 内容源 (Markdown 数据库)
├── scripts/                # 数据转换脚本 (MD -> JSON)
├── package.json
└── tsconfig.json
```

## 4. 功能模块规划
1.  **天机阁 (Dashboard)**: 首页，包含全局搜索、随机人物、统计概览。
2.  **因果界 (Graph)**: 全屏交互式人物关系图谱。
3.  **万象书 (Wiki)**: 
    *   人物详情页 (动态路由 `/character/:id`)
    *   世界观与设定页
4.  **山河图 (Map)**: 势力分布与层级展示。

## 5. 开发工作流
1.  **脚手架搭建**: 初始化 VitePress 环境。
2.  **数据层开发**: 编写脚本解析现有 Markdown 结构，生成供前端使用的 JSON 数据源。
3.  **组件开发**: 实现 ECharts 关系图组件、人物卡片组件。
4.  **内容集成**: 配置侧边栏与导航，挂载 Markdown 文件。

---
*上次更新: 2026年1月29日*
