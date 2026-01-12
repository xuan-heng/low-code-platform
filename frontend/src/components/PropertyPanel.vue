<script setup lang="ts">
import { computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { ComponentConfig, StyleSchema, PropSchema } from '@/types/component'

const editorStore = useEditorStore()

const selectedComponent = computed(() => editorStore.selectedComponent)
const definition = computed(() => {
  if (!selectedComponent.value) return null
  return editorStore.getDefinition(selectedComponent.value.type)
})

// 分类显示样式属性
const styleGroups = computed(() => {
  if (!definition.value || !definition.value.styleSchema) return {}
  
  const groups: Record<string, StyleSchema[]> = {
    layout: [],
    size: [],
    margin: [],
    border: [],
    background: [],
    typography: [],
    other: [],
  }
  
  for (const schema of definition.value.styleSchema) {
    if (groups[schema.category]) {
      groups[schema.category].push(schema)
    }
  }
  
  return groups
})

// 监听组件变化，重置表单
watch(() => selectedComponent.value?.id, () => {
  // 当选中组件变化时，触发响应式更新
})

function updateStyle(name: string, value: any) {
  if (!selectedComponent.value) return
  const numValue = typeof value === 'string' && /^\d+$/.test(value) ? parseInt(value) : value
  editorStore.updateComponentStyle(selectedComponent.value.id, { [name]: numValue })
}

function updateProp(name: string, value: any) {
  if (!selectedComponent.value) return
  editorStore.updateComponentProp(selectedComponent.value.id, { [name]: value })
}

function handleDelete() {
  if (selectedComponent.value) {
    editorStore.deleteComponent(selectedComponent.value.id)
  }
}

function handleDuplicate() {
  if (selectedComponent.value) {
    editorStore.duplicateComponent(selectedComponent.value.id)
  }
}

function handleMoveUp() {
  if (selectedComponent.value) {
    editorStore.moveUp(selectedComponent.value.id)
  }
}

function handleMoveDown() {
  if (selectedComponent.value) {
    editorStore.moveDown(selectedComponent.value.id)
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 头部 -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-sm font-medium text-gray-900">属性面板</h2>
      <div v-if="selectedComponent" class="flex items-center gap-1">
        <button
          v-if="selectedComponent"
          class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="上移"
          @click="handleMoveUp"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          v-if="selectedComponent"
          class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="下移"
          @click="handleMoveDown"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          v-if="selectedComponent"
          class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="复制"
          @click="handleDuplicate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          v-if="selectedComponent"
          class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="删除"
          @click="handleDelete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 未选中组件 -->
      <div v-if="!selectedComponent" class="p-8 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p class="text-sm">请选择一个组件</p>
      </div>

      <!-- 选中组件 -->
      <div v-else class="p-4 space-y-6">
        <!-- 组件信息 -->
        <div class="pb-3 border-b border-gray-100">
          <div class="text-sm font-medium text-gray-900">{{ definition?.name }}</div>
          <div class="text-xs text-gray-400 mt-1 font-mono">{{ selectedComponent.id }}</div>
        </div>

        <!-- 属性编辑 -->
        <div v-if="definition && definition.propSchema && definition.propSchema.length > 0">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">属性</h3>
          <div class="space-y-3">
            <div v-for="schema in definition.propSchema" :key="schema.name" class="space-y-1">
              <label class="block text-xs text-gray-600">{{ schema.label }}</label>
              
              <!-- 文本输入 -->
              <input
                v-if="schema.type === 'text'"
                type="text"
                :value="selectedComponent.props[schema.name] ?? schema.default"
                @input="updateProp(schema.name, ($event.target as HTMLInputElement).value)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              
              <!-- 数字输入 -->
              <input
                v-else-if="schema.type === 'number'"
                type="number"
                :value="selectedComponent.props[schema.name] ?? schema.default"
                :min="schema.min"
                :max="schema.max"
                @input="updateProp(schema.name, Number(($event.target as HTMLInputElement).value))"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              
              <!-- 文本域 -->
              <textarea
                v-else-if="schema.type === 'textarea'"
                :value="selectedComponent.props[schema.name] ?? schema.default"
                @input="updateProp(schema.name, ($event.target as HTMLTextAreaElement).value)"
                rows="3"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              
              <!-- 下拉选择 -->
              <select
                v-else-if="schema.type === 'select'"
                :value="selectedComponent.props[schema.name] ?? schema.default"
                @change="updateProp(schema.name, ($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option v-for="opt in schema.options" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 样式编辑 - 按分类显示 -->
        <div v-for="(schemas, group) in styleGroups" :key="group">
          <template v-if="schemas.length > 0">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {{ getGroupLabel(group) }}
            </h3>
            <div class="space-y-3">
              <div v-for="schema in schemas" :key="schema.name" class="space-y-1">
                <label class="block text-xs text-gray-600">
                  {{ schema.label }}
                  <span v-if="schema.unit" class="text-gray-400 ml-1">{{ schema.unit }}</span>
                </label>
                
                <!-- 数字输入 -->
                <input
                  v-if="schema.type === 'number'"
                  type="number"
                  :value="selectedComponent.styles[schema.name as keyof typeof selectedComponent.styles] ?? getDefaultStyleValue(schema.name, definition.defaultStyles)"
                  :min="schema.min"
                  :max="schema.max"
                  @input="updateStyle(schema.name, ($event.target as HTMLInputElement).value)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                <!-- 下拉选择 -->
                <select
                  v-else-if="schema.type === 'select'"
                  :value="selectedComponent.styles[schema.name as keyof typeof selectedComponent.styles] ?? getDefaultStyleValue(schema.name, definition.defaultStyles)"
                  @change="updateStyle(schema.name, ($event.target as HTMLSelectElement).value)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option v-for="opt in schema.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                
                <!-- 文本输入 -->
                <input
                  v-else-if="schema.type === 'text'"
                  type="text"
                  :value="selectedComponent.styles[schema.name as keyof typeof selectedComponent.styles] ?? getDefaultStyleValue(schema.name, definition.defaultStyles)"
                  @input="updateStyle(schema.name, ($event.target as HTMLInputElement).value)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                <!-- 颜色选择 -->
                <div v-else-if="schema.type === 'color'" class="flex items-center gap-2">
                  <input
                    type="color"
                    :value="selectedComponent.styles[schema.name] ?? (getDefaultStyleValue(schema.name, definition.defaultStyles) || '#000000')"
                    @input="updateStyle(schema.name, ($event.target as HTMLInputElement).value)"
                    class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    :value="selectedComponent.styles[schema.name] ?? getDefaultStyleValue(schema.name, definition.defaultStyles)"
                    @input="updateStyle(schema.name, ($event.target as HTMLInputElement).value)"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function getGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    layout: '布局',
    size: '尺寸',
    margin: '边距',
    border: '边框',
    background: '背景',
    typography: '文字',
    other: '其他',
  }
  return labels[group] || group
}

function getDefaultStyleValue(name: string, defaultStyles: Record<string, any>): any {
  if (!defaultStyles) return undefined
  return defaultStyles[name]
}

export default {
  methods: {
    getGroupLabel,
    getDefaultStyleValue,
  },
}
</script>
