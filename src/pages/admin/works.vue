<template>
  <view class="admin-works">
    <view class="work-list">
      <view v-for="item in list" :key="item.id" class="work-item" @tap="goReview(item.id)">
        <image :src="item.previewUrl" class="thumb" mode="aspectFill" />
        <view class="work-info">
          <text class="work-title">{{ item.title }}</text>
          <text class="photographer">{{ item.photographer.nickname }}</text>
          <text class="submit-time">{{ item.createdAt }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
    <view class="empty" v-if="!list.length && !loading"><text>暂无待审核作品</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminPhotos } from '@/api/admin.js'

const list = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  list.value = (await getAdminPhotos({ status: 'pending' })).list
  loading.value = false
})

const goReview = (id) => uni.navigateTo({ url: `/pages/admin/work-review?id=${id}` })
</script>

<style lang="scss" scoped>
.admin-works { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }
.work-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  gap: 16rpx;

  .thumb { width: 120rpx; height: 120rpx; border-radius: 12rpx; flex-shrink: 0; }
  .work-info { flex: 1; }
  .work-title { font-size: 30rpx; color: #333; display: block; }
  .photographer { font-size: 26rpx; color: #999; display: block; margin-top: 8rpx; }
  .submit-time { font-size: 24rpx; color: #ccc; display: block; margin-top: 6rpx; }
  .arrow { font-size: 36rpx; color: #ccc; }
}
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
