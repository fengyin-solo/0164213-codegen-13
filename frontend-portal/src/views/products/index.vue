<template>
  <div class="products-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-content">
        <span class="hero-badge">产品服务</span>
        <h1>全方位<span class="gradient-text">数字化解决方案</span></h1>
        <p>从战略规划到技术落地，我们提供端到端的数字化服务</p>
      </div>
    </section>

    <!-- 产品分类 -->
    <section class="category-section">
      <div class="category-container">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="category-btn"
          :class="{ active: activeCategory === cat.value }"
          @click="handleCategoryChange(cat.value)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </section>

    <!-- 产品列表 -->
    <section ref="productsSectionRef" class="products-section">
      <div class="products-container">
        <!-- 从交付看板进入时的口径提示 -->
        <div v-if="deliveredOnly" class="delivered-banner">
          <el-icon class="banner-icon"><CircleCheckFilled /></el-icon>
          <span class="banner-text">
            当前仅展示已完成测试验收、进入<strong>上线运维</strong>的项目，共
            <strong>{{ filteredProducts.length }}</strong> 个，统计口径与「交付成效看板」一致。
          </span>
          <el-button link type="primary" @click="exitDeliveredView">
            查看全部产品 <el-icon><Right /></el-icon>
          </el-button>
        </div>

        <div v-if="filteredProducts.length > 0" class="products-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge">{{ product.category }}</div>
              <div v-if="product.deliveryStatus" class="product-status" :class="statusClass(product.deliveryStatus)">
                <i class="status-dot"></i>{{ product.deliveryStatus }}
              </div>
            </div>
            <div class="product-content">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <ul class="product-features">
                <li v-for="feature in product.features" :key="feature">
                  <el-icon><Check /></el-icon>
                  {{ feature }}
                </li>
              </ul>
              <el-button type="primary" round @click="showDetail(product)">
                了解详情 <el-icon><Right /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 与看板一致的空态：该行业尚无完成测试验收的项目 -->
        <el-empty v-else class="products-empty">
          <template #description>
            <div v-if="deliveredOnly" class="empty-desc">
              <p class="empty-title">{{ activeCategory }}行业暂无已完成测试验收的项目</p>
              <p>相关项目仍在开发或测试验收中，完成上线后将同步展示到产品列表与交付成效看板。</p>
            </div>
            <p v-else>暂无相关产品</p>
          </template>
          <el-button v-if="deliveredOnly" type="primary" round @click="showAllInCategory">
            查看该行业全部产品
          </el-button>
        </el-empty>
      </div>
    </section>

    <!-- 交付成效看板 -->
    <section id="board" class="board-section">
      <DeliveryBoard
        v-model="boardIndustry"
        @browse-products="handleBrowseProducts"
        @browse-cases="handleBrowseCases"
      />
    </section>

    <!-- 服务流程 -->
    <section class="process-section">
      <div class="section-header">
        <span class="section-header__badge">
          <el-icon><SetUp /></el-icon> 服务流程
        </span>
        <h2 class="section-header__title">专业规范的服务流程</h2>
        <p class="section-header__desc">确保每个项目高质量交付</p>
      </div>
      
      <div class="process-container">
        <div class="process-timeline">
          <div v-for="(step, index) in processSteps" :key="index" class="process-step">
            <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="tech-section">
      <div class="section-header">
        <span class="section-header__badge">
          <el-icon><Cpu /></el-icon> 技术栈
        </span>
        <h2 class="section-header__title">我们使用的技术</h2>
        <p class="section-header__desc">采用业界领先的技术栈，确保系统稳定可靠</p>
      </div>
      
      <div class="tech-grid">
        <div v-for="tech in techStack" :key="tech.name" class="tech-item">
          <div class="tech-icon">{{ tech.icon }}</div>
          <span>{{ tech.name }}</span>
        </div>
      </div>
    </section>

    <!-- 产品详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentProduct?.name"
      width="700px"
      class="product-dialog"
    >
      <div v-if="currentProduct" class="dialog-content">
        <div class="dialog-image">
          <img :src="currentProduct.image" :alt="currentProduct.name" />
        </div>
        <div class="dialog-info">
          <span class="dialog-category">{{ currentProduct.category }}</span>
          <p class="dialog-desc">{{ currentProduct.description }}</p>
          <h4>核心功能</h4>
          <ul class="dialog-features">
            <li v-for="feature in currentProduct.features" :key="feature">
              <el-icon><Check /></el-icon>
              {{ feature }}
            </li>
          </ul>
          <div v-if="currentProduct.deliveryStatus" class="dialog-delivery">
            <div class="delivery-item">
              <span class="delivery-label">项目阶段</span>
              <span class="delivery-value">{{ currentProduct.deliveryStatus }}</span>
            </div>
            <template v-if="currentProduct.deliveryStatus === '已上线运维'">
              <div v-if="currentProduct.deliveryDays" class="delivery-item">
                <span class="delivery-label">交付周期</span>
                <span class="delivery-value">{{ currentProduct.deliveryDays }} 天</span>
              </div>
              <div class="delivery-item">
                <span class="delivery-label">客户满意度</span>
                <span class="delivery-value">
                  {{ currentProduct.satisfaction == null ? '暂无数据' : currentProduct.satisfaction + ' 分' }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="router.push('/contact')">立即咨询</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ProductItem, DeliveryStatus } from '@/types'
import DeliveryBoard from '@/components/common/DeliveryBoard.vue'
import { PRODUCT_CATEGORIES, products as allProducts, deliveredProducts } from '@/data/products'
import { filterProducts } from '@/data/deliveryStats'

const router = useRouter()
const route = useRoute()

const dialogVisible = ref(false)
const currentProduct = ref<ProductItem | null>(null)

// 产品分类（网站建设 / 电商服务 / 移动开发 / 咨询服务）
const categories = PRODUCT_CATEGORIES

// 全部产品即项目列表，看板与列表共用同一份数据
const products = ref<ProductItem[]>(allProducts)

// 当前产品列表的分类筛选；deliveredOnly 表示只看已上线运维项目（看板同口径）
const activeCategory = ref('')
const deliveredOnly = ref(false)
// 看板当前选中的行业（'' 为合计），通过 query 保持，回到页面时仍停在原行业
const boardIndustry = ref('')

const productsSectionRef = ref<HTMLElement | null>(null)

// 将筛选状态同步到 URL，刷新 / 前进后退后仍可还原
const syncQuery = () => {
  const query: Record<string, string> = {}
  if (activeCategory.value) query.cat = activeCategory.value
  if (deliveredOnly.value) query.live = '1'
  if (boardIndustry.value) query.board = boardIndustry.value
  router.replace({ path: '/products', query })
}

const readQuery = () => {
  const cat = (route.query.cat as string) || ''
  const live = route.query.live === '1'
  const board = (route.query.board as string) || ''
  activeCategory.value = categories.some(c => c.value === cat) ? cat : ''
  deliveredOnly.value = live
  // board 必须是看板内有效的行业，非法值回落到合计
  boardIndustry.value = deliveredProducts().some(p => p.category === board) || board === ''
    ? board
    : ''
}

const handleCategoryChange = (value: string) => {
  activeCategory.value = value
  syncQuery()
}

// 从看板点击「查看某行业产品列表」：筛选该行业的上线运维项目
const handleBrowseProducts = (industry: string) => {
  activeCategory.value = industry
  deliveredOnly.value = true
  syncQuery()
  productsSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 从看板点击「查看服务案例入口」
const handleBrowseCases = () => {
  router.push({
    path: '/cases',
    query: boardIndustry.value ? { from: 'board', industry: boardIndustry.value } : { from: 'board' }
  })
}

const exitDeliveredView = () => {
  deliveredOnly.value = false
  syncQuery()
}

// 空态下「查看该行业全部产品」：保留行业，去掉上线口径限制
const showAllInCategory = () => {
  deliveredOnly.value = false
  syncQuery()
}

// 浏览器前进 / 后退时还原看板与列表状态
watch(
  () => route.query,
  () => readQuery()
)

// 看板切换行业后持久化到 URL，从案例页返回时仍停在该行业
watch(boardIndustry, () => syncQuery())

readQuery()

const filteredProducts = computed(() =>
  filterProducts(products.value, activeCategory.value, deliveredOnly.value)
)

const statusClass = (status: DeliveryStatus) => {
  if (status === '已上线运维') return 'is-online'
  if (status === '测试验收中') return 'is-testing'
  return 'is-building'
}

const processSteps = [
  { title: '需求沟通', description: '深入了解业务需求，明确项目目标与范围' },
  { title: '方案设计', description: '制定详细的技术方案和项目计划' },
  { title: '开发实施', description: '敏捷开发，迭代交付，确保质量' },
  { title: '测试验收', description: '全面测试，确保系统稳定可靠' },
  { title: '上线运维', description: '协助上线，提供持续运维支持' }
]

const techStack = [
  { name: 'Vue.js', icon: '🟢' },
  { name: 'React', icon: '⚛️' },
  { name: 'Node.js', icon: '💚' },
  { name: 'Java', icon: '☕' },
  { name: 'Python', icon: '🐍' },
  { name: 'Go', icon: '🔵' },
  { name: 'MySQL', icon: '🐬' },
  { name: 'Redis', icon: '🔴' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Kubernetes', icon: '☸️' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Nginx', icon: '🟩' }
]

const showDetail = (product: ProductItem) => {
  currentProduct.value = product
  dialogVisible.value = true
}
</script>

<style lang="scss" scoped>
.products-page {
  padding-top: $header-height;
}

// ==================== Hero ====================
.page-hero {
  padding: $spacing-4xl $spacing-lg;
  background: $bg-color-dark;
  text-align: center;
  
  .hero-badge {
    display: inline-block;
    padding: $spacing-sm $spacing-md;
    background: rgba($primary-color, 0.2);
    color: $primary-color-light;
    font-size: $font-size-sm;
    font-weight: 600;
    border-radius: $border-radius-full;
    margin-bottom: $spacing-md;
  }
  
  h1 {
    font-size: clamp(36px, 6vw, $font-size-5xl);
    color: white;
    margin-bottom: $spacing-md;
    
    .gradient-text {
      display: block;
      background: $gradient-text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  p {
    font-size: $font-size-lg;
    color: rgba(255, 255, 255, 0.7);
  }
}

// ==================== 分类 ====================
.category-section {
  position: sticky;
  top: $header-height;
  z-index: 100;
  background: white;
  border-bottom: 1px solid $border-color-light;
}

.category-container {
  display: flex;
  justify-content: flex-start;
  gap: $spacing-sm;
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $spacing-md $spacing-lg;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  // 大屏居中
  @media (min-width: $breakpoint-lg) {
    justify-content: center;
  }
}

.category-btn {
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
  flex-shrink: 0;
  
  .cat-icon {
    font-size: $font-size-md;
  }
  
  &:hover {
    color: $text-color-primary;
    background: $border-color;
  }
  
  &.active {
    color: white;
    background: $gradient-primary;
  }
}

// ==================== 产品列表 ====================
.products-section {
  padding: $spacing-4xl $spacing-lg;
  scroll-margin-top: $header-height;
}

.products-container {
  max-width: $container-max-width;
  margin: 0 auto;
}

// 看板口径提示条
.delivered-banner {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
  padding: $spacing-md $spacing-lg;
  margin-bottom: $spacing-xl;
  background: rgba($success-color, 0.08);
  border: 1px solid rgba($success-color, 0.25);
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
  color: $text-color-regular;

  .banner-icon {
    color: $success-color;
    font-size: 20px;
  }

  .banner-text {
    flex: 1;
    min-width: 240px;

    strong {
      color: $success-color;
    }
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-xl;
}

.products-empty {
  padding: $spacing-3xl 0;

  .empty-desc {
    .empty-title {
      font-size: $font-size-md;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }

    p:last-child {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.product-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-xl;
  overflow: hidden;
  transition: all $transition-normal;
  
  &:hover {
    border-color: transparent;
    box-shadow: $shadow-2xl;
    transform: translateY(-8px);
    
    .product-image img {
      transform: scale(1.05);
    }
  }
  
  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-slow;
    }
    
    .product-badge {
      position: absolute;
      top: $spacing-md;
      left: $spacing-md;
      padding: $spacing-xs $spacing-md;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      font-size: $font-size-xs;
      font-weight: 600;
      border-radius: $border-radius-full;
    }

    .product-status {
      position: absolute;
      top: $spacing-md;
      right: $spacing-md;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: $spacing-xs $spacing-sm;
      backdrop-filter: blur(10px);
      font-size: $font-size-xs;
      font-weight: 600;
      border-radius: $border-radius-full;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: $border-radius-round;
        background: currentColor;
      }

      &.is-online {
        background: rgba(16, 185, 129, 0.92);
        color: white;
      }

      &.is-testing {
        background: rgba(245, 158, 11, 0.92);
        color: white;
      }

      &.is-building {
        background: rgba(0, 0, 0, 0.55);
        color: white;
      }
    }
  }
  
  .product-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $spacing-xl;
    
    h3 {
      font-size: $font-size-xl;
      margin-bottom: $spacing-sm;
    }
    
    > p {
      font-size: $font-size-sm;
      color: $text-color-secondary;
      line-height: $line-height-loose;
      margin-bottom: $spacing-md;
      min-height: 42px;
    }
    
    .product-features {
      flex: 1;
      margin-bottom: $spacing-lg;
      
      li {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-xs 0;
        font-size: $font-size-sm;
        color: $text-color-regular;
        
        .el-icon {
          color: $success-color;
          font-size: 14px;
        }
      }
    }
    
    .el-button {
      width: 100%;
      margin-top: auto;
    }
  }
}

// ==================== 交付成效看板 ====================
.board-section {
  padding: $spacing-4xl $spacing-lg;
  background: $bg-color-light;
  scroll-margin-top: $header-height;
}

// ==================== 服务流程 ====================
.process-section {
  padding: $spacing-4xl $spacing-lg;
  background: $bg-color-light;
}

.process-container {
  max-width: 900px;
  margin: 0 auto;
}

.process-timeline {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.process-step {
  display: flex;
  gap: $spacing-xl;
  padding: $spacing-xl;
  background: white;
  border-radius: $border-radius-lg;
  transition: all $transition-normal;
  
  &:hover {
    box-shadow: $shadow-lg;
    transform: translateX(8px);
    
    .step-number {
      background: $gradient-primary;
      color: white;
    }
  }
  
  .step-number {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-color-light;
    color: $primary-color;
    font-size: $font-size-xl;
    font-weight: 800;
    border-radius: $border-radius-md;
    transition: all $transition-normal;
  }
  
  .step-content {
    h4 {
      font-size: $font-size-lg;
      margin-bottom: $spacing-xs;
    }
    
    p {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

// ==================== 技术栈 ====================
.tech-section {
  padding: $spacing-4xl $spacing-lg;
  max-width: $container-max-width;
  margin: 0 auto;
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $spacing-md;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  background: white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-full;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: all $transition-fast;
  
  &:hover {
    border-color: $primary-color;
    background: rgba($primary-color, 0.05);
  }
  
  .tech-icon {
    font-size: $font-size-lg;
  }
}

// ==================== 弹窗 ====================
.product-dialog {
  .dialog-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xl;
  }
  
  .dialog-image {
    border-radius: $border-radius-lg;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .dialog-info {
    .dialog-category {
      display: inline-block;
      padding: $spacing-xs $spacing-md;
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      font-size: $font-size-sm;
      font-weight: 600;
      border-radius: $border-radius-full;
      margin-bottom: $spacing-md;
    }
    
    .dialog-desc {
      font-size: $font-size-md;
      color: $text-color-secondary;
      line-height: $line-height-loose;
      margin-bottom: $spacing-lg;
    }
    
    h4 {
      font-size: $font-size-md;
      margin-bottom: $spacing-md;
    }
    
    .dialog-features {
      li {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-sm 0;
        font-size: $font-size-sm;
        color: $text-color-regular;
        border-bottom: 1px dashed $border-color-light;

        .el-icon {
          color: $success-color;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .dialog-delivery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-md;
      margin-top: $spacing-lg;
      padding: $spacing-md;
      background: $bg-color-light;
      border-radius: $border-radius-md;

      .delivery-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: center;
      }

      .delivery-label {
        font-size: $font-size-xs;
        color: $text-color-secondary;
      }

      .delivery-value {
        font-size: $font-size-sm;
        font-weight: 600;
        color: $text-color-primary;
      }
    }
  }
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-lg) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .process-step {
    flex-direction: column;
    text-align: center;
    
    .step-number {
      margin: 0 auto;
    }
  }
  
  :deep(.el-dialog) {
    width: 95% !important;

    .dialog-content {
      grid-template-columns: 1fr;
    }

    .dialog-info .dialog-delivery {
      grid-template-columns: 1fr;
    }
  }
}
</style>
