/**
 * 分类颜色的预设色板。
 *
 * 只提供这几个固定选项，不做自定义取色器——这样不管选哪个，
 * 跟整体"纸感"视觉风格都不会冲突。
 */
export interface CategoryColorPreset {
  key: string
  hex: string
  label: string
}

export const CATEGORY_COLOR_PRESETS: CategoryColorPreset[] = [
  { key: 'red', hex: '#E5484D', label: '红' },
  { key: 'orange', hex: '#F5A524', label: '橙' },
  { key: 'yellow', hex: '#E8C547', label: '黄' },
  { key: 'green', hex: '#2FAE64', label: '绿' },
  { key: 'teal', hex: '#12A594', label: '青' },
  { key: 'blue', hex: '#3B82F6', label: '蓝' },
  { key: 'purple', hex: '#8B5CF6', label: '紫' },
  { key: 'pink', hex: '#EC4899', label: '粉' },
]

// 老分类（这次功能上线前创建的）没有颜色，统一用这个中性灰点兜底显示。
export const DEFAULT_CATEGORY_COLOR_HEX = '#A8A79F'

export function getCategoryColorHex(colorKey?: string | null): string {
  const preset = CATEGORY_COLOR_PRESETS.find((p) => p.key === colorKey)
  return preset?.hex ?? DEFAULT_CATEGORY_COLOR_HEX
}

/** 新建分类时如果没有手动选颜色，按已有分类数量轮流分配一个预设色，而不是每个都一样。 */
export function pickNextCategoryColor(existingCount: number): string {
  return CATEGORY_COLOR_PRESETS[existingCount % CATEGORY_COLOR_PRESETS.length].key
}