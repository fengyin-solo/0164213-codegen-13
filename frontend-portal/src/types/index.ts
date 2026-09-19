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
/** 项目交付阶段，与服务流程各环节一一对应 */
export type DeliveryStage = '需求沟通' | '方案设计' | '开发实施' | '测试验收' | '上线运维'

/** 项目交付信息 */
export interface ProjectDelivery {
  /** 当前所处的交付阶段 */
  stage: DeliveryStage
  /** 交付周期（周） */
  cycleWeeks: number
  /** 客户满意度（%），null 表示暂未收集到评价数据 */
  satisfaction: number | null
}

export interface ProductItem {
  id: number
  name: string
  description: string
  image: string
  features: string[]
  price?: number
  category: string
  /** 项目交付信息，处于「上线运维」阶段的项目会纳入交付成效看板统计 */
  delivery?: ProjectDelivery
}

// ==================== 交付成效看板 ====================
export interface IndustryDeliveryStats {
  /** 行业（产品分类），'' 表示全部行业合计 */
  industry: string
  /** 已上线运维的项目数量 */
  projectCount: number
  /** 平均交付周期（周），无项目时为 null */
  avgCycleWeeks: number | null
  /** 平均客户满意度（%），无评价数据时为 null */
  avgSatisfaction: number | null
  /** 计入满意度平均分的项目数 */
  satisfactionSampleCount: number
  /** 因缺少满意度数据而未计入平均分的项目数 */
  satisfactionExcludedCount: number
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
