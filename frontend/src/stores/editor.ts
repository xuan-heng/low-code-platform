import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComponentConfig, ComponentDefinition, ComponentType } from '@/types/component'
import { componentDefinitions } from '@/data/component-definitions'

export const useEditorStore = defineStore('editor', () => {
  // 画布上的组件列表
  const components = ref<ComponentConfig[]>([])
  
  // 当前选中的组件ID
  const selectedId = ref<string | null>(null)
  
  // 是否为预览模式
  const isPreview = ref(false)
  
  // 是否为拖拽中
  const isDragging = ref(false)

  // 获取所有组件定义
  const definitions = computed(() => componentDefinitions)

  // 根据类型获取组件定义
  function getDefinition(type: ComponentType): ComponentDefinition | undefined {
    return definitions.value.find(d => d.type === type)
  }

  // 当前选中的组件
  const selectedComponent = computed(() => {
    if (!selectedId.value) return null
    return findComponent(components.value, selectedId.value)
  })

  // 递归查找组件
  function findComponent(list: ComponentConfig[], id: string): ComponentConfig | null {
    for (const item of list) {
      if (item.id === id) return item
      if (item.children && item.children.length > 0) {
        const found = findComponent(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 递归更新组件
  function updateComponentInList(list: ComponentConfig[], id: string, updates: Partial<ComponentConfig>): boolean {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i] = { ...list[i], ...updates }
        return true
      }
      if (list[i].children && list[i].children.length > 0) {
        if (updateComponentInList(list[i].children!, id, updates)) {
          return true
        }
      }
    }
    return false
  }

  // 递归删除组件
  function deleteComponentFromList(list: ComponentConfig[], id: string): boolean {
    const index = list.findIndex(c => c.id === id)
    if (index !== -1) {
      list.splice(index, 1)
      return true
    }
    for (const item of list) {
      if (item.children && item.children.length > 0) {
        if (deleteComponentFromList(item.children, id)) {
          return true
        }
      }
    }
    return false
  }

  // 添加组件到画布
  function addComponent(type: ComponentType, parentId?: string) {
    const definition = getDefinition(type)
    if (!definition) return

    const newComponent: ComponentConfig = {
      id: generateId(),
      type,
      name: definition.name,
      props: { ...definition.defaultProps },
      styles: { ...definition.defaultStyles },
    }

    if (parentId) {
      const parent = findComponent(components.value, parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newComponent)
      }
    } else {
      components.value.push(newComponent)
    }

    selectedId.value = newComponent.id
    return newComponent
  }

  // 添加子组件（别名方法）
  function addChildComponent(parentId: string, type: ComponentType) {
    return addComponent(type, parentId)
  }

  // 添加组件到指定位置
  function insertComponent(type: ComponentType, index: number) {
    const definition = getDefinition(type)
    if (!definition) return

    const newComponent: ComponentConfig = {
      id: generateId(),
      type,
      name: definition.name,
      props: { ...definition.defaultProps },
      styles: { ...definition.defaultStyles },
    }

    components.value.splice(index, 0, newComponent)
    selectedId.value = newComponent.id
    return newComponent
  }

  // 更新组件
  function updateComponent(id: string, updates: Partial<ComponentConfig>) {
    updateComponentInList(components.value, id, updates)
  }

  // 更新组件样式
  function updateComponentStyle(id: string, styleUpdates: Partial<ComponentConfig['styles']>) {
    const component = findComponent(components.value, id)
    if (component) {
      component.styles = { ...component.styles, ...styleUpdates }
    }
  }

  // 更新组件属性
  function updateComponentProp(id: string, propUpdates: Record<string, any>) {
    const component = findComponent(components.value, id)
    if (component) {
      component.props = { ...component.props, ...propUpdates }
    }
  }

  // 删除组件
  function deleteComponent(id: string) {
    deleteComponentFromList(components.value, id)
    if (selectedId.value === id) {
      selectedId.value = null
    }
  }

  // 选中组件
  function selectComponent(id: string | null) {
    selectedId.value = id
  }

  // 取消选中
  function deselect() {
    selectedId.value = null
  }

  // 清空画布
  function clearCanvas() {
    components.value = []
    selectedId.value = null
  }

  // 切换预览模式
  function togglePreview() {
    isPreview.value = !isPreview.value
    if (isPreview.value) {
      deselect()
    }
  }

  // 生成唯一ID
  function generateId(): string {
    return `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 复制组件
  function duplicateComponent(id: string) {
    const component = findComponent(components.value, id)
    if (!component) return

    const newComponent: ComponentConfig = {
      ...JSON.parse(JSON.stringify(component)),
      id: generateId(),
    }

    // 递归更新子组件ID
    function updateChildIds(comp: ComponentConfig) {
      comp.id = generateId()
      if (comp.children) {
        comp.children.forEach(updateChildIds)
      }
    }
    updateChildIds(newComponent)

    const index = components.value.findIndex(c => c.id === id)
    if (index !== -1) {
      components.value.splice(index + 1, 0, newComponent)
      selectedId.value = newComponent.id
    }
  }

  // 上移组件
  function moveUp(id: string) {
    const index = components.value.findIndex(c => c.id === id)
    if (index > 0) {
      const temp = components.value[index - 1]
      components.value[index - 1] = components.value[index]
      components.value[index] = temp
    }
  }

  // 下移组件
  function moveDown(id: string) {
    const index = components.value.findIndex(c => c.id === id)
    if (index < components.value.length - 1) {
      const temp = components.value[index + 1]
      components.value[index + 1] = components.value[index]
      components.value[index] = temp
    }
  }

  return {
    // 状态
    components,
    selectedId,
    isPreview,
    isDragging,
    
    // 计算属性
    definitions,
    selectedComponent,
    
    // 方法
    getDefinition,
    addComponent,
    addChildComponent,
    insertComponent,
    updateComponent,
    updateComponentStyle,
    updateComponentProp,
    deleteComponent,
    selectComponent,
    deselect,
    clearCanvas,
    togglePreview,
    duplicateComponent,
    moveUp,
    moveDown,
  }
})
