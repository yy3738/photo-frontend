<template>
  <view class="apply-page">
    <view class="photo-preview" v-if="photo">
      <image :src="photo.previewUrl" class="thumb" mode="aspectFill" />
      <text class="photo-title">{{ photo.title }}</text>
    </view>

    <view class="form">
      <view class="form-item" @tap="showPurposePicker">
        <text class="label">使用用途 <text class="required">*</text></text>
        <text class="value">{{ selectedPurposeLabel || '请选择用途' }}</text>
      </view>

      <view class="form-item">
        <text class="label">使用场景描述 <text class="required">*</text></text>
        <textarea
          v-model="form.scene"
          placeholder="请描述具体使用场景（200字内）"
          maxlength="200"
        />
        <text class="word-count">{{ form.scene.length }}/200</text>
      </view>

      <view class="form-item">
        <text class="label">使用期限 <text class="required">*</text></text>
        <input v-model="form.duration" placeholder="如：1年、永久" />
      </view>

      <view class="form-item">
        <text class="label">联系方式 <text class="required">*</text></text>
        <input v-model="form.contact" type="number" placeholder="请输入手机号" maxlength="11" />
      </view>
    </view>

    <button class="submit-btn" @tap="handleSubmit" :loading="submitting">提交申请</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPhotoDetail } from '@/api/photo.js'
import { applyLicense } from '@/api/license.js'
import { LICENSE_PURPOSE } from '@/constants/index.js'

const photo = ref(null)
const submitting = ref(false)
const form = ref({ purpose: '', scene: '', duration: '', contact: '' })

const selectedPurposeLabel = computed(() =>
  LICENSE_PURPOSE.find(p => p.value === form.value.purpose)?.label || ''
)

onMounted(async () => {
  const pages = getCurrentPages()
  const photoId = pages[pages.length - 1]?.options?.photoId
  if (photoId) {
    const res = await getPhotoDetail(photoId)
    photo.value = res
    form.value.photoId = photoId
  }
})

function showPurposePicker() {
  uni.showActionSheet({
    itemList: LICENSE_PURPOSE.map(p => p.label),
    success: ({ tapIndex }) => {
      form.value.purpose = LICENSE_PURPOSE[tapIndex].value
    },
  })
}

async function handleSubmit() {
  const { purpose, scene, duration, contact } = form.value
  if (!purpose) return uni.showToast({ title: '请选择使用用途', icon: 'none' })
  if (!scene.trim()) return uni.showToast({ title: '请填写使用场景', icon: 'none' })
  if (!duration.trim()) return uni.showToast({ title: '请填写使用期限', icon: 'none' })
  if (!/^1\d{10}$/.test(contact)) return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })

  submitting.value = true
  try {
    await applyLicense(form.value)
    uni.showToast({ title: '申请已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.apply-page { padding: 24rpx; padding-bottom: 120rpx; }

.photo-preview {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  gap: 20rpx;

  .thumb { width: 100rpx; height: 100rpx; border-radius: 12rpx; }
  .photo-title { font-size: 30rpx; color: #333; flex: 1; }
}

.form { background: #fff; border-radius: 16rpx; overflow: hidden; }
.form-item {
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; .required { color: #e74c3c; } }
  input, textarea { width: 100%; font-size: 28rpx; color: #333; }
  textarea { min-height: 120rpx; }
  .value { font-size: 28rpx; color: #999; }
  .word-count { font-size: 24rpx; color: #ccc; text-align: right; display: block; margin-top: 8rpx; }
}

.submit-btn {
  position: fixed;
  bottom: 40rpx; left: 32rpx; right: 32rpx;
  height: 96rpx;
  background: #333;
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  border: none;
}
</style>
