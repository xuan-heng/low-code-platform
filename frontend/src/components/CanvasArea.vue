<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import RenderCanvasComponent from './RenderCanvasComponent.vue'

const editorStore = useEditorStore()

const components = computed(() => editorStore.components)
const isPreview = computed(() => editorStore.isPreview)
const selectedId = computed(() => editorStore.selectedId)

function handleDrop(event: DragEvent) {
  event.preventDefault()
  
  const data = event.dataTransfer?.getData('application/json')
  if (!data) return
  
  try {
    const parsed = JSON.parse(data)
    if (parsed.type === 'component') {
      editorStore.addComponent(parsed.componentType)
    }
  } catch (e) {
    console.error('Invalid drop data:', e)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleCanvasClick() {
  editorStore.deselect()
}

function handleSelect(id: string) {
  editorStore.selectComponent(id)
}

function handleDelete(id: string) {
  editorStore.deleteComponent(id)
}

function handleAddChild(parentId: string, componentType: string) {
  editorStore.addChildComponent(parentId, componentType)
}

function handleKeydown(event: KeyboardEvent) {
  // Delete key to delete selected component
  if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId.value) {
    event.preventDefault()
    editorStore.deleteComponent(selectedId.value)
  }
}
</script>

<template>
  <div 
    class="flex-1 h-full overflow-auto bg-gray-100"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div
      class="min-h-full p-8"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @click="handleCanvasClick"
    >
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm min-h-[800px] p-8">
        <!-- 空状态 -->
        <div 
          v-if="components.length === 0" 
          class="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
        >
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p class="text-gray-400 text-lg">从左侧拖拽组件到此处</p>
          <p class="text-gray-300 text-sm mt-2">或点击下方按钮添加组件</p>
        </div>

        <!-- 组件列表 -->
        <div v-else class="space-y-2">
          <RenderCanvasComponent
            v-for="component in components"
            :key="component.id"
            :component="component"
            :is-selected="selectedId === component.id"
            :is-preview="isPreview"
            @select="handleSelect"
            @delete="handleDelete"
            @add-child="handleAddChild"
          />
        </div>
      </div>
    </div>
  </div>
</template>
