<template>
  <section class="dashboard-section">
    <div class="dashboard-container">
      <div class="section-header">
        <span class="section-header__badge">
          <el-icon><DataAnalysis /></el-icon> 交付成效看板
        </span>
        <h2 class="section-header__title">上线项目交付成效</h2>
        <p class="section-header__desc">
          汇总已完成测试验收、处于「上线运维」阶段的项目，项目数量与上方产品列表实时保持一致
        </p>
      </div>

      <!-- 行业切换：与产品列表分类联动 -->
      <div class="industry-tabs">
        <button
          v-for="tab in industryTabs"
          :key="tab.value"
          class="industry-tab"
          :class="{ active: activeCategory === tab.value }"
          @click="selectIndustry(tab.value)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- 统计卡片 -->
      <div v-if="currentStats.projectCount > 0" class="stats-area">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <span class="stat-num">
                {{ currentStats.projectCount }}
                <em>个</em>
              </span>
              <span class="stat-label">上线运维项目</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <span class="stat-num">
                {{ formatNumber(currentStats.avgCycleWeeks) }}
                <em>周</em>
              </span>
              <span class="stat-label">平均交付周期</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-num">
                {{ satisfactionDisplay }}
                <em v-if="currentStats.avgSatisfaction !== null">%</em>
              </span>
              <span class="stat-label">客户满意度</span>
            </div>
          </div>
        </div>
        <p class="stats-note">
          <el-icon><InfoFilled /></el-icon>
          {{ satisfactionNote }}
        </p>
      </div>

      <!-- 空态：该行业暂无完成测试验收的上线项目 -->
      <div v-else class="dashboard-empty">
        <span class="empty-icon">📭</span>
        <h3>{{ currentIndustryLabel }}行业暂无上线运维项目</h3>
        <p>该行业的项目尚未完成测试验收，交付数据将在项目上线运维后展示，敬请期待</p>
      </div>

      <!-- 各行业对比条形图 -->
      <div class="chart-panel">
        <div class="chart-header">
          <h3>各行业交付对比</h3>
          <div class="metric-switch">
            <button
              v-for="metric in metrics"
              :key="metric.value"
              :class="{ active: activeMetric === metric.value }"
              @click="activeMetric = metric.value"
            >
              {{ metric.label }}
            </button>
          </div>
        </div>
        <div class="bar-chart">
          <div
            v-for="row in chartRows"
            :key="row.industry"
            class="bar-row"
            :class="{ empty: row.value === null }"
          >
            <span class="bar-label">
              <span class="bar-icon">{{ row.icon }}</span>
              {{ row.label }}
            </span>
            <div class="bar-track">
              <div
                v-if="row.value !== null"
                class="bar-fill"
                :style="{ width: barWidth(row.value) }"
              ></div>
              <span v-else class="bar-empty-text">{{ row.emptyText }}</span>
            </div>
            <span class="bar-value">{{ row.value === null ? '—' : row.text }}</span>
          </div>
        </div>
      </div>

      <!-- 行业入口：回到产品列表与服务案例 -->
      <div class="dashboard-actions">
        <el-button type="primary" round @click="scrollToProducts">
          查看{{ currentIndustryLabel }}产品
          <el-icon><Bottom /></el-icon>
        </el-button>
        <el-button round @click="router.push('/cases')">
          查看服务案例
          <el-icon><Right /></el-icon>
        </el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores'

const router = useRouter()
const productsStore = useProductsStore()
const { activeCategory } = storeToRefs(productsStore)

type MetricKey = 'count' | 'cycle' | 'satisfaction'

const metrics: { label: string; value: MetricKey }[] = [
  { label: '项目数量', value: 'count' },
  { label: '平均交付周期', value: 'cycle' },
  { label: '客户满意度', value: 'satisfaction' }
]

const activeMetric = ref<MetricKey>('count')

// 行业 tab：全部行业合计 + 各行业，数量取自交付统计（与产品列表同源）
const industryTabs = computed(() => [
  { label: '全部行业', value: '', icon: '📊', count: productsStore.totalStats.projectCount },
  ...productsStore.industryStats.map(s => {
    const cat = productsStore.categories.find(c => c.value === s.industry)
    return { label: cat?.label ?? s.industry, value: s.industry, icon: cat?.icon ?? '', count: s.projectCount }
  })
])

// 当前选中范围（单个行业或全部行业合计）的统计数据
const currentStats = computed(() => productsStore.statsFor(activeCategory.value))

const currentIndustryLabel = computed(() => {
  if (!activeCategory.value) return '全部'
  return productsStore.categories.find(c => c.value === activeCategory.value)?.label ?? ''
})

const selectIndustry = (value: string) => {
  productsStore.setActiveCategory(value)
}

const formatNumber = (value: number | null) => {
  if (value === null) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

const satisfactionDisplay = computed(() => formatNumber(currentStats.value.avgSatisfaction))

// 满意度说明：标注样本量，并说明缺少数据被排除的项目数
const satisfactionNote = computed(() => {
  const s = currentStats.value
  if (s.satisfactionSampleCount === 0) return '该范围暂无客户满意度评价数据'
  const base = `满意度基于 ${s.satisfactionSampleCount} 条客户评价计算`
  return s.satisfactionExcludedCount > 0
    ? `${base}，另有 ${s.satisfactionExcludedCount} 个项目因缺少满意度数据未计入平均分`
    : base
})

// 条形图数据：无上线项目的行业按空态处理，不渲染空白条形
const chartRows = computed(() =>
  productsStore.industryStats.map(s => {
    const cat = productsStore.categories.find(c => c.value === s.industry)
    let value: number | null = null
    let text = ''
    let emptyText = '暂无上线项目'

    if (s.projectCount > 0) {
      if (activeMetric.value === 'count') {
        value = s.projectCount
        text = `${s.projectCount} 个`
      } else if (activeMetric.value === 'cycle') {
        value = s.avgCycleWeeks
        text = value === null ? '' : `${formatNumber(value)} 周`
      } else {
        value = s.avgSatisfaction
        text = value === null ? '' : `${formatNumber(value)}%`
      }
      if (value === null) emptyText = '暂无评价数据'
    }

    return {
      industry: s.industry,
      label: cat?.label ?? s.industry,
      icon: cat?.icon ?? '',
      value,
      text,
      emptyText
    }
  })
)

const maxValue = computed(() => Math.max(0, ...chartRows.value.map(r => r.value ?? 0)))

const barWidth = (value: number) => {
  if (maxValue.value <= 0) return '0%'
  return `${Math.max((value / maxValue.value) * 100, 4)}%`
}

// 回到产品列表（分类已联动为当前行业）
const scrollToProducts = () => {
  document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style lang="scss" scoped>
.dashboard-section {
  padding: $spacing-4xl $spacing-lg;
  background: $bg-color-white;
}

.dashboard-container {
  max-width: $container-max-width;
  margin: 0 auto;
}

// ==================== 行业切换 ====================
.industry-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-xxl;
}

.industry-tab {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-color-secondary;
  background: $bg-color-light;
  border-radius: $border-radius-full;
  white-space: nowrap;
  transition: all $transition-fast;

  .tab-icon {
    font-size: $font-size-md;
  }

  .tab-count {
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
  }

  &:hover {
    color: $text-color-primary;
    background: $border-color;
  }

  &.active {
    color: white;
    background: $gradient-primary;

    .tab-count {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// ==================== 统计卡片 ====================
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
  margin-bottom: $spacing-md;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-xl;
  background: $bg-color-light;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }

  .stat-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gradient-primary;
    border-radius: $border-radius-md;
    font-size: 28px;
  }

  .stat-info {
    display: flex;
    flex-direction: column;

    .stat-num {
      font-size: $font-size-3xl;
      font-weight: 700;
      background: $gradient-text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;

      em {
        font-style: normal;
        font-size: $font-size-sm;
        margin-left: 2px;
      }
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.stats-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xxl;
  font-size: $font-size-sm;
  color: $text-color-secondary;

  .el-icon {
    color: $primary-color;
  }
}

// ==================== 空态 ====================
.dashboard-empty {
  text-align: center;
  padding: $spacing-3xl $spacing-lg;
  margin-bottom: $spacing-xxl;
  background: $bg-color-light;
  border: 1px dashed $border-color;
  border-radius: $border-radius-xl;

  .empty-icon {
    display: block;
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  h3 {
    font-size: $font-size-xl;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

// ==================== 条形图 ====================
.chart-panel {
  padding: $spacing-xl;
  margin-bottom: $spacing-xxl;
  background: $bg-color-light;
  border-radius: $border-radius-xl;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
  }
}

.metric-switch {
  display: flex;
  gap: $spacing-xs;
  padding: 4px;
  background: white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-full;

  button {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-xs;
    font-weight: 500;
    color: $text-color-secondary;
    border-radius: $border-radius-full;
    transition: all $transition-fast;

    &:hover {
      color: $text-color-primary;
    }

    &.active {
      color: white;
      background: $gradient-primary;
    }
  }
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.bar-row {
  display: grid;
  grid-template-columns: 110px 1fr 90px;
  align-items: center;
  gap: $spacing-md;

  .bar-label {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-color-regular;
    white-space: nowrap;
  }

  .bar-track {
    display: flex;
    align-items: center;
    height: 28px;
    background: white;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-full;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: $gradient-primary;
    border-radius: $border-radius-full;
    transition: width $transition-slow;
  }

  .bar-empty-text {
    padding-left: $spacing-md;
    font-size: $font-size-xs;
    color: $text-color-placeholder;
  }

  .bar-value {
    font-size: $font-size-sm;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
  }

  &.empty .bar-value {
    color: $text-color-placeholder;
    font-weight: 400;
  }
}

// ==================== 行业入口 ====================
.dashboard-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-md;
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-md) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .bar-row {
    grid-template-columns: 84px 1fr 64px;
    gap: $spacing-sm;
  }
}
</style>
