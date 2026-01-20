# Poem - Vue 3 + TypeScript 前端项目模板

本项目是基于 Vue 3 + TypeScript + Vite 构建的通用前端项目模板，适配诗词类应用开发场景，也可作为各类 Vue 3 项目的快速启动基座，具备开箱即用的工程化配置和高效的开发体验。

## 📋 项目声明

本项目由阿里云 ESA 提供加速、计算和保护
![阿里云ESA](https://github.com/Ayj2004/poem/blob/main/src/assets/aliyun.png)

## ✨ 核心特性

- **技术栈前沿**：基于 Vue 3 `<script setup>` 语法 + TypeScript，遵循官方最佳实践；
- **构建高效**：采用 Vite 作为构建工具，支持极速热更新、按需编译，开发体验远超传统 Webpack；
- **样式工程化**：集成 Tailwind CSS（原子化 CSS 框架）+ PostCSS，兼顾样式开发效率与扩展性；
- **规范目录结构**：区分通用组件、页面组件、组合式函数等，适配中大型项目开发；
- **类型安全**：完善的 TypeScript 多环境配置，全链路类型校验，降低线上风险。

## 🚀 快速开始

### 环境要求

- Node.js ≥ 16.0.0
- npm/yarn/pnpm（推荐 pnpm）

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 pnpm（推荐）
pnpm install

# 使用 yarn
yarn install
```

### 本地开发

```bash
# 启动开发服务器（默认端口：5173）
npm run dev
```

### 构建打包

```bash
# 生产环境构建
npm run build

# 预览构建产物
npm run preview
```

## 📂 目录结构

```
poem/
├── .gitignore                # Git 忽略规则
├── README.md                 # 项目说明文档
├── esa.jsonc                 # 阿里云ESA自定义配置
├── index.html                # Vite 入口 HTML
├── package.json/lock.json    # 依赖管理
├── postcss.config.js         # PostCSS 配置
├── tailwind.config.js        # Tailwind CSS 配置
├── tsconfig*.json            # TypeScript 多环境配置
├── vite.config.ts            # Vite 构建配置
├── public/                   # 静态资源（不参与编译）
└── src/                      # 源码目录
    ├── App.vue               # 根组件
    ├── assets/               # 业务静态资源（图片/样式）
    ├── components/           # 通用组件
    ├── composables/          # Vue 3 组合式函数
    ├── index.css             # 全局样式
    ├── main.ts               # 项目入口（创建Vue实例）
    ├── router/               # 路由配置
    ├── types/                # TS 类型定义
    ├── views/                # 页面级组件
    └── vite-env.d.ts         # Vite 环境类型声明
```

## ⚙️ 关键配置说明

1. **TypeScript 配置**：拆分 `tsconfig.json`（主配置）、`tsconfig.app.json`（应用代码）、`tsconfig.node.json`（Node 环境），适配 Vue 3 + Vite 编译规则；
2. **样式配置**：Tailwind CSS 支持原子化样式快速编写，PostCSS 自动补全 CSS 前缀、按需优化；
3. **构建配置**：`vite.config.ts` 可自定义代理、插件、构建输出等，满足个性化需求。

## 🛠️ 技术栈明细

| 技术/工具    | 版本/说明               |
| ------------ | ----------------------- |
| Vue          | 3.x（Composition API）  |
| TypeScript   | 4.x+                    |
| Vite         | 4.x+                    |
| Tailwind CSS | 3.x+（原子化 CSS 框架） |
| PostCSS      | 8.x+（CSS 后处理工具）  |

## 📄 许可证

本项目基于 MIT 协议开源，详情见 LICENSE 文件。

## 💡 注意事项

- 开发前请确保 Node.js 版本符合要求，避免依赖安装失败；
- 若需对接阿里云 ESA 能力，需参考 `esa.jsonc` 配置文件完成环境配置；
- 生产环境构建前，建议调整 `vite.config.ts` 中的压缩、缓存等配置，优化产物性能。
