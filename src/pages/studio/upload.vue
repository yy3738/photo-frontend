<template>
  <view class="upload-page">
    <!-- 图片选择区 -->
    <view class="image-picker">
      <view
        v-for="(img, i) in images"
        :key="i"
        class="img-item"
      >
        <image :src="img.path" mode="aspectFill" />
        <view class="remove" @tap="removeImage(i)">×</view>
        <view class="progress" v-if="img.progress < 100">
          <view class="progress-bar" :style="{ width: img.progress + '%' }" />
        </view>
      </view>
      <view class="add-btn" v-if="images.length < 9" @tap="chooseImages">
        <text class="add-icon">+</text>
        <text class="add-text">添加图片</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form-item">
        <text class="label">标题 <text class="required">*</text></text>
        <input v-model="form.title" placeholder="请输入作品标题（50字内）" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="form.description" placeholder="作品描述（选填，500字内）" maxlength="500" />
      </view>

      <view class="form-item" @tap="showCategoryPicker">
        <text class="label">分类 <text class="required">*</text></text>
        <text class="value">{{ selectedCategoryName || '请选择分类' }}</text>
      </view>

      <view class="form-item">
        <text class="label">标签 <text class="required">*</text>（最多5个）</text>
        <view class="tags-area">
          <text
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag"
            :class="{ selected: form.tagIds.includes(tag.id) }"
            @tap="toggleTag(tag.id)"
          >{{ tag.name }}</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">积分定价 <text class="required">*</text></text>
        <input v-model.number="form.price" type="number" placeholder="请输入积分价格（10-9999）" />
      </view>

      <view class="form-item switch-item">
        <text class="label">允许授权申请</text>
        <switch :checked="form.allowLicense" @change="form.allowLicense = $event.detail.value" />
      </view>
    </view>

    <button class="submit-btn" @tap="handleSubmit" :loading="submitting">提交审核</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories, getTags } from '@/api/photo.js'
import { createPhoto } from '@/api/studio.js'
import { uploadImage } from '@/utils/upload.js'
import { POINTS } from '@/constants/index.js'

const images = ref([])
const categories = ref([])
const availableTags = ref([])
const submitting = ref(false)

const form = ref({
  title: '',
  description: '',
  categoryId: '',
  tagIds: [],
  price: '',
  allowLicense: true,
})

const selectedCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === form.value.categoryId)
  return cat?.name || ''
})

onMounted(async () => {
  categories.value = await getCategories()
})

async function chooseImages() {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['original'],
    sourceType: ['album', 'camera'],
    success: ({ tempFilePaths }) => {
      tempFilePaths.forEach(path => {
        images.value.push({ path, progress: 0, ossKey: null })
      })
    },
  })
}

function removeImage(i) {
  images.value.splice(i, 1)
}

function showCategoryPicker() {
  const items = categories.value.map(c => c.name)
  uni.showActionSheet({
    itemList: items,
    success: async ({ tapIndex }) => {
      form.value.categoryId = categories.value[tapIndex].id
      form.value.tagIds = []
      availableTags.value = await getTags(form.value.categoryId)
    },
  })
}

function toggleTag(id) {
  const idx = form.value.tagIds.indexOf(id)
  if (idx > -1) {
    form.value.tagIds.splice(idx, 1)
  } else if (form.value.tagIds.length < 5) {
    form.value.tagIds.push(id)
  } else {
    uni.showToast({ title: '最多选择5个标签', icon: 'none' })
  }
}

async function handleSubmit() {
  if (!images.value.length) return uni.showToast({ title: '请选择图片', icon: 'none' })
  if (!form.value.title.trim()) return uni.showToast({ title: '请填写标题', icon: 'none' })
  if (!form.value.categoryId) return uni.showToast({ title: '请选择分类', icon: 'none' })
  if (!form.value.tagIds.length) return uni.showToast({ title: '请选择标签', icon: 'none' })
  const price = Number(form.value.price)
  if (!price || price < POINTS.MIN_PRICE || price > POINTS.MAX_PRICE) {
    return uni.showToast({ title: `积分定价需在 ${POINTS.MIN_PRICE}-${POINTS.MAX_PRICE} 之间`, icon: 'none' })
  }

  submitting.value = true
  try {
    // 上传图片（每张上传预览图 + 原图）
    for (let i = 0; i < images.value.length; i++) {
      const previewKey = await uploadImage(images.value[i].path, {
        compress: true,
        quality: 80,
        type: 'preview',
        onProgress: (p) => { images.value[i].progress = Math.round(p / 2) },
      })
      const originalKey = await uploadImage(images.value[i].path, {
        compress: false,
        type: 'original',
        onProgress: (p) => { images.value[i].progress = 50 + Math.round(p / 2) },
      })
      images.value[i].previewKey = previewKey
      images.value[i].originalKey = originalKey
      images.value[i].progress = 100
    }

    // 逐张提交作品
    for (let i = 0; i < images.value.length; i++) {
      await createPhoto({
        ...form.value,
        previewKey: images.value[i].previewKey,
        originalKey: images.value[i].originalKey,
      })
    }
    uni.showToast({ title: '提交成功，等待审核', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch {
    // 错误已在 request.js 中处理
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.upload-page {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.image-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .img-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    overflow: hidden;

    image { width: 100%; height: 100%; }

    .remove {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
    }

    .progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6rpx;
      background: rgba(0,0,0,0.2);

      .progress-bar {
        height: 100%;
        background: #07c160;
        transition: width 0.2s;
      }
    }
  }

  .add-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .add-icon { font-size: 60rpx; color: #ccc; }
    .add-text { font-size: 24rpx; color: #999; margin-top: 8rpx; }
  }
}

.form {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.form-item {
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child { border-bottom: none; }

  .label {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 16rpx;

    .required { color: #e74c3c; }
  }

  input, textarea {
    width: 100%;
    font-size: 28rpx;
    color: #333;
  }

  textarea { min-height: 120rpx; }

  .value {
    font-size: 28rpx;
    color: #999;
  }

  &.switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .label { margin-bottom: 0; }
  }
}

.tags-area {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .tag {
    padding: 10rpx 24rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #666;
    background: #f5f5f5;

    &.selected {
      background: #333;
      color: #fff;
    }
  }
}

.submit-btn {
  position: fixed;
  bottom: 40rpx;
  left: 32rpx;
  right: 32rpx;
  height: 96rpx;
  background: #333;
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  border: none;
}
</style>
