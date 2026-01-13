<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import ComponentPanel from './components/ComponentPanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const editorStore = useEditorStore()
const isPreview = ref(false)

// 检查是否有使用的本地图片
const hasUsedLocalImages = computed(() => {
  return editorStore.usedLocalImages.length > 0
})

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

// 获取处理后的HTML内容（将本地图片路径替换为相对路径）
function getProcessedHtml(canvas: HTMLElement): string {
  let content = canvas.innerHTML

  // 如果有本地图片，替换路径为相对路径
  if (hasUsedLocalImages.value) {
    const usedImages = editorStore.usedLocalImages
    for (const image of usedImages) {
      // 替换 data:image 为相对路径
      const escapedId = image.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const dataUrlPattern = new RegExp(image.data.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      content = content.replace(dataUrlPattern, `image/${image.filename}`)
    }
  }

  return content
}

async function handleExport() {
  // 先切换到预览模式再导出，以去除选中状态的 outline
  const wasInPreview = isPreview.value
  if (!wasInPreview) {
    isPreview.value = true
    editorStore.togglePreview()
  }

  // 等待 DOM 更新
  await new Promise(resolve => setTimeout(resolve, 100))

  const canvas = document.querySelector('.bg-white.rounded-lg.shadow-sm') as HTMLElement
  if (!canvas) {
    alert('没有可导出的内容')
    // 恢复原来的预览状态
    if (!wasInPreview) {
      isPreview.value = false
      editorStore.togglePreview()
    }
    return
  }

  // 清理未使用的图片
  editorStore.removeUnusedImages()

  const processedHtml = getProcessedHtml(canvas)

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
    ${processedHtml}
  </div>
</body>
</html>`

  if (hasUsedLocalImages.value) {
    // 导出为文件夹（包含 index.html 和 image 文件夹）
    await exportAsFolder(html)
  } else {
    // 导出为单个 HTML 文件
    exportAsSingleFile(html)
  }

  // 恢复原来的预览状态
  if (!wasInPreview) {
    await new Promise(resolve => setTimeout(resolve, 100))
    isPreview.value = false
    editorStore.togglePreview()
  }
}

// 导出为单个 HTML 文件
function exportAsSingleFile(html: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// 导出为文件夹
async function exportAsFolder(html: string) {
  // 创建 JSZip 类似的结构（使用原生方式）
  const files: Record<string, string | Blob> = {
    'index.html': html,
  }

  // 添加图片文件
  for (const image of editorStore.usedLocalImages) {
    // 将 data URL 转换为 Blob
    const mimeType = image.mimeType
    const base64Data = image.data.split(',')[1]
    const binaryData = atob(base64Data)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    files[`image/${image.filename}`] = new Blob([bytes], { type: mimeType })
  }

  // 使用原生方式创建 ZIP 文件
  const zipBlob = await createZip(files)
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page-${Date.now()}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

// ZIP 文件创建函数
async function createZip(files: Record<string, string | Blob>): Promise<Blob> {
  const parts: Uint8Array[] = []
  const centralDirParts: Uint8Array[] = []
  let offset = 0

  for (const [name, data] of Object.entries(files)) {
    let dataArray: Uint8Array
    if (typeof data === 'string') {
      const encoder = new TextEncoder()
      dataArray = encoder.encode(data)
    } else {
      dataArray = new Uint8Array(await data.arrayBuffer())
    }

    const nameBytes = new TextEncoder().encode(name)
    const size = dataArray.length
    const crc = await crc32(dataArray)

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, 0x04034b50, true) // Signature
    localView.setUint16(4, 20, true) // Version needed (2.0)
    localView.setUint16(6, 0, true) // General purpose bit flag
    localView.setUint16(8, 0, true) // Compression method (store)
    localView.setUint16(10, 0, true) // Last mod file time
    localView.setUint16(12, 0, true) // Last mod file date
    localView.setUint32(14, crc, true) // CRC-32
    localView.setUint32(18, size, true) // Compressed size
    localView.setUint32(22, size, true) // Uncompressed size
    localView.setUint16(26, nameBytes.length, true) // File name length
    localView.setUint16(28, 0, true) // Extra field length
    localHeader.set(nameBytes, 30)

    parts.push(localHeader, dataArray)

    // Central directory entry
    const centralEntry = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(centralEntry.buffer)
    centralView.setUint32(0, 0x02014b50, true) // Signature
    centralView.setUint16(4, 20, true) // Version made by
    centralView.setUint16(6, 20, true) // Version needed
    centralView.setUint16(8, 0, true) // General purpose bit flag
    centralView.setUint16(10, 0, true) // Compression method
    centralView.setUint16(12, 0, true) // Last mod file time
    centralView.setUint16(14, 0, true) // Last mod file date
    centralView.setUint32(16, crc, true) // CRC-32
    centralView.setUint32(20, size, true) // Compressed size
    centralView.setUint32(24, size, true) // Uncompressed size
    centralView.setUint16(28, nameBytes.length, true) // File name length
    centralView.setUint16(30, 0, true) // Extra field length
    centralView.setUint16(32, 0, true) // File comment length
    centralView.setUint16(34, 0, true) // Disk number start
    centralView.setUint16(36, 0, true) // Internal file attributes
    centralView.setUint32(38, 0, true) // External file attributes
    centralView.setUint32(42, offset, true) // Relative offset of local header
    centralEntry.set(nameBytes, 46)

    centralDirParts.push(centralEntry)

    offset += localHeader.length + dataArray.length
  }

  // End of central directory
  const centralDirSize = centralDirParts.reduce((sum, part) => sum + part.length, 0)
  const centralDir = new Uint8Array(centralDirSize)
  let centralOffset = 0
  for (const part of centralDirParts) {
    centralDir.set(part, centralOffset)
    centralOffset += part.length
  }

  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)
  endView.setUint32(0, 0x06054b50, true) // Signature
  endView.setUint16(4, 0, true) // Number of this disk
  endView.setUint16(6, 0, true) // Disk where central directory starts
  endView.setUint16(8, centralDirParts.length, true) // Number of central directory records on this disk
  endView.setUint16(10, centralDirParts.length, true) // Total number of central directory records
  endView.setUint32(12, centralDirSize, true) // Size of central directory
  endView.setUint32(16, offset, true) // Offset of start of central directory
  endView.setUint16(20, 0, true) // Comment length

  // 合并所有部分
  const fileDataSize = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(fileDataSize + centralDirSize + 22)
  let resultOffset = 0
  for (const part of parts) {
    result.set(part, resultOffset)
    resultOffset += part.length
  }
  result.set(centralDir, resultOffset)
  result.set(endRecord, fileDataSize + centralDirSize)

  return new Blob([result], { type: 'application/zip' })
}

// 计算 CRC32
async function crc32(data: Uint8Array): Promise<number> {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }

  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
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
          {{ hasUsedLocalImages ? '导出 ZIP' : '导出 HTML' }}
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
