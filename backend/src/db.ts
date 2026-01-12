import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '../data/projects.db')
const db = new Database(dbPath)

// 启用外键约束
db.pragma('foreign_keys = ON')

// 创建项目表
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    components TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 创建模板表
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    components TEXT NOT NULL,
    thumbnail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 插入默认模板
const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get() as { count: number }
if (templateCount.count === 0) {
  const defaultTemplates = [
    {
      name: '空白页面',
      description: '一个空白的页面模板',
      components: JSON.stringify([]),
    },
    {
      name: '登录页面',
      description: '包含用户名和密码输入框的登录页面',
      components: JSON.stringify([
        {
          id: 'title-1',
          type: 'text',
          props: {
            content: '欢迎登录',
            fontSize: 'text-2xl',
            fontWeight: 'font-bold',
            color: 'text-gray-900',
          },
        },
        {
          id: 'input-1',
          type: 'input',
          props: {
            placeholder: '请输入用户名',
            type: 'text',
          },
        },
        {
          id: 'input-2',
          type: 'input',
          props: {
            placeholder: '请输入密码',
            type: 'password',
          },
        },
        {
          id: 'button-1',
          type: 'button',
          props: {
            text: '登录',
            variant: 'default',
            size: 'default',
          },
        },
      ]),
    },
  ]

  const insertTemplate = db.prepare(
    'INSERT INTO templates (name, description, components) VALUES (?, ?, ?)'
  )
  const insertMany = db.transaction((templates: any[]) => {
    for (const template of templates) {
      insertTemplate.run(template.name, template.description, template.components)
    }
  })
  insertMany(defaultTemplates)
}

export default db