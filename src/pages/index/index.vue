<template>
  <view class="index">
    <!-- 摄影师工作台模式 -->
    <template v-if="userStore.isStudioMode">
      <view class="studio-page">
        <!-- 数据概览 -->
        <view class="stats-card">
          <view class="stat-item">
            <text class="stat-value">{{ overview.totalEarned ?? '-' }}</text>
            <text class="stat-label">总积分收益</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ overview.monthEarned ?? '-' }}</text>
            <text class="stat-label">本月收益</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ overview.currentPoints ?? '-' }}</text>
            <text class="stat-label">当前余额</text>
          </view>
        </view>

        <!-- 快捷入口 -->
        <view class="menu-section">
          <view class="menu-item" @tap="goUpload">
            <text class="menu-label">上传作品</text>
            <text class="arrow">›</text>
          </view>
          <view class="menu-item" @tap="goWorks">
            <text class="menu-label">我的作品</text>
            <text class="arrow">›</text>
          </view>
          <view class="menu-item" @tap="goEarnings">
            <text class="menu-label">积分收益</text>
            <text class="arrow">›</text>
          </view>
          <view class="menu-item" @tap="goLicenseRequests">
            <text class="menu-label">授权申请</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 用户浏览模式 -->
    <template v-else>
      <!-- 分类 Tab -->
      <scroll-view class="category-tabs" scroll-x>
        <view
          v-for="cat in allCategories"
          :key="cat.id"
          class="tab-item"
          :class="{ active: currentCategory === cat.id }"
          @tap="onCategoryChange(cat.id)"
        >
          {{ cat.name }}
        </view>
      </scroll-view>

      <!-- 搜索入口 -->
      <view class="search-bar" @tap="goSearch">
        <text class="search-placeholder">搜索作品、摄影师...</text>
      </view>

      <!-- 瀑布流 -->
      <view class="waterfall">
        <view class="column">
          <view
            v-for="item in leftList"
            :key="item.id"
            class="photo-card"
            @tap="goDetail(item.id)"
          >
            <image :src="item.previewUrl" mode="widthFix" lazy-load />
            <view class="card-info">
              <text class="title">{{ item.title }}</text>
              <text class="price">{{ item.price }} 积分</text>
            </view>
          </view>
        </view>
        <view class="column">
          <view
            v-for="item in rightList"
            :key="item.id"
            class="photo-card"
            @tap="goDetail(item.id)"
          >
            <image :src="item.previewUrl" mode="widthFix" lazy-load />
            <view class="card-info">
              <text class="title">{{ item.title }}</text>
              <text class="price">{{ item.price }} 积分</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more">
        <text v-if="photoStore.loading">加载中...</text>
        <text v-else-if="!photoStore.hasMore">没有更多了</text>
      </view>
    </template>

    <!-- 自定义 tabBar -->
    <CustomTabBar current-tab="home" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { usePhotoStore } from '@/store/photo.js'
import { useUserStore } from '@/store/user.js'
import { getEarningsOverview } from '@/api/studio.js'
import CustomTabBar from '@/components/CustomTabBar.vue'

const photoStore = usePhotoStore()
const userStore = useUserStore()

// ---- 工作台数据 ----
const overview = ref({})

async function loadStudioData() {
  try {
    overview.value = await getEarningsOverview()
  } catch {}
}

// ---- 瀑布流数据 ----
const allCategories = computed(() => [
  { id: '', name: '全部' },
  ...photoStore.categories,
])
const currentCategory = computed(() => photoStore.currentCategory)
const leftList = computed(() => photoStore.list.filter((_, i) => i % 2 === 0))
const rightList = computed(() => photoStore.list.filter((_, i) => i % 2 === 1))

async function loadBuyerData() {
  await photoStore.fetchCategories()
  await photoStore.fetchList(true)
}

// ---- 生命周期 ----
onMounted(() => {
  if (userStore.isStudioMode) {
    loadStudioData()
  } else {
    loadBuyerData()
  }
})

onShow(() => {
  if (userStore.isStudioMode) {
    loadStudioData()
  }
})

// 监听模式切换，重新加载数据
watch(() => userStore.isStudioMode, (isStudio) => {
  if (isStudio) {
    loadStudioData()
  } else {
    if (!photoStore.categories.length) loadBuyerData()
  }
})

function onCategoryChange(id) {
  photoStore.setCategory(id)
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

onReachBottom(() => {
  if (!userStore.isStudioMode) {
    photoStore.fetchList()
  }
})

// ---- 工作台导航 ----
const goUpload = () => uni.navigateTo({ url: '/pages/studio/upload' })
const goWorks = () => uni.navigateTo({ url: '/pages/studio/works' })
const goEarnings = () => uni.navigateTo({ url: '/pages/studio/earnings' })
const goLicenseRequests = () => uni.navigateTo({ url: '/pages/studio/licenses' })
</script>

<style lang="scss" scoped>
.index {
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* ---- 工作台样式 ---- */
.studio-page {
  background: #f5f5f5;
}

.stats-card {
  display: flex;
  background: #333;
  padding: 48rpx 32rpx;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-value {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: rgba(255,255,255,0.6);
      margin-top: 8rpx;
    }
  }
}

.menu-section {
  background: #fff;
  margin-top: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child { border-bottom: none; }

  .menu-label { font-size: 30rpx; color: #333; }
  .arrow { font-size: 36rpx; color: #ccc; }
}

/* ---- 瀑布流样式 ---- */
.category-tabs {
  display: flex;
  white-space: nowrap;
  padding: 20rpx 24rpx;
  background: #fff;

  .tab-item {
    display: inline-block;
    padding: 12rpx 28rpx;
    margin-right: 16rpx;
    border-radius: 32rpx;
    font-size: 28rpx;
    color: #666;
    background: #f5f5f5;

    &.active {
      background: #333;
      color: #fff;
    }
  }
}

.search-bar {
  margin: 16rpx 24rpx;
  padding: 18rpx 28rpx;
  background: #f5f5f5;
  border-radius: 40rpx;

  .search-placeholder {
    font-size: 28rpx;
    color: #999;
  }
}

.waterfall {
  display: flex;
  padding: 0 12rpx;
  gap: 12rpx;

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
}

.photo-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  image {
    width: 100%;
    display: block;
  }

  .card-info {
    padding: 12rpx 16rpx;

    .title {
      font-size: 26rpx;
      color: #333;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price {
      font-size: 24rpx;
      color: #f5a623;
      margin-top: 6rpx;
      display: block;
    }
  }
}

.load-more {
  text-align: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: #999;
}
</style>
