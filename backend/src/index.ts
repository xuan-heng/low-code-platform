/**
 * Low Code Platform Backend
 * 
 * 功能：
 * - REST API 服务，提供项目(projects)和模板(templates)的 CRUD 操作
 * - 数据存储：SQLite 数据库 (data/projects.db)
 * 
 * 启动方式：
 * - 开发模式: npm run dev
 * - 生产模式: npm run build && npm start
 * 
 * API 端点：
 * - GET    /api/projects      - 获取项目列表
 * - GET    /api/projects/:id  - 获取单个项目
 * - POST   /api/projects      - 创建项目
 * - PUT    /api/projects/:id  - 更新项目
 * - DELETE /api/projects/:id  - 删除项目
 * - GET    /api/templates     - 获取模板列表
 * - GET    /api/templates/:id - 获取单个模板
 * - POST   /api/templates     - 创建模板
 * 
 * 注意：前端目前未对接此 API，如需使用需修改前端代码调用后端接口
 */

import express from 'express'
import cors from 'cors'
import db from './db'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 项目相关 API
app.get('/api/projects', (req: any, res: any) => {
  try {
    const projects = db
      .prepare('SELECT * FROM projects ORDER BY updated_at DESC')
      .all()
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: '获取项目列表失败' })
  }
})

app.get('/api/projects/:id', (req: any, res: any) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
    if (!project) {
      return res.status(404).json({ error: '项目不存在' })
    }
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: '获取项目失败' })
  }
})

app.post('/api/projects', (req: any, res: any) => {
  try {
    const { name, description, components } = req.body
    if (!name || !components) {
      return res.status(400).json({ error: '缺少必要参数' })
    }
    const result = db
      .prepare(
        'INSERT INTO projects (name, description, components) VALUES (?, ?, ?)'
      )
      .run(name, description || '', JSON.stringify(components))
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(result.lastInsertRowid)
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: '创建项目失败' })
  }
})

app.put('/api/projects/:id', (req: any, res: any) => {
  try {
    const { name, description, components } = req.body as any
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any
    if (!existing) {
      return res.status(404).json({ error: '项目不存在' })
    }
    db.prepare(
      'UPDATE projects SET name = ?, description = ?, components = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      name ?? existing.name,
      description ?? existing.description,
      JSON.stringify(components ?? JSON.parse(existing.components)),
      req.params.id
    )
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' })
  }
})

app.delete('/api/projects/:id', (req: any, res: any) => {
  try {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: '项目不存在' })
    }
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: '删除项目失败' })
  }
})

// 模板相关 API
app.get('/api/templates', (req: any, res: any) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY id').all()
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: '获取模板列表失败' })
  }
})

app.get('/api/templates/:id', (req: any, res: any) => {
  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
    if (!template) {
      return res.status(404).json({ error: '模板不存在' })
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: '获取模板失败' })
  }
})

app.post('/api/templates', (req: any, res: any) => {
  try {
    const { name, description, components, thumbnail } = req.body
    if (!name || !components) {
      return res.status(400).json({ error: '缺少必要参数' })
    }
    const result = db
      .prepare(
        'INSERT INTO templates (name, description, components, thumbnail) VALUES (?, ?, ?, ?)'
      )
      .run(name, description || '', JSON.stringify(components), thumbnail || '')
    const template = db
      .prepare('SELECT * FROM templates WHERE id = ?')
      .get(result.lastInsertRowid)
    res.status(201).json(template)
  } catch (error) {
    res.status(500).json({ error: '创建模板失败' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})