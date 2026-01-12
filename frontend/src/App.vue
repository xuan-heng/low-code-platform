<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import ComponentPanel from './components/ComponentPanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const editorStore = useEditorStore()
const isPreview = ref(false)

function togglePreview() {
  isPreview.value = !isPreview.value
  editorStore.togglePreview()
}

function handleClear() {
  if (editorStore.components.length > 0) {
    if (confirm('确定要清空画布吗？此操作不可撤销。')) {
      editorStore.clearCanvas()
    }
  }
}

function handleExport() {
  const canvas = document.querySelector('.bg-white.rounded-lg.shadow-sm') as HTMLElement
  if (!canvas) {
    alert('没有可导出的内容')
    return
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面导出</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { min-height: 100vh; background: #f9fafb; }
    .export-container { max-width: 1024px; margin: 0 auto; padding: 24px; }
  </style>
</head>
<body>
  <div class="export-container">
    ${canvas.innerHTML}
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <header class="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold text-gray-800">Low Code Platform</h1>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          @click="handleClear"
        >
          清空画布
        </button>
        <button
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isPreview ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'"
          @click="togglePreview"
        >
          {{ isPreview ? '编辑模式' : '预览模式' }}
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          @click="handleExport"
        >
          导出 HTML
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧组件面板 -->
      <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <ComponentPanel />
      </aside>

      <!-- 中间画布区域 -->
      <main class="flex-1 overflow-hidden">
        <CanvasArea />
      </main>

      <!-- 右侧属性面板 -->
      <aside class="w-80 bg-white border-l border-gray-200 flex-shrink-0">
        <PropertyPanel />
      </aside>
    </div>
  </div>
</template>
