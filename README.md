# Low Code Platform

一个基于 Vue 3 + Express 的低代码拖拽式页面构建平台。

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
        │   ├── Canvas.vue           # 画布区域
        │   ├── CanvasComponent.vue  # 画布中的组件
        │   ├── ComponentPanel.vue   # 左侧组件面板
        │   ├── PropertyPanel.vue    # 右侧属性面板
        │   ├── ProjectDialog.vue    # 项目保存对话框
        │   └── TemplatePanel.vue    # 模板选择面板
        ├── stores/         # Pinia 状态管理
        │   ├── canvas.ts   # 画布状态
        │   └── project.ts  # 项目/模板状态
        └── types/
            └── component.ts  # 组件类型定义
```

## 技术栈

### 后端
- **Express.js** - Web 框架
- **better-sqlite3** - SQLite 数据库
- **TypeScript** - 类型安全

### 前端
- **Vue 3** - 前端框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **TailwindCSS** - 原子化 CSS
- **Pinia** - 状态管理
- **VueUse** - 组合式工具库

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动服务

**终端 1 - 启动后端**
```bash
cd backend
npm run dev
```
后端服务运行在 `http://localhost:3001`

**终端 2 - 启动前端**
```bash
cd frontend
npm run dev
```
前端应用运行在 `http://localhost:5173`

## 功能特性

### 组件面板
支持以下组件：
| 组件类型 | 说明 |
|---------|------|
| 按钮 (button) | 可配置变体、尺寸、文本 |
| 输入框 (input) | 支持多种类型（文本、密码、邮箱、数字） |
| 文本 (text) | 可配置内容、字号、字重、颜色 |
| 容器 (container) | 可配置内边距、背景色、圆角、对齐方式 |

### 操作功能
- **拖拽组件**：从左侧面板拖拽组件到画布
- **选择组件**：点击画布中的组件进行选中
- **编辑属性**：在右侧面板修改选中组件的属性
- **删除组件**：在属性面板中删除选中的组件
- **新建项目**：清空画布创建新项目
- **使用模板**：从预设模板快速开始
- **保存项目**：保存当前项目到数据库
- **导出 HTML**：将画布内容导出为 HTML 文件

## API 接口

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

## 开发说明

### 添加新组件

1. 在 `frontend/src/types/component.ts` 的 `componentDefinitions` 数组中添加组件定义
2. 在 `App.vue` 的 `generateComponentHTML` 方法中添加对应的 HTML 生成逻辑
3. 在 `Canvas.vue` 中添加组件的渲染逻辑

### 数据库结构

**projects 表**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 项目名称 |
| description | TEXT | 项目描述 |
| components | TEXT | 组件配置 JSON |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**templates 表**
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 模板名称 |
| description | TEXT | 模板描述 |
| components | TEXT | 组件配置 JSON |
| thumbnail | TEXT | 缩略图路径 |

## 构建部署

```bash
# 前端构建
cd frontend
npm run build

# 后端构建
cd backend
npm run build

# 启动生产版本
cd backend
npm start
```

## License

ISC
