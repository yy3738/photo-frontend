<template>
  <view class="license-review-page" v-if="license">
    <view class="info-card">
      <view class="info-row">
        <text class="info-label">申请人</text>
        <text class="info-value">{{ license.applicant.nickname }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">作品</text>
        <text class="info-value">{{ license.photoTitle }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">使用用途</text>
        <text class="info-value">{{ purposeLabel(license.purpose) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">使用场景</text>
        <text class="info-value">{{ license.scene }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">使用期限</text>
        <text class="info-value">{{ license.duration }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">联系方式</text>
        <text class="info-value">{{ license.contact }}</text>
      </view>
    </view>

    <view class="action-bar">
      <button class="btn-reject" @tap="showRejectModal">拒绝</button>
      <button class="btn-approve" @tap="handleApprove" :loading="submitting">通过</button>
    </view>

    <view class="modal-mask" v-if="rejectVisible" @tap.self="rejectVisible = false">
      <view class="modal">
        <text class="modal-title">填写拒绝原因</text>
        <textarea v-model="rejectReason" placeholder="请填写拒绝原因" maxlength="200" />
        <button class="modal-confirm" @tap="handleReject" :loading="submitting">确认拒绝</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reviewAdminLicense } from '@/api/admin.js'
import { getLicenseDetail } from '@/api/license.js'
import { LICENSE_PURPOSE } from '@/constants/index.js'

const license = ref(null)
const submitting = ref(false)
const rejectVisible = ref(false)
const rejectReason = ref('')

const purposeLabel = (v) => LICENSE_PURPOSE.find(p => p.value === v)?.label || v

onMounted(async () => {
  const pages = getCurrentPages()
  const id = pages[pages.length - 1]?.options?.id
  license.value = await getLicenseDetail(id)
})

async function handleApprove() {
  submitting.value = true
  try {
    await reviewAdminLicense(license.value.id, { action: 'approve' })
    uni.showToast({ title: '已通过', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}

async function handleReject() {
  if (!rejectReason.value.trim()) return uni.showToast({ title: '请填写拒绝原因', icon: 'none' })
  submitting.value = true
  try {
    await reviewAdminLicense(license.value.id, { action: 'reject', rejectReason: rejectReason.value })
    rejectVisible.value = false
    uni.showToast({ title: '已拒绝', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}

const showRejectModal = () => { rejectReason.value = ''; rejectVisible.value = true }
</script>

<style lang="scss" scoped>
.license-review-page { padding: 24rpx; padding-bottom: 140rpx; }
.info-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.info-row {
  display: flex;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .info-label { width: 160rpx; font-size: 28rpx; color: #999; flex-shrink: 0; }
  .info-value { flex: 1; font-size: 28rpx; color: #333; }
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

  button { flex: 1; height: 88rpx; border-radius: 44rpx; font-size: 30rpx; border: none; }
  .btn-reject { background: #f5f5f5; color: #333; }
  .btn-approve { background: #07c160; color: #fff; }
}
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: flex-end;
}
.modal {
  background: #fff; width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

  .modal-title { font-size: 32rpx; font-weight: 600; color: #333; display: block; margin-bottom: 24rpx; }
  textarea { width: 100%; min-height: 160rpx; font-size: 28rpx; background: #f5f5f5; border-radius: 12rpx; padding: 20rpx; }
  .modal-confirm {
    width: 100%; height: 88rpx; background: #e74c3c; color: #fff;
    border-radius: 44rpx; font-size: 30rpx; border: none; margin-top: 24rpx;
  }
}
</style>
