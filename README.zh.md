# 低代码平台 (Low Code Platform)

[English](./README.md) | 中文

## 简介

## 项目结构

```
low-code-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── db.ts           # SQLite 数据库初始化
│   │   └── index.ts        # Express 服务入口
│   └── data/
│       └── projects.db     # SQLite 数据库文件
│
└── frontend/               # 前端应用
    └── src/
        ├── components/     # Vue 组件
        │   ├── CanvasArea.vue         # 画布区域
        │   ├── RenderCanvasComponent.vue  # 组件渲染器
        │   ├── ComponentPanel.vue    # 左侧组件面板
        │   ├── PropertyPanel.vue     # 右侧属性面板
        │   └── useDragDrop.ts        # 拖拽组合式函数
        ├── stores/         # Pinia 状态管理
        │   └── editor.ts   # 编辑器状态
        ├── composables/    # Vue 组合式函数
        ├── data/           # 静态数据
        │   └── component-definitions.ts  # 组件定义
        └── types/
            └── component.ts  # 组件类型定义
```

## 技术栈

- **Vue 3** - 前端框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **TailwindCSS** - 原子化 CSS
- **Pinia** - 状态管理
- **Express.js** - 后端框架（尚未对接）
- **better-sqlite3** - SQLite 数据库（尚未对接）

## 快速开始

```bash
# 安装前端依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

应用运行在 `http://localhost:5173`

## 功能特性

- **拖拽组件**：从左侧面板拖拽组件到画布
- **组件编辑**：点击组件选中并编辑属性
- **属性面板**：在右侧修改内边距、外边距、文字、样式
- **预览模式**：切换预览查看最终效果
- **导出 HTML**：将画布内容导出为 HTML 文件
- **清空画布**：重置工作区

## 支持的组件

| 组件 | 说明 |
|------|------|
| 文本 (text) | 可配置内容、字号、字重、颜色 |
| 按钮 (button) | 可配置文字、变体、尺寸 |
| 输入框 (input) | 带占位符的文本输入 |
| 文本域 (textarea) | 多行文本输入，支持 resize |
| 图片 (image) | 支持 object-fit |
| 链接 (link) | 带 href 和 target 的锚点 |
| 分割线 (divider) | 水平分隔符 |
| 容器 (container) | 用于分组的弹性容器 |
| 行列 (row) | 弹性行布局 |
| 卡片 (card) | 带内边距的卡片容器 |

## API 接口（后端，尚未对接）

### 项目接口
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/projects` | 获取项目列表 |
| GET | `/api/projects/:id` | 获取单个项目 |
| POST | `/api/projects` | 创建项目 |
| PUT | `/api/projects/:id` | 更新项目 |
| DELETE | `/api/projects/:id` | 删除项目 |

### 模板接口
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/templates` | 获取模板列表 |
| GET | `/api/templates/:id` | 获取单个模板 |
| POST | `/api/templates` | 创建模板 |

## License

ISC
