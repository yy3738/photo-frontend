<template>
  <view class="edit-page" v-if="form.title !== undefined">
    <view class="form">
      <view class="form-item">
        <text class="label">标题 <text class="required">*</text></text>
        <input v-model="form.title" placeholder="作品标题" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="form.description" placeholder="作品描述（选填）" maxlength="500" />
      </view>

      <view class="form-item" @tap="showCategoryPicker">
        <text class="label">分类 <text class="required">*</text></text>
        <text class="value">{{ selectedCategoryName || '请选择分类' }}</text>
      </view>

      <view class="form-item">
        <text class="label">标签（最多5个）</text>
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
        <input v-model.number="form.price" type="number" placeholder="积分价格" />
      </view>

      <view class="form-item switch-item">
        <text class="label">允许授权申请</text>
        <switch :checked="form.allowLicense" @change="form.allowLicense = $event.detail.value" />
      </view>
    </view>

    <button class="submit-btn" @tap="handleSubmit" :loading="submitting">保存修改</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories, getTags } from '@/api/photo.js'
import { getMyPhotoDetail, updatePhoto } from '@/api/studio.js'
import { POINTS } from '@/constants/index.js'

const categories = ref([])
const availableTags = ref([])
const submitting = ref(false)
const photoId = ref(null)

const form = ref({
  title: undefined,
  description: '',
  categoryId: '',
  tagIds: [],
  price: '',
  allowLicense: true,
})

const selectedCategoryName = computed(() =>
  categories.value.find(c => c.id === form.value.categoryId)?.name || ''
)

onMounted(async () => {
  const pages = getCurrentPages()
  photoId.value = pages[pages.length - 1]?.options?.id

  const [cats, detail] = await Promise.all([
    getCategories(),
    getMyPhotoDetail(photoId.value),
  ])
  categories.value = cats

  const p = detail
  form.value = {
    title: p.title,
    description: p.description || '',
    categoryId: p.categoryId,
    tagIds: p.tags.map(t => t.id),
    price: p.price,
    allowLicense: p.allowLicense,
  }

  if (p.categoryId) {
    availableTags.value = await getTags(p.categoryId)
  }
})

async function showCategoryPicker() {
  uni.showActionSheet({
    itemList: categories.value.map(c => c.name),
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
  if (!form.value.title?.trim()) return uni.showToast({ title: '请填写标题', icon: 'none' })
  const price = Number(form.value.price)
  if (!price || price < POINTS.MIN_PRICE || price > POINTS.MAX_PRICE) {
    return uni.showToast({ title: `积分定价需在 ${POINTS.MIN_PRICE}-${POINTS.MAX_PRICE} 之间`, icon: 'none' })
  }

  submitting.value = true
  try {
    await updatePhoto(photoId.value, form.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-page { padding: 24rpx; padding-bottom: 120rpx; }
.form { background: #fff; border-radius: 16rpx; overflow: hidden; }
.form-item {
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; .required { color: #e74c3c; } }
  input, textarea { width: 100%; font-size: 28rpx; color: #333; }
  textarea { min-height: 120rpx; }
  .value { font-size: 28rpx; color: #999; }

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
    &.selected { background: #333; color: #fff; }
  }
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
