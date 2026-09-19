import type { ProductItem } from '@/types'

// 产品服务分类（与看板行业口径一致）
export interface ProductCategory {
  label: string
  value: string
  icon: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { label: '全部服务', value: '', icon: '📦' },
  { label: '网站建设', value: '网站建设', icon: '🖥️' },
  { label: '电商服务', value: '电商服务', icon: '🛒' },
  { label: '移动开发', value: '移动开发', icon: '📱' },
  { label: '咨询服务', value: '咨询服务', icon: '💼' }
]

// 看板中参与汇总的行业（即四类服务，不含「全部服务」）
export const BOARD_INDUSTRIES: ProductCategory[] = PRODUCT_CATEGORIES.filter(c => c.value !== '')

/**
 * 产品 / 交付项目列表。
 * deliveryStatus 为「已上线运维」的项目视为已完成测试验收并上线，
 * 看板与「仅看上线项目」的产品列表均以该口径统计，保证数量一致。
 * satisfaction 为 null/undefined 表示暂无满意度数据，不计入平均分。
 */
export const products: ProductItem[] = [
  {
    id: 1,
    name: '企业官网建设',
    description: '专业的企业官网设计与开发，打造品牌数字形象，提升企业影响力',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    features: ['响应式设计', 'SEO优化', '后台管理系统', '多语言支持', '安全防护'],
    category: '网站建设',
    deliveryStatus: '已上线运维',
    deliveryDays: 45,
    satisfaction: 96
  },
  {
    id: 2,
    name: '品牌展示网站',
    description: '高端品牌展示网站，突出品牌特色，传递品牌价值',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
    features: ['创意设计', '动效交互', '品牌定制', '视觉冲击'],
    category: '网站建设',
    deliveryStatus: '已上线运维',
    deliveryDays: 38,
    // 客户尚未回访问卷，暂无满意度数据
    satisfaction: null
  },
  {
    id: 3,
    name: 'B2C电商平台',
    description: '全功能B2C电商平台解决方案，助力线上业务快速增长',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    features: ['商品管理', '订单系统', '支付集成', '营销工具', '数据分析'],
    category: '电商服务',
    deliveryStatus: '已上线运维',
    deliveryDays: 62,
    satisfaction: 94
  },
  {
    id: 4,
    name: 'B2B批发平台',
    description: '专业的B2B批发交易平台，连接供应商与采购商',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
    features: ['批量采购', '询价系统', '供应链管理', '账期结算'],
    category: '电商服务',
    deliveryStatus: '已上线运维',
    deliveryDays: 75,
    satisfaction: 92
  },
  {
    id: 5,
    name: 'iOS应用开发',
    description: '原生iOS应用开发，提供流畅的用户体验',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
    features: ['原生开发', 'Swift/SwiftUI', '性能优化', 'App Store上架'],
    category: '移动开发',
    deliveryStatus: '已上线运维',
    deliveryDays: 55,
    satisfaction: 97
  },
  {
    id: 6,
    name: 'Android应用开发',
    description: '专业Android应用开发，覆盖主流设备',
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&h=400&fit=crop',
    features: ['原生开发', 'Kotlin', '多设备适配', '应用商店上架'],
    category: '移动开发',
    deliveryStatus: '已上线运维',
    deliveryDays: 52,
    // 新版本上线后将补发满意度回访，暂无数据
    satisfaction: null
  },
  {
    id: 7,
    name: '数字化转型咨询',
    description: '为企业提供全面的数字化转型战略规划与实施指导',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
    features: ['战略规划', '流程优化', '技术选型', '实施指导'],
    category: '咨询服务',
    deliveryStatus: '开发中'
  },
  {
    id: 8,
    name: 'IT架构咨询',
    description: '专业的IT架构设计与优化咨询服务',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    features: ['架构评估', '方案设计', '技术选型', '性能优化'],
    category: '咨询服务',
    deliveryStatus: '测试验收中'
  }
]

// 已完成测试验收、进入上线运维阶段的项目
export const deliveredProducts = (): ProductItem[] =>
  products.filter(p => p.deliveryStatus === '已上线运维')
