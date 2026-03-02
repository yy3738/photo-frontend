<template>
  <view class="admin-licenses">
    <view class="license-list">
      <view v-for="item in list" :key="item.id" class="license-item" @tap="goReview(item.id)">
        <view class="license-info">
          <text class="photo-title">{{ item.photoTitle }}</text>
          <text class="applicant">申请人：{{ item.applicantNickname }}</text>
          <text class="purpose">用途：{{ item.scene }}</text>
          <text class="submit-time">{{ item.createdAt }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
    <view class="empty" v-if="!list.length"><text>暂无待审核授权申请</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAdminLicenses } from '@/api/admin.js'

const list = ref([])

onMounted(async () => {
  await loadList()
  uni.$on('license-review-success', loadList)
})

onUnmounted(() => {
  uni.$off('license-review-success', loadList)
})

async function loadList() {
  list.value = (await getAdminLicenses({ status: 'pending_admin' })).list
}

const goReview = (id) => uni.navigateTo({ url: `/pages/admin/license-review?id=${id}` })
</script>

<style lang="scss" scoped>
.admin-licenses { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }
.license-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
  gap: 16rpx;

  .license-info { flex: 1; }
  .photo-title { font-size: 30rpx; color: #333; display: block; font-weight: 500; }
  .applicant, .purpose { font-size: 26rpx; color: #666; display: block; margin-top: 8rpx; }
  .submit-time { font-size: 24rpx; color: #ccc; display: block; margin-top: 6rpx; }
  .arrow { font-size: 36rpx; color: #ccc; }
}
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
