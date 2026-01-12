<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasComponentProps } from '@/types/component'

const props = defineProps<CanvasComponentProps>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'addChild', parentId: string, componentType: string): void
}>()

// 判断是否为容器类型组件
const isContainerType = computed(() => {
  return ['container', 'row', 'card'].includes(props.component.type)
})

// 获取组件标签
function getComponentTag(type: string): string {
  const tags: Record<string, string> = {
    text: 'div',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    image: 'img',
    link: 'a',
    divider: 'div',
    container: 'div',
    row: 'div',
    card: 'div',
  }
  return tags[type] || 'div'
}

// 获取组件样式
function getComponentStyle(): Record<string, string> {
  const s = props.component.styles
  const style: Record<string, string> = {}

  // 布局
  if (s.display) style.display = s.display
  if (s.flexDirection) style.flexDirection = s.flexDirection
  if (s.justifyContent) style.justifyContent = s.justifyContent
  if (s.alignItems) style.alignItems = s.alignItems
  if (s.flexWrap) style.flexWrap = s.flexWrap
  if (s.gap !== undefined) style.gap = `${s.gap}px`

  // 尺寸
  if (s.width) style.width = typeof s.width === 'number' ? `${s.width}px` : s.width
  if (s.maxWidth) style.maxWidth = typeof s.maxWidth === 'number' ? `${s.maxWidth}px` : s.maxWidth
  if (s.height) style.height = typeof s.height === 'number' ? `${s.height}px` : s.height
  if (s.minWidth) style.minWidth = s.minWidth
  if (s.minHeight) style.minHeight = s.minHeight

  // 边距
  if (s.marginTop !== undefined) style.marginTop = `${s.marginTop}px`
  if (s.marginRight !== undefined) style.marginRight = `${s.marginRight}px`
  if (s.marginBottom !== undefined) style.marginBottom = `${s.marginBottom}px`
  if (s.marginLeft !== undefined) style.marginLeft = `${s.marginLeft}px`

  // 内边距
  if (s.paddingTop !== undefined) style.paddingTop = `${s.paddingTop}px`
  if (s.paddingRight !== undefined) style.paddingRight = `${s.paddingRight}px`
  if (s.paddingBottom !== undefined) style.paddingBottom = `${s.paddingBottom}px`
  if (s.paddingLeft !== undefined) style.paddingLeft = `${s.paddingLeft}px`

  // 边框
  if (s.borderWidth !== undefined) style.borderWidth = `${s.borderWidth}px`
  if (s.borderStyle) style.borderStyle = s.borderStyle
  if (s.borderColor) style.borderColor = s.borderColor
  if (s.borderRadius !== undefined) style.borderRadius = `${s.borderRadius}px`

  // 背景
  if (s.backgroundColor) style.backgroundColor = s.backgroundColor

  // 图片
  if (s.objectFit) style.objectFit = s.objectFit

  // 文本域
  if (s.resize) style.resize = s.resize

  // 文字
  if (s.fontSize !== undefined) style.fontSize = `${s.fontSize}px`
  if (s.fontWeight) style.fontWeight = s.fontWeight
  if (s.color) style.color = s.color
  if (s.textAlign) style.textAlign = s.textAlign
  if (s.lineHeight !== undefined) style.lineHeight = String(s.lineHeight)
  if (s.textDecoration) style.textDecoration = s.textDecoration

  // 其他
  if (s.boxShadow) style.boxShadow = s.boxShadow

  return style
}

// 获取组件属性
function getComponentAttrs(): Record<string, any> {
  const p = props.component.props
  const s = props.component.styles
  const attrs: Record<string, any> = {}

  switch (props.component.type) {
    case 'input':
      attrs.type = 'text'
      attrs.placeholder = p.placeholder || ''
      break
    case 'textarea':
      attrs.rows = p.rows || 4
      attrs.placeholder = p.placeholder || ''
      break
    case 'image':
      attrs.src = p.src || ''
      attrs.alt = p.alt || ''
      break
    case 'link':
      attrs.href = p.href || '#'
      attrs.target = p.target || '_self'
      break
  }

  return attrs
}

// 获取组件内容
function getComponentContent(): string | null {
  const p = props.component.props
  switch (props.component.type) {
    case 'text': return p.content || ''
    case 'button': return p.text || ''
    case 'link': return p.text || ''
    default: return null
  }
}

// 是否有子组件
const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0
})

// 选中状态样式
const wrapperStyle = computed(() => {
  if (props.isSelected && !props.isPreview) {
    return { outline: '2px solid #1890ff', outlineOffset: '-1px' }
  }
  return {}
})

// 容器样式类
const containerClasses = computed(() => {
  const classes: string[] = ['group']
  if (isContainerType.value && !props.isPreview) {
    classes.push('min-h-[100px]')
  }
  return classes.join(' ')
})

// 点击处理
function handleClick(e: MouseEvent) {
  e.stopPropagation()
  if (!props.isPreview) {
    emit('select', props.component.id)
    // 链接组件在编辑模式下阻止跳转
    if (props.component.type === 'link') {
      e.preventDefault()
    }
  }
}

// 删除处理
function handleDelete(e: MouseEvent) {
  e.stopPropagation()
  emit('delete', props.component.id)
}

// 拖放处理
function handleDragOver(e: DragEvent) {
  if (isContainerType.value && !props.isPreview) {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }
}

function handleDrop(e: DragEvent) {
  if (isContainerType.value && !props.isPreview) {
    e.preventDefault()
    e.stopPropagation()
    const data = e.dataTransfer?.getData('application/json')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'component') {
          emit('addChild', props.component.id, parsed.componentType)
        }
      } catch (err) {
        console.error('Invalid drop data:', err)
      }
    }
  }
}
</script>

<template>
  <div :style="wrapperStyle" class="group">
    <component
      :is="getComponentTag(component.type)"
      :style="getComponentStyle()"
      v-bind="getComponentAttrs()"
      :class="containerClasses"
      @click="handleClick"
      @dragover="handleDragOver"
      @drop="handleDrop"
    >
      {{ getComponentContent() }}
      <template v-if="hasChildren">
        <RenderCanvasComponent
          v-for="child in (component.children || [])"
          :key="child.id"
          :component="child"
          :is-selected="false"
          :is-preview="isPreview"
          @select="(id) => emit('select', id)"
          @delete="(id) => emit('delete', id)"
          @add-child="(parentId, componentType) => emit('addChild', parentId, componentType)"
        />
      </template>
      <!-- 空容器提示 -->
      <div 
        v-if="isContainerType && !hasChildren && !isPreview"
        class="absolute inset-0 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 pointer-events-none"
      >
        <span class="text-sm">拖拽组件到此</span>
      </div>
    </component>
    <button
      v-if="isSelected && !isPreview"
      class="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
      @click="handleDelete"
    >
      ×
    </button>
  </div>
</template>