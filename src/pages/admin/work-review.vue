<template>
  <view class="review-page" v-if="photo">
    <image :src="photo.previewUrl" mode="widthFix" class="preview" />
    <view class="info-card">
      <text class="title">{{ photo.title }}</text>
      <text class="desc">{{ photo.description }}</text>
      <view class="meta">
        <text>分类：{{ photo.categoryName }}</text>
        <text>摄影师：{{ photo.photographer.nickname }}</text>
        <text>定价：{{ photo.price }} 积分</text>
      </view>
    </view>

    <view class="action-bar">
      <button class="btn-reject" @tap="showRejectModal">拒绝</button>
      <button class="btn-approve" @tap="handleApprove" :loading="submitting">通过</button>
    </view>

    <!-- 拒绝原因弹窗 -->
    <view class="modal-mask" v-if="rejectVisible" @tap.self="rejectVisible = false">
      <view class="modal">
        <text class="modal-title">选择拒绝原因</text>
        <view
          v-for="r in REJECT_REASONS"
          :key="r.value"
          class="reason-item"
          :class="{ selected: rejectReason === r.value }"
          @tap.stop="rejectReason = r.value"
        >{{ r.label }}</view>
        <button class="modal-confirm" @tap="handleReject" :loading="submitting">确认拒绝</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reviewPhoto } from '@/api/admin.js'
import { http } from '@/utils/request.js'
import { REJECT_REASONS } from '@/constants/index.js'

const photo = ref(null)
const submitting = ref(false)
const rejectVisible = ref(false)
const rejectReason = ref('')

onMounted(async () => {
  const pages = getCurrentPages()
  const id = pages[pages.length - 1]?.options?.id
  photo.value = await http.get(`/admin/photos/${id}`)
})

function showRejectModal() {
  rejectReason.value = ''
  rejectVisible.value = true
}

async function handleApprove() {
  submitting.value = true
  try {
    await reviewPhoto(photo.value.id, { action: 'approve' })
    uni.showToast({ title: '已通过', icon: 'success' })
    uni.$emit('photo-reviewed')
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}

async function handleReject() {
  if (!rejectReason.value) {
    uni.showToast({ title: '请选择拒绝原因', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await reviewPhoto(photo.value.id, { action: 'reject', rejectReason: rejectReason.value })
    rejectVisible.value = false
    uni.showToast({ title: '已拒绝', icon: 'success' })
    uni.$emit('photo-reviewed')
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.review-page { padding-bottom: 140rpx; }
.preview { width: 100%; display: block; }
.info-card {
  background: #fff;
  padding: 32rpx;
  margin-top: 16rpx;
  .title { font-size: 34rpx; font-weight: 600; color: #333; display: block; }
  .desc { font-size: 28rpx; color: #666; margin-top: 12rpx; display: block; }
  .meta { margin-top: 16rpx; display: flex; flex-direction: column; gap: 8rpx; font-size: 26rpx; color: #999; }
}
.action-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display: flex;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  gap: 24rpx;
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.06);

  button {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
  }
  .btn-reject { background: #f5f5f5; color: #333; }
  .btn-approve { background: #07c160; color: #fff; }
}
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
}
.modal {
  background: #fff;
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

  .modal-title { font-size: 32rpx; font-weight: 600; color: #333; display: block; margin-bottom: 24rpx; }
  .reason-item {
    padding: 24rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    background: #f5f5f5;
    &.selected { background: #333; color: #fff; }
  }
  .modal-confirm {
    width: 100%;
    height: 88rpx;
    background: #e74c3c;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
    margin-top: 16rpx;
  }
}
</style>
