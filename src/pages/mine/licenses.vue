<template>
  <view class="licenses-page">
    <view class="license-list">
      <view v-for="item in list" :key="item.id" class="license-item">
        <image :src="item.photoPreviewUrl" class="thumb" mode="aspectFill" />
        <view class="license-info">
          <text class="photo-title">{{ item.photoTitle }}</text>
          <text class="purpose">用途：{{ purposeLabel(item.purpose) }}</text>
          <text class="status" :class="item.status">{{ statusLabel(item.status) }}</text>
        </view>
        <button
          v-if="item.status === 'approved'"
          class="cert-btn"
          @tap="downloadCert(item.id)"
        >证书</button>
      </view>
    </view>
    <view class="empty" v-if="!list.length"><text>暂无授权申请</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyLicenses } from '@/api/user.js'
import { getLicenseCertUrl } from '@/api/license.js'
import { LICENSE_STATUS, LICENSE_PURPOSE } from '@/constants/index.js'

const list = ref([])

const statusMap = {
  [LICENSE_STATUS.PENDING_ADMIN]: '待审核',
  [LICENSE_STATUS.PENDING_PHOTOGRAPHER]: '待摄影师确认',
  [LICENSE_STATUS.APPROVED]: '已授权',
  [LICENSE_STATUS.REJECTED]: '已拒绝',
}

const statusLabel = (s) => statusMap[s] || s
const purposeLabel = (v) => LICENSE_PURPOSE.find(p => p.value === v)?.label || v

onMounted(async () => {
  list.value = (await getMyLicenses()).list
})

async function downloadCert(id) {
  const { url } = await getLicenseCertUrl(id)
  uni.downloadFile({
    url,
    success: ({ tempFilePath }) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败，请授权相册权限', icon: 'none' }),
      })
    },
  })
}
</script>

<style lang="scss" scoped>
.licenses-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }
.license-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  gap: 16rpx;

  .thumb { width: 120rpx; height: 120rpx; border-radius: 12rpx; flex-shrink: 0; }
  .license-info { flex: 1; }
  .photo-title { font-size: 30rpx; color: #333; display: block; }
  .purpose { font-size: 26rpx; color: #666; display: block; margin-top: 8rpx; }
  .status {
    font-size: 24rpx;
    display: block;
    margin-top: 6rpx;
    &.pending_admin, &.pending_photographer { color: #f39c12; }
    &.approved { color: #07c160; }
    &.rejected { color: #e74c3c; }
  }
  .cert-btn {
    font-size: 26rpx;
    color: #fff;
    background: #07c160;
    border-radius: 32rpx;
    padding: 12rpx 24rpx;
    border: none;
    flex-shrink: 0;
  }
}
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
