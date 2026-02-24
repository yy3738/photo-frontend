<template>
  <view class="index">
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
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { usePhotoStore } from '@/store/photo.js'

const photoStore = usePhotoStore()

const allCategories = computed(() => [
  { id: '', name: '全部' },
  ...photoStore.categories,
])
const currentCategory = computed(() => photoStore.currentCategory)

const leftList = computed(() => photoStore.list.filter((_, i) => i % 2 === 0))
const rightList = computed(() => photoStore.list.filter((_, i) => i % 2 === 1))

onMounted(async () => {
  await photoStore.fetchCategories()
  await photoStore.fetchList(true)
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
  photoStore.fetchList()
})
</script>

<style lang="scss" scoped>
.index {
  min-height: 100vh;
}

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
