// ==================== 通用类型 ====================
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== 新闻相关 ====================
export interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  coverImage: string
  category: string
  author: string
  viewCount: number
  publishTime: string
  createTime: string
  updateTime: string
}

// ==================== 产品相关 ====================
// 项目所处阶段：开发中 / 测试验收中 / 已上线运维
export type DeliveryStatus = '开发中' | '测试验收中' | '已上线运维'

export interface ProductItem {
  id: number
  name: string
  description: string
  image: string
  features: string[]
  price?: number
  category: string
  // 交付成效相关字段（仅已上线运维项目参与看板统计）
  deliveryStatus?: DeliveryStatus
  // 交付周期（天），已完成测试验收的项目才有
  deliveryDays?: number
  // 客户满意度（0-100，百分制），缺失表示暂无满意度数据
  satisfaction?: number | null
}

// ==================== 联系表单 ====================
export interface ContactForm {
  name: string
  email: string
  phone: string
  company?: string
  message: string
}

// ==================== 案例相关 ====================
export interface CaseItem {
  id: number
  title: string
  description: string
  coverImage: string
  industry: string
  client: string
  serviceType: string
  tags: string[]
  highlights: string[]
  results: {
    label: string
    value: string
  }[]
  publishTime: string
}

// ==================== 预约咨询表单 ====================
export interface ConsultationForm {
  name: string
  email: string
  phone: string
  company?: string
  industry: string
  caseId?: number
  caseTitle?: string
  requirement: string
}

// ==================== 导航菜单 ====================
export interface NavItem {
  name: string
  path: string
  icon?: string
  children?: NavItem[]
}

// ==================== Banner ====================
export interface BannerItem {
  id: number
  title: string
  subtitle?: string
  image: string
  link?: string
  buttonText?: string
}
