import { ref } from 'vue'
import type { ComponentType } from '@/types/component'

export function useDragDrop() {
  const isDragging = ref(false)
  const dragType = ref<ComponentType | null>(null)

  function startDrag(type: ComponentType) {
    isDragging.value = true
    dragType.value = type
  }

  function endDrag() {
    isDragging.value = false
    dragType.value = null
  }

  function getDragData(): { type: 'component'; componentType: ComponentType } | null {
    if (dragType.value) {
      return { type: 'component', componentType: dragType.value }
    }
    return null
  }

  return {
    isDragging,
    dragType,
    startDrag,
    endDrag,
    getDragData,
  }
}
