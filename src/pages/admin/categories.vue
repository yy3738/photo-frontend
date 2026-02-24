<template>
  <view class="categories-page">
    <!-- 分类列表 -->
    <view class="section-header">
      <text class="section-title">分类管理</text>
      <text class="add-btn" @tap="showAddCategory">+ 新增</text>
    </view>

    <view class="category-list">
      <view v-for="cat in categories" :key="cat.id" class="category-item">
        <view class="cat-info" @tap="toggleExpand(cat.id)">
          <text class="cat-name">{{ cat.name }}</text>
          <text class="cat-count">{{ cat.tagCount }} 个标签</text>
          <text class="expand-icon">{{ expandedId === cat.id ? '▲' : '▼' }}</text>
        </view>
        <view class="cat-actions">
          <text class="action" @tap="showEditCategory(cat)">编辑</text>
          <text class="action danger" @tap="deleteCategory(cat)">删除</text>
        </view>

        <!-- 标签列表 -->
        <view class="tag-list" v-if="expandedId === cat.id">
          <view v-for="tag in cat.tags" :key="tag.id" class="tag-item">
            <text class="tag-name">{{ tag.name }}</text>
            <view class="tag-actions">
              <text class="action" @tap="showEditTag(tag, cat.id)">编辑</text>
              <text class="action danger" @tap="deleteTag(tag)">删除</text>
            </view>
          </view>
          <view class="add-tag" @tap="showAddTag(cat.id)">+ 添加标签</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getAdminCategories, createCategory, updateCategory, deleteCategory as apiDeleteCategory,
  getAdminTags, createTag, updateTag, deleteTag as apiDeleteTag,
} from '@/api/admin.js'

const categories = ref([])
const expandedId = ref(null)

onMounted(loadData)

async function loadData() {
  const cats = await getAdminCategories()
  // 加载每个分类的标签
  for (const cat of cats) {
    const tags = await getAdminTags({ categoryId: cat.id })
    cat.tags = tags
    cat.tagCount = tags.length
  }
  categories.value = cats
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function showAddCategory() {
  uni.showModal({
    title: '新增分类',
    editable: true,
    placeholderText: '请输入分类名称',
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await createCategory({ name: content.trim() })
      loadData()
    },
  })
}

function showEditCategory(cat) {
  uni.showModal({
    title: '编辑分类',
    editable: true,
    content: cat.name,
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await updateCategory(cat.id, { name: content.trim() })
      loadData()
    },
  })
}

function deleteCategory(cat) {
  uni.showModal({
    title: '删除分类',
    content: `确认删除「${cat.name}」？删除前请确保该分类下无作品。`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await apiDeleteCategory(cat.id)
      loadData()
    },
  })
}

function showAddTag(categoryId) {
  uni.showModal({
    title: '新增标签',
    editable: true,
    placeholderText: '请输入标签名称',
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await createTag({ name: content.trim(), categoryId })
      loadData()
    },
  })
}

function showEditTag(tag, categoryId) {
  uni.showModal({
    title: '编辑标签',
    editable: true,
    content: tag.name,
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await updateTag(tag.id, { name: content.trim(), categoryId })
      loadData()
    },
  })
}

function deleteTag(tag) {
  uni.showModal({
    title: '删除标签',
    content: `确认删除标签「${tag.name}」？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await apiDeleteTag(tag.id)
      loadData()
    },
  })
}
</script>

<style lang="scss" scoped>
.categories-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 8rpx;

  .section-title { font-size: 30rpx; font-weight: 600; color: #333; }
  .add-btn { font-size: 28rpx; color: #576b95; }
}

.category-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.cat-info {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  gap: 16rpx;

  .cat-name { flex: 1; font-size: 30rpx; color: #333; font-weight: 500; }
  .cat-count { font-size: 24rpx; color: #999; }
  .expand-icon { font-size: 24rpx; color: #ccc; }
}

.cat-actions {
  display: flex;
  padding: 0 32rpx 20rpx;
  gap: 32rpx;
}

.action {
  font-size: 26rpx;
  color: #576b95;
  &.danger { color: #e74c3c; }
}

.tag-list {
  border-top: 1rpx solid #f5f5f5;
  padding: 16rpx 32rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f9f9f9;

  .tag-name { font-size: 28rpx; color: #666; }
  .tag-actions { display: flex; gap: 24rpx; }
}

.add-tag {
  font-size: 26rpx;
  color: #576b95;
  padding: 16rpx 0;
  text-align: center;
}
</style>
