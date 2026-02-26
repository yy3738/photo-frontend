<template>
  <view class="search-page">
    <view class="search-input-bar">
      <input
        v-model="keyword"
        placeholder="搜索作品、标签..."
        confirm-type="search"
        @confirm="doSearch"
        focus
      />
      <text class="cancel" @tap="goBack">取消</text>
    </view>

    <!-- 分类/标签筛选 -->
    <view class="filter-area" v-if="!keyword">
      <view class="filter-title">分类</view>
      <view class="filter-tags">
        <text
          v-for="cat in categories"
          :key="cat.id"
          class="filter-tag"
          :class="{ active: selectedCategory === cat.id }"
          @tap="selectCategory(cat.id)"
        >{{ cat.name }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="result-list" v-if="results.length">
      <view
        v-for="item in results"
        :key="item.id"
        class="result-item"
        @tap="goDetail(item.id)"
      >
        <image :src="item.previewUrl" class="thumb" mode="aspectFill" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-price">{{ item.price }} 积分</text>
        </view>
      </view>
    </view>

    <view class="empty" v-else-if="searched">
      <text>没有找到相关作品</text>
    </view>

    <!-- 自定义 tabBar -->
    <CustomTabBar current-tab="search" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { searchPhotos, getCategories } from '@/api/photo.js'
import CustomTabBar from '@/components/CustomTabBar.vue'

const keyword = ref('')
const categories = ref([])
const selectedCategory = ref('')
const results = ref([])
const searched = ref(false)

onMounted(async () => {
  const res = await getCategories()
  categories.value = res ?? []
})

async function doSearch() {
  if (!keyword.value.trim() && !selectedCategory.value) return
  const res = await searchPhotos({ keyword: keyword.value, categoryId: selectedCategory.value })
  results.value = res?.list ?? []
  searched.value = true
}

function selectCategory(id) {
  selectedCategory.value = selectedCategory.value === id ? '' : id
  doSearch()
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-input-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 24rpx;
  gap: 20rpx;

  input {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 28rpx;
    font-size: 28rpx;
  }

  .cancel {
    font-size: 28rpx;
    color: #576b95;
    white-space: nowrap;
  }
}

.filter-area {
  background: #fff;
  padding: 24rpx 32rpx;
  margin-top: 16rpx;

  .filter-title {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .filter-tag {
    padding: 10rpx 24rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #666;
    background: #f5f5f5;

    &.active {
      background: #333;
      color: #fff;
    }
  }
}

.result-list {
  padding: 16rpx;
}

.result-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;

  .thumb {
    width: 160rpx;
    height: 160rpx;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .item-title {
      font-size: 30rpx;
      color: #333;
    }

    .item-price {
      font-size: 26rpx;
      color: #f5a623;
      margin-top: 12rpx;
    }
  }
}

.empty {
  text-align: center;
  padding: 100rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
