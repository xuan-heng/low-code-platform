# AI 开发助手文档

本文档为 AI 模型提供项目理解与开发的参考指南。

## 项目概览

**WeavePage** - 一个低代码拖拽式页面构建平台，采用前后端分离架构。

- 前端：Vue 3 + TypeScript + TailwindCSS（端口 5173）
- 后端：Express + TypeScript + SQLite（端口 3001）
- 状态管理：Pinia
- 构建工具：Vite

## 核心文件索引

### 后端

| 文件 | 作用 |
|-----|------|
| `backend/src/db.ts` | SQLite 数据库初始化、默认模板数据初始化 |
| `backend/src/index.ts` | Express 服务器、RESTful API 路由 |

### 前端

| 文件 | 作用 |
|-----|------|
| `frontend/src/types/component.ts` | 组件配置类型定义、组件定义列表 |
| `frontend/src/stores/canvas.ts` | 画布状态管理（组件增删改、选中状态） |
| `frontend/src/stores/project.ts` | 项目/模板状态管理（CRUD 操作） |
| `frontend/src/App.vue` | 主布局、组件拖拽、HTML 导出 |
| `frontend/src/components/Canvas.vue` | 画布渲染区域 |
| `frontend/src/components/ComponentPanel.vue` | 左侧组件面板 |
| `frontend/src/components/PropertyPanel.vue` | 右侧属性编辑面板 |

## 核心数据结构

### ComponentConfig（组件配置）

```typescript
interface ComponentConfig {
  id: string           // 唯一标识
  type: string         // 组件类型 (button/input/text/container)
  props: Record<string, any>  // 组件属性
  children?: ComponentConfig[]  // 子组件（嵌套）
  styles?: Record<string, string>  // 样式
}
```

### 当前支持的组件类型

| type 值 | 组件 | 关键 props |
|--------|------|-----------|
| `button` | 按钮 | text, variant, size |
| `input` | 输入框 | placeholder, type, value |
| `text` | 文本 | content, fontSize, fontWeight, color |
| `container` | 容器 | padding, backgroundColor, borderRadius |

## 数据流

```
[ComponentPanel] --拖拽--> [App.vue] --addComponent--> [CanvasStore]
                                              |
                                              v
[Canvas] <--渲染组件-- [CanvasStore.components]
                                              |
                                              v
[PropertyPanel] <--selectedComponent-- [CanvasStore]
      |                                        |
      v                                        v
[updateComponent] --------------------> [CanvasStore]
```

## API 接口规范

### 项目 API

```
GET    /api/projects          -> 返回项目列表
GET    /api/projects/:id      -> 返回单个项目
POST   /api/projects          -> 创建项目 (body: {name, description, components})
PUT    /api/projects/:id      -> 更新项目
DELETE /api/projects/:id      -> 删除项目
```

### 模板 API

```
GET    /api/templates         -> 返回模板列表
GET    /api/templates/:id     -> 返回单个模板
POST   /api/templates         -> 创建模板
```

**数据格式**：`components` 字段以 JSON 字符串形式存储。

## 关键代码位置

### 添加新组件类型

1. **`frontend/src/types/component.ts`**
   - 在 `componentDefinitions` 数组中添加定义
   - 定义 `defaultProps` 和 `defaultPropsSchema`

2. **`frontend/src/App.vue`**
   - 在 `generateComponentHTML` 方法中添加 HTML 生成逻辑

3. **`frontend/src/components/Canvas.vue`**（如需特殊渲染）
   - 添加组件渲染 case

### 修改样式系统

- TailwindCSS 类名直接存储在 `props` 中
- 导出时通过 `generateComponentHTML` 转换为 HTML

### 数据库操作

- 使用 `better-sqlite3` 同步 API
- 位于 `backend/src/db.ts`
- 修改后需重启后端服务

## 开发注意事项

1. **组件 ID**：使用 `crypto.randomUUID()` 或 `Date.now().toString()` 生成唯一 ID
2. **Props 更新**：通过 `canvasStore.updateComponent(id, updates)` 更新
3. **删除组件**：通过 `props._delete = true` 触发删除
4. **API 错误处理**：后端返回 `{ error: string }`，前端需处理 400/404/500 错误
5. **CORS**：后端已配置 CORS，支持前端跨域请求

## 代码风格

- TypeScript 严格模式
- Vue 3 组合式 API (`<script setup>`)
- TailwindCSS 原子化类名
- Pinia 组合式 Store 定义

## 常见任务

### 添加图片组件
1. 在 `component.ts` 添加 `image` 类型定义
2. 在 `App.vue` 添加 `<img>` 标签生成逻辑
3. 在 `PropertyPanel.vue` 添加图片上传/URL 输入

### 添加表单验证
1. 在 `project.ts` 添加验证逻辑
2. 在 `ProjectDialog.vue` 显示验证错误

### 添加用户系统
1. 创建 `users` 表
2. 添加 `/api/auth/*` 路由
3. 实现 JWT 鉴权中间件
