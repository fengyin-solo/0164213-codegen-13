import type { ProductItem } from '@/types'
import { BOARD_INDUSTRIES, deliveredProducts } from './products'

// 单个行业（或合计）的交付成效指标
export interface DeliveryStat {
  value: string // 行业标识，'' 表示合计
  label: string
  icon: string
  projectCount: number // 已上线运维项目数
  avgDeliveryDays: number | null // 平均交付周期（天）
  avgSatisfaction: number | null // 平均客户满意度（百分制）
  ratedCount: number // 计入满意度平均分的项目条数
  excludedSatisfaction: number // 缺少满意度数据、被排除的条数
  isEmpty: boolean // 是否没有任何已完成测试验收的项目
}

const round1 = (n: number) => Math.round(n * 10) / 10

const average = (nums: number[]) =>
  nums.length ? round1(nums.reduce((sum, n) => sum + n, 0) / nums.length) : null

// 按行业聚合已上线运维项目
export const buildIndustryStats = (): DeliveryStat[] => {
  const delivered = deliveredProducts()

  return BOARD_INDUSTRIES.map(industry => {
    const items = delivered.filter(p => p.category === industry.value)
    const rated = items.filter(p => typeof p.satisfaction === 'number')
    const withDays = items.filter(p => typeof p.deliveryDays === 'number')

    return {
      value: industry.value,
      label: industry.label,
      icon: industry.icon,
      projectCount: items.length,
      avgDeliveryDays: average(withDays.map(p => p.deliveryDays as number)),
      avgSatisfaction: average(rated.map(p => p.satisfaction as number)),
      ratedCount: rated.length,
      excludedSatisfaction: items.length - rated.length,
      isEmpty: items.length === 0
    }
  })
}

// 全部行业合计
export const buildTotalStat = (stats: DeliveryStat[]): DeliveryStat => {
  const delivered = deliveredProducts()
  const rated = delivered.filter(p => typeof p.satisfaction === 'number')
  const withDays = delivered.filter(p => typeof p.deliveryDays === 'number')

  return {
    value: '',
    label: '全部行业',
    icon: '🏢',
    projectCount: stats.reduce((sum, s) => sum + s.projectCount, 0),
    avgDeliveryDays: average(withDays.map(p => p.deliveryDays as number)),
    avgSatisfaction: average(rated.map(p => p.satisfaction as number)),
    ratedCount: rated.length,
    excludedSatisfaction: delivered.length - rated.length,
    isEmpty: delivered.length === 0
  }
}

// 供条形图取最大值定标
export const maxDeliveryDays = (stats: DeliveryStat[]) =>
  Math.max(1, ...stats.map(s => s.avgDeliveryDays ?? 0))

export const maxProjectCount = (stats: DeliveryStat[]) =>
  Math.max(1, ...stats.map(s => s.projectCount))

// 列表筛选：分类 + 是否只看已上线运维项目（与看板同口径）
export const filterProducts = (
  list: ProductItem[],
  category: string,
  deliveredOnly: boolean
): ProductItem[] =>
  list.filter(
    p =>
      (!category || p.category === category) &&
      (!deliveredOnly || p.deliveryStatus === '已上线运维')
  )
