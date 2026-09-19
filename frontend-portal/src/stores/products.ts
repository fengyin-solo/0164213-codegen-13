import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IndustryDeliveryStats, ProductItem } from '@/types'

/** 完成测试验收、进入上线运维的阶段标识，交付成效看板仅统计该阶段的项目 */
const LIVE_STAGE = '上线运维'

export interface CategoryOption {
  label: string
  value: string
  icon: string
}

export const useProductsStore = defineStore('products', () => {
  /**
   * 当前选中的产品分类（行业），'' 表示全部
   * 状态保存在 store 中，看板与产品列表联动，跳转案例页后返回仍停留在已选行业
   */
  const activeCategory = ref('')

  const categories: CategoryOption[] = [
    { label: '全部服务', value: '', icon: '📦' },
    { label: '网站建设', value: '网站建设', icon: '🖥️' },
    { label: '电商服务', value: '电商服务', icon: '🛒' },
    { label: '移动开发', value: '移动开发', icon: '📱' },
    { label: '咨询服务', value: '咨询服务', icon: '💼' }
  ]

  /**
   * 产品列表（每个产品对应一个已交付项目）
   * 看板与产品列表共用同一数据源，保证看板中的项目数量与列表实际展示数量一致
   */
  const products = ref<ProductItem[]>([
    {
      id: 1,
      name: '企业官网建设',
      description: '专业的企业官网设计与开发，打造品牌数字形象，提升企业影响力',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      features: ['响应式设计', 'SEO优化', '后台管理系统', '多语言支持', '安全防护'],
      category: '网站建设',
      delivery: { stage: '上线运维', cycleWeeks: 8, satisfaction: 98 }
    },
    {
      id: 2,
      name: '品牌展示网站',
      description: '高端品牌展示网站，突出品牌特色，传递品牌价值',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
      features: ['创意设计', '动效交互', '品牌定制', '视觉冲击'],
      category: '网站建设',
      delivery: { stage: '上线运维', cycleWeeks: 6, satisfaction: 96 }
    },
    {
      id: 3,
      name: 'B2C电商平台',
      description: '全功能B2C电商平台解决方案，助力线上业务快速增长',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      features: ['商品管理', '订单系统', '支付集成', '营销工具', '数据分析'],
      category: '电商服务',
      delivery: { stage: '上线运维', cycleWeeks: 12, satisfaction: 95 }
    },
    {
      id: 4,
      name: 'B2B批发平台',
      description: '专业的B2B批发交易平台，连接供应商与采购商',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
      features: ['批量采购', '询价系统', '供应链管理', '账期结算'],
      category: '电商服务',
      delivery: { stage: '上线运维', cycleWeeks: 14, satisfaction: null }
    },
    {
      id: 5,
      name: 'iOS应用开发',
      description: '原生iOS应用开发，提供流畅的用户体验',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
      features: ['原生开发', 'Swift/SwiftUI', '性能优化', 'App Store上架'],
      category: '移动开发',
      delivery: { stage: '上线运维', cycleWeeks: 10, satisfaction: 94 }
    },
    {
      id: 6,
      name: 'Android应用开发',
      description: '专业Android应用开发，覆盖主流设备',
      image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&h=400&fit=crop',
      features: ['原生开发', 'Kotlin', '多设备适配', '应用商店上架'],
      category: '移动开发',
      delivery: { stage: '上线运维', cycleWeeks: 9, satisfaction: 96 }
    },
    {
      id: 7,
      name: '数字化转型咨询',
      description: '为企业提供全面的数字化转型战略规划与实施指导',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
      features: ['战略规划', '流程优化', '技术选型', '实施指导'],
      category: '咨询服务',
      delivery: { stage: '上线运维', cycleWeeks: 4, satisfaction: 97 }
    },
    {
      id: 8,
      name: 'IT架构咨询',
      description: '专业的IT架构设计与优化咨询服务',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
      features: ['架构评估', '方案设计', '技术选型', '性能优化'],
      category: '咨询服务',
      delivery: { stage: '上线运维', cycleWeeks: 5, satisfaction: 93 }
    }
  ])

  const setActiveCategory = (value: string) => {
    activeCategory.value = value
  }

  /** 已上线运维的项目（完成测试验收） */
  const liveProjects = computed(() => products.value.filter(p => p.delivery?.stage === LIVE_STAGE))

  /** 汇总指定行业的交付数据，industry 为 '' 时返回全部行业合计 */
  const statsFor = (industry: string): IndustryDeliveryStats => {
    const list = liveProjects.value.filter(p => !industry || p.category === industry)
    const cycles = list.map(p => p.delivery!.cycleWeeks)
    // 缺少满意度数据的项目不计入平均分
    const satisfactions = list
      .map(p => p.delivery!.satisfaction)
      .filter((s): s is number => typeof s === 'number')
    const average = (nums: number[]) =>
      nums.length ? nums.reduce((sum, n) => sum + n, 0) / nums.length : null

    return {
      industry,
      projectCount: list.length,
      avgCycleWeeks: average(cycles),
      avgSatisfaction: average(satisfactions),
      satisfactionSampleCount: satisfactions.length,
      satisfactionExcludedCount: list.length - satisfactions.length
    }
  }

  /** 各行业交付统计 */
  const industryStats = computed<IndustryDeliveryStats[]>(() =>
    categories.filter(c => c.value).map(c => statsFor(c.value))
  )

  /** 全部行业合计 */
  const totalStats = computed<IndustryDeliveryStats>(() => statsFor(''))

  return {
    activeCategory,
    categories,
    products,
    liveProjects,
    industryStats,
    totalStats,
    statsFor,
    setActiveCategory
  }
})
