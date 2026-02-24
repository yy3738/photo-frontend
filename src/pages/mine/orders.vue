<template>
  <view class="orders-page">
    <view class="order-list">
      <view v-for="item in list" :key="item.id" class="order-item">
        <image :src="item.photoPreviewUrl" class="thumb" mode="aspectFill" @tap="goDetail(item.photoId)" />
        <view class="order-info">
          <text class="order-title">{{ item.photoTitle }}</text>
          <text class="order-price">{{ item.price }} 积分</text>
          <text class="order-time">{{ item.createdAt }}</text>
        </view>
        <button class="download-btn" @tap="handleDownload(item.photoId)">下载</button>
      </view>
    </view>
    <view class="empty" v-if="!list.length"><text>暂无购买记录</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyOrders } from '@/api/user.js'
import { getDownloadUrl } from '@/api/photo.js'

const list = ref([])

onMounted(async () => {
  list.value = (await getMyOrders()).list
})

const goDetail = (id) => uni.navigateTo({ url: `/pages/detail/index?id=${id}` })

async function handleDownload(photoId) {
  const { url } = await getDownloadUrl(photoId)
  uni.downloadFile({
    url,
    success: ({ tempFilePath }) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
      })
    },
  })
}
</script>

<style lang="scss" scoped>
.orders-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }
.order-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  gap: 16rpx;

  .thumb { width: 120rpx; height: 120rpx; border-radius: 12rpx; flex-shrink: 0; }
  .order-info { flex: 1; }
  .order-title { font-size: 30rpx; color: #333; display: block; }
  .order-price { font-size: 26rpx; color: #f5a623; display: block; margin-top: 8rpx; }
  .order-time { font-size: 24rpx; color: #ccc; display: block; margin-top: 6rpx; }
  .download-btn {
    font-size: 26rpx;
    color: #fff;
    background: #333;
    border-radius: 32rpx;
    padding: 12rpx 28rpx;
    border: none;
    flex-shrink: 0;
  }
}
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
