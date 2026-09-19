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
          @click="setActiveCategory(cat.value)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </section>

    <!-- 产品列表 -->
    <section id="product-list" class="products-section">
      <div class="products-container">
        <div class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge">{{ product.category }}</div>
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
        <el-empty v-if="filteredProducts.length === 0" description="该分类暂无已上线的产品，项目完成测试验收后展示" />
      </div>
    </section>

    <!-- 交付成效看板 -->
    <DeliveryDashboard />

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores'
import DeliveryDashboard from '@/components/common/DeliveryDashboard.vue'
import type { ProductItem } from '@/types'

const router = useRouter()
const productsStore = useProductsStore()
// 分类选择保存在 store 中：看板与产品列表联动，从案例页返回时仍停留在已选行业
const { activeCategory } = storeToRefs(productsStore)
const { categories, setActiveCategory } = productsStore

const dialogVisible = ref(false)
const currentProduct = ref<ProductItem | null>(null)

// 产品列表展示已上线运维的项目，与交付成效看板共用同一数据集合，保证两边数量一致
const filteredProducts = computed(() => {
  const list = productsStore.liveProjects
  if (!activeCategory.value) return list
  return list.filter(p => p.category === activeCategory.value)
})

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
  // 看板「查看产品」入口滚动定位时，避开固定头部与吸顶分类栏
  scroll-margin-top: calc($header-height + 72px);
}

.products-container {
  max-width: $container-max-width;
  margin: 0 auto;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-xl;
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
  }
}
</style>
