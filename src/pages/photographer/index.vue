<template>
  <view class="photographer-page">
    <view class="pg-header" v-if="info">
      <image :src="info.avatar" class="avatar" mode="aspectFill" />
      <text class="nickname">{{ info.nickname }}</text>
      <text class="works-count">{{ info.worksCount }} 件作品</text>
    </view>

    <view class="waterfall">
      <view class="column">
        <view v-for="item in leftList" :key="item.id" class="photo-card" @tap="goDetail(item.id)">
          <image :src="item.previewUrl" mode="widthFix" lazy-load />
          <view class="card-info">
            <text class="title">{{ item.title }}</text>
            <text class="price">{{ item.price }} 积分</text>
          </view>
        </view>
      </view>
      <view class="column">
        <view v-for="item in rightList" :key="item.id" class="photo-card" @tap="goDetail(item.id)">
          <image :src="item.previewUrl" mode="widthFix" lazy-load />
          <view class="card-info">
            <text class="title">{{ item.title }}</text>
            <text class="price">{{ item.price }} 积分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPhotos } from '@/api/photo.js'
import { getMe } from '@/api/user.js'
import { http } from '@/utils/request.js'

const info = ref(null)
const photos = ref([])

const leftList = computed(() => photos.value.filter((_, i) => i % 2 === 0))
const rightList = computed(() => photos.value.filter((_, i) => i % 2 === 1))

onMounted(async () => {
  const pages = getCurrentPages()
  const id = pages[pages.length - 1]?.options?.id
  const [pgInfo, photoRes] = await Promise.all([
    http.get(`/user/${id}`),
    getPhotos({ photographerId: id }),
  ])
  info.value = pgInfo
  photos.value = photoRes.list
})

const goDetail = (id) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
</script>

<style lang="scss" scoped>
.photographer-page { min-height: 100vh; background: #f5f5f5; }

.pg-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 48rpx 32rpx;

  .avatar { width: 140rpx; height: 140rpx; border-radius: 50%; }
  .nickname { font-size: 36rpx; font-weight: 600; color: #333; margin-top: 20rpx; }
  .works-count { font-size: 26rpx; color: #999; margin-top: 8rpx; }
}

.waterfall {
  display: flex;
  padding: 16rpx 12rpx 0;
  gap: 12rpx;

  .column { flex: 1; display: flex; flex-direction: column; gap: 12rpx; }
}

.photo-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  image { width: 100%; display: block; }
  .card-info { padding: 12rpx 16rpx; }
  .title { font-size: 26rpx; color: #333; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .price { font-size: 24rpx; color: #f5a623; margin-top: 6rpx; display: block; }
}
</style>
