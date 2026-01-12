// 组件类型定义
export type ComponentType = 
  | 'text'
  | 'button'
  | 'input'
  | 'textarea'
  | 'image'
  | 'container'
  | 'row'
  | 'divider'
  | 'card'
  | 'link'

// 基础组件配置
export interface ComponentConfig {
  id: string
  type: ComponentType
  name: string
  props: Record<string, any>
  styles: ComponentStyles
  children?: ComponentConfig[]
}

// 样式配置
export interface ComponentStyles {
  // 布局
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  flexWrap?: string
  gap?: number
  
  // 尺寸
  width?: string
  height?: string
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
  
  // 边距
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  
  // 边框
  borderWidth?: number
  borderStyle?: string
  borderColor?: string
  borderRadius?: number
  
  // 背景
  backgroundColor?: string
  backgroundImage?: string
  
  // 文字
  fontSize?: number
  fontWeight?: string
  color?: string
  textAlign?: string
  lineHeight?: number
  
  // 其他
  opacity?: number
  boxShadow?: string
  overflow?: string
}

// 组件定义
export interface ComponentDefinition {
  type: ComponentType
  name: string
  icon: string
  category: 'basic' | 'layout' | 'advanced'
  defaultProps: Record<string, any>
  defaultStyles: ComponentStyles
  propSchema: PropSchema[]
  styleSchema: StyleSchema[]
}

// 属性模式
export interface PropSchema {
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea'
  default?: any
  options?: { label: string; value: string }[]
  min?: number
  max?: number
}

// 样式模式
export interface StyleSchema {
  name: string
  label: string
  category: 'layout' | 'size' | 'margin' | 'border' | 'background' | 'typography' | 'other'
  type: 'number' | 'select' | 'text' | 'color'
  unit?: string
  options?: { label: string; value: string }[]
  min?: number
  max?: number
}

// 拖拽数据
export interface DragData {
  type: 'component'
  componentType: ComponentType
}

// 画布组件 Props
export interface CanvasComponentProps {
  component: ComponentConfig
  isSelected: boolean
  isPreview?: boolean
}
