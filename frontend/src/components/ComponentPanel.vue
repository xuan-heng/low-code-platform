<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useDragDrop } from '@/composables/useDragDrop'

const editorStore = useEditorStore()
const { startDrag, endDrag } = useDragDrop()

const definitions = computed(() => editorStore.definitions)

const categories = [
  { key: 'basic', label: '基础组件', icon: 'Grid3X3' },
  { key: 'layout', label: '布局组件', icon: 'Layout' },
]

function getComponentsByCategory(category: 'basic' | 'layout' | 'advanced') {
  return definitions.value.filter(d => d.category === category)
}

function handleDragStart(type: string, event: DragEvent) {
  startDrag(type as any)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'component', componentType: type }))
  }
}

function handleDragEnd() {
  endDrag()
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-sm font-medium text-gray-900">组件面板</h2>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div v-for="category in categories" :key="category.key">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {{ category.label }}
        </h3>
        
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="def in getComponentsByCategory(category.key as any)"
            :key="def.type"
            class="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            draggable="true"
            @dragstart="handleDragStart(def.type, $event)"
            @dragend="handleDragEnd"
          >
            <!-- 图标 -->
            <div class="w-8 h-8 mb-2 flex items-center justify-center text-gray-500 group-hover:text-blue-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="def.icon === 'Grid3X3' ? 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' :
                  def.icon === 'Layout' ? 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' :
                  def.icon === 'Box' ? 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' :
                  def.icon === 'Columns' ? 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4' :
                  def.icon === 'CreditCard' ? 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' :
                  def.icon === 'Type' ? 'M4 6h16M4 12h16M4 18h12' :
                  def.icon === 'Square' ? 'M4 6h16v12H4z' :
                  def.icon === 'Input' ? 'M4 6h16v12H4z M9 9h6' :
                  def.icon === 'AlignLeft' ? 'M4 6h16M4 12h10M4 18h14' :
                  def.icon === 'Image' ? 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' :
                  def.icon === 'Link' ? 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' :
                  def.icon === 'Minus' ? 'M20 12H4' :
                  'M12 4v16m8-8H4'">
                </path>
              </svg>
            </div>
            
            <span class="text-xs text-gray-600 group-hover:text-blue-600">{{ def.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
