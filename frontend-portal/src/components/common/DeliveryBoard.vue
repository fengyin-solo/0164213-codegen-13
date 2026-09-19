<template>
  <div class="delivery-board">
    <!-- 标题 -->
    <div class="board-header">
      <span class="board-header__badge">
        <el-icon><DataLine /></el-icon> 交付成效看板
      </span>
      <h2 class="board-header__title">已上线运维项目交付成效</h2>
      <p class="board-header__desc">
        按行业汇总已完成测试验收并进入上线运维的项目，数据实时来源于实际交付项目
      </p>
    </div>

    <!-- 行业切换 -->
    <div class="board-tabs">
      <button
        class="board-tab"
        :class="{ active: activeIndustry === '' }"
        @click="selectIndustry('')"
      >
        <span class="tab-icon">🏢</span>
        <span>合计</span>
        <span class="tab-count">{{ totalStat.projectCount }}</span>
      </button>
      <button
        v-for="stat in stats"
        :key="stat.value"
        class="board-tab"
        :class="{ active: activeIndustry === stat.value, empty: stat.isEmpty }"
        @click="selectIndustry(stat.value)"
      >
        <span class="tab-icon">{{ stat.icon }}</span>
        <span>{{ stat.label }}</span>
        <span class="tab-count" :class="{ 'is-zero': stat.projectCount === 0 }">
          {{ stat.projectCount }}
        </span>
      </button>
    </div>

    <!-- 当前行业的指标卡片 -->
    <transition name="board-fade" mode="out-in">
      <div v-if="currentStat.isEmpty" :key="'empty-' + currentStat.value" class="board-empty">
        <el-icon class="empty-icon"><Box /></el-icon>
        <h3>{{ currentStat.label }}暂无已完成测试验收的项目</h3>
        <p>
          该行业的项目仍处于开发或测试验收阶段，尚未进入上线运维。
          完成测试验收后将自动纳入看板统计。
        </p>
        <div class="empty-actions">
          <el-button round @click="$emit('browse-products', currentStat.value)">
            查看该行业产品 <el-icon><Right /></el-icon>
          </el-button>
          <el-button round @click="$emit('browse-cases')">
            查看服务案例 <el-icon><Reading /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-else :key="'cards-' + currentStat.value" class="board-cards">
        <div class="metric-card">
          <div class="metric-icon metric-icon--count">
            <el-icon><Files /></el-icon>
          </div>
          <div class="metric-body">
            <span class="metric-value">{{ currentStat.projectCount }}</span>
            <span class="metric-label">上线项目数量（个）</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon--days">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="metric-body">
            <span class="metric-value">{{ currentStat.avgDeliveryDays ?? '—' }}</span>
            <span class="metric-label">平均交付周期（天）</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon--score">
            <el-icon><Star /></el-icon>
          </div>
          <div class="metric-body">
            <span class="metric-value">
              {{ currentStat.avgSatisfaction === null ? '—' : currentStat.avgSatisfaction }}
              <em v-if="currentStat.avgSatisfaction !== null">分</em>
            </span>
            <span class="metric-label">客户满意度（百分制）</span>
            <span class="metric-note">
              基于 {{ currentStat.ratedCount }} 个有效评分计算；
              <template v-if="currentStat.excludedSatisfaction > 0">
                已排除 {{ currentStat.excludedSatisfaction }} 个暂无满意度数据的项目
              </template>
              <template v-else>无被排除项目</template>
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 各行业对比条形图 -->
    <div class="board-chart">
      <div class="chart-heading">
        <h3>
          <el-icon><Histogram /></el-icon>
          {{ activeIndustry ? '行业对比（点击条形可切换行业）' : '全部行业对比' }}
        </h3>
        <span class="chart-legend">
          <i class="dot dot--count"></i>项目数量
          <i class="dot dot--days"></i>平均交付周期
          <i class="dot dot--score"></i>满意度
        </span>
      </div>

      <div class="chart-rows">
        <button
          v-for="stat in stats"
          :key="stat.value"
          class="chart-row"
          :class="{ active: activeIndustry === stat.value, empty: stat.isEmpty }"
          @click="selectIndustry(stat.value)"
        >
          <div class="row-name">
            <span class="row-icon">{{ stat.icon }}</span>
            {{ stat.label }}
            <span v-if="stat.isEmpty" class="row-empty-tag">暂无验收项目</span>
          </div>

          <div v-if="stat.isEmpty" class="row-bars row-bars--empty">
            <div class="bar bar--empty"></div>
          </div>

          <div v-else class="row-bars">
            <div class="bar-line" :title="`项目数量：${stat.projectCount} 个`">
              <div class="bar-meta">
                <span>项目数量</span>
                <strong>{{ stat.projectCount }} 个</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill bar-fill--count"
                  :style="{ width: barWidth(stat.projectCount, maxCount) }"
                ></div>
              </div>
            </div>

            <div class="bar-line" :title="`平均交付周期：${stat.avgDeliveryDays ?? '—'} 天`">
              <div class="bar-meta">
                <span>平均交付周期</span>
                <strong>{{ stat.avgDeliveryDays ?? '—' }} 天</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill bar-fill--days"
                  :style="{ width: barWidth(stat.avgDeliveryDays ?? 0, maxDays) }"
                ></div>
              </div>
            </div>

            <div class="bar-line" :title="`客户满意度：${stat.avgSatisfaction ?? '—'} 分`">
              <div class="bar-meta">
                <span>客户满意度</span>
                <strong>{{ stat.avgSatisfaction === null ? '—' : stat.avgSatisfaction + ' 分' }}</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill bar-fill--score"
                  :style="{ width: barWidth(stat.avgSatisfaction ?? 0, 100) }"
                ></div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 回到产品列表 / 案例入口 -->
    <div v-if="!currentStat.isEmpty" class="board-links">
      <el-button type="primary" round @click="$emit('browse-products', currentStat.value)">
        查看{{ currentStat.label }}产品列表
        <el-icon class="el-icon--right"><Right /></el-icon>
      </el-button>
      <el-button round @click="$emit('browse-cases')">
        <el-icon class="el-icon--left"><Reading /></el-icon>
        查看服务案例入口
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  buildIndustryStats,
  buildTotalStat,
  maxDeliveryDays,
  maxProjectCount,
  type DeliveryStat
} from '@/data/deliveryStats'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'browse-products', industry: string): void
  (e: 'browse-cases'): void
}>()

const stats = ref<DeliveryStat[]>([])

onMounted(() => {
  // 数据来自与产品列表相同的项目集合，保证数量口径一致
  stats.value = buildIndustryStats()
})

const totalStat = computed<DeliveryStat>(() => buildTotalStat(stats.value))

const activeIndustry = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const currentStat = computed<DeliveryStat>(() => {
  if (!activeIndustry.value) return totalStat.value
  return stats.value.find(s => s.value === activeIndustry.value) ?? totalStat.value
})

const maxDays = computed(() => maxDeliveryDays(stats.value))
const maxCount = computed(() => maxProjectCount(stats.value))

const barWidth = (value: number, max: number) =>
  `${Math.max(value > 0 ? 4 : 0, (value / max) * 100)}%`

const selectIndustry = (value: string) => {
  activeIndustry.value = value
}
</script>

<style lang="scss" scoped>
.delivery-board {
  max-width: $container-max-width;
  margin: 0 auto;
}

// ==================== 标题 ====================
.board-header {
  text-align: center;
  margin-bottom: $spacing-3xl;

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    font-size: $font-size-sm;
    font-weight: 600;
    border-radius: $border-radius-full;
    margin-bottom: $spacing-md;

    .el-icon {
      font-size: 16px;
    }
  }

  &__title {
    font-size: clamp(28px, 4vw, $font-size-3xl);
    font-weight: 700;
    margin-bottom: $spacing-sm;
  }

  &__desc {
    font-size: $font-size-md;
    color: $text-color-secondary;
  }
}

// ==================== 行业切换 ====================
.board-tabs {
  display: flex;
  justify-content: flex-start;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: $spacing-xs;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: $breakpoint-lg) {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.board-tab {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-color-secondary;
  background: $bg-color-white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-full;
  white-space: nowrap;
  cursor: pointer;
  transition: all $transition-fast;
  flex-shrink: 0;

  .tab-icon {
    font-size: $font-size-md;
  }

  .tab-count {
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: 600;

    &.is-zero {
      color: $text-color-secondary;
    }
  }

  &:hover {
    color: $text-color-primary;
    border-color: $primary-color-light;
  }

  &.active {
    color: white;
    background: $gradient-primary;
    border-color: transparent;

    .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }
  }

  &.empty .tab-count {
    color: $warning-color;
  }
}

// ==================== 指标卡片 ====================
.board-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
}

.metric-card {
  display: flex;
  gap: $spacing-lg;
  padding: $spacing-xl;
  background: $bg-color-white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-xl;
  transition: all $transition-normal;

  &:hover {
    border-color: transparent;
    box-shadow: $shadow-xl;
    transform: translateY(-4px);
  }

  .metric-icon {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    font-size: 24px;
    color: white;

    &--count {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }

    &--days {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
    }

    &--score {
      background: linear-gradient(135deg, #f59e0b, #ec4899);
    }
  }

  .metric-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .metric-value {
    font-size: $font-size-xxl;
    font-weight: 700;
    line-height: 1.2;
    background: $gradient-text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    em {
      font-style: normal;
      font-size: $font-size-sm;
      color: $text-color-secondary;
      -webkit-text-fill-color: $text-color-secondary;
    }
  }

  .metric-label {
    font-size: $font-size-sm;
    color: $text-color-regular;
    margin-top: $spacing-xs;
  }

  .metric-note {
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-color-secondary;
    line-height: $line-height-normal;
    padding-top: $spacing-sm;
    border-top: 1px dashed $border-color;
  }
}

// ==================== 空态 ====================
.board-empty {
  text-align: center;
  padding: $spacing-3xl $spacing-xl;
  background: $bg-color-white;
  border: 1px dashed $border-color;
  border-radius: $border-radius-xl;

  .empty-icon {
    font-size: 48px;
    color: $text-color-placeholder;
    margin-bottom: $spacing-md;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    max-width: 520px;
    margin: 0 auto $spacing-lg;
    line-height: $line-height-loose;
  }

  .empty-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    flex-wrap: wrap;
  }
}

// ==================== 条形图 ====================
.board-chart {
  margin-top: $spacing-3xl;
  padding: $spacing-xl;
  background: $bg-color-white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-xl;
}

.chart-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  flex-wrap: wrap;

  h3 {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-lg;
    font-weight: 600;

    .el-icon {
      color: $primary-color;
    }
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-color-secondary;

    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: $border-radius-round;
      margin-right: 2px;

      &--count {
        background: #6366f1;
      }

      &--days {
        background: #3b82f6;
      }

      &--score {
        background: #f59e0b;
      }
    }
  }
}

.chart-rows {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.chart-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: $spacing-lg;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: $spacing-md $spacing-lg;
  background: $bg-color-light;
  border: 1px solid transparent;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $primary-color-light;
  }

  &.active {
    background: rgba($primary-color, 0.06);
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.08);
  }

  &.empty {
    cursor: default;

    &:hover {
      border-color: transparent;
    }
  }

  .row-name {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-color-primary;
  }

  .row-icon {
    font-size: $font-size-md;
  }

  .row-empty-tag {
    margin-left: $spacing-xs;
    padding: 2px 8px;
    background: rgba($warning-color, 0.12);
    color: $warning-color;
    font-size: $font-size-xs;
    font-weight: 500;
    border-radius: $border-radius-full;
  }
}

.row-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &--empty {
    opacity: 0.8;
  }
}

.bar--empty {
  height: 28px;
  border: 1px dashed $border-color;
  border-radius: $border-radius-sm;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.02),
    rgba(0, 0, 0, 0.02) 8px,
    transparent 8px,
    transparent 16px
  );
}

.bar-line {
  .bar-meta {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-xs;
    color: $text-color-secondary;
    margin-bottom: 4px;

    strong {
      color: $text-color-primary;
      font-weight: 600;
    }
  }

  .bar-track {
    height: 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: $border-radius-full;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: $border-radius-full;
    transition: width $transition-slow;

    &--count {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
    }

    &--days {
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
    }

    &--score {
      background: linear-gradient(90deg, #f59e0b, #ec4899);
    }
  }
}

// ==================== 底部入口 ====================
.board-links {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  margin-top: $spacing-xxl;
  flex-wrap: wrap;
}

// ==================== 过渡 ====================
.board-fade-enter-active,
.board-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.board-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.board-fade-leave-to {
  opacity: 0;
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-lg) {
  .board-cards {
    grid-template-columns: 1fr;
  }

  .chart-row {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}
</style>
