<template>
  <view class="orgs-page">
    <view class="section-header">
      <text class="section-title">组织管理</text>
      <text class="add-btn" @tap="showAddOrg()">+ 新增</text>
    </view>

    <view class="org-tree">
      <view v-for="org in orgTree" :key="org.id" class="org-node">
        <view class="org-item">
          <text class="org-name">{{ org.name }}</text>
          <text class="org-status" :class="{ disabled: !org.status }">{{ org.status ? '启用' : '禁用' }}</text>
          <view class="org-actions">
            <text class="action" @tap="showAddOrg(org.id)">添加子级</text>
            <text class="action" @tap="showEditOrg(org)">编辑</text>
            <text class="action" @tap="handleToggleStatus(org)">{{ org.status ? '禁用' : '启用' }}</text>
            <text class="action danger" @tap="handleDeleteOrg(org)">删除</text>
          </view>
        </view>
        <!-- 子组织 -->
        <view v-if="org.children?.length" class="org-children">
          <view v-for="child in org.children" :key="child.id" class="org-item child">
            <text class="org-name">{{ child.name }}</text>
            <text class="org-status" :class="{ disabled: !child.status }">{{ child.status ? '启用' : '禁用' }}</text>
            <view class="org-actions">
              <text class="action" @tap="showEditOrg(child)">编辑</text>
              <text class="action" @tap="handleToggleStatus(child)">{{ child.status ? '禁用' : '启用' }}</text>
              <text class="action danger" @tap="handleDeleteOrg(child)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-if="!orgTree.length"><text>暂无组织</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrgTree, createOrg, updateOrg, toggleOrgStatus, deleteOrg } from '@/api/rbac.js'

const orgTree = ref([])

onMounted(loadData)

async function loadData() {
  orgTree.value = await getOrgTree()
}

function showAddOrg(parentId = '0') {
  uni.showModal({
    title: '新增组织',
    editable: true,
    placeholderText: '请输入组织名称',
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await createOrg({ name: content.trim(), parentId, sort: 0 })
      loadData()
    },
  })
}

function showEditOrg(org) {
  uni.showModal({
    title: '编辑组织',
    editable: true,
    content: org.name,
    success: async ({ confirm, content }) => {
      if (!confirm || !content?.trim()) return
      await updateOrg(org.id, { name: content.trim(), parentId: org.parentId, sort: org.sort })
      loadData()
    },
  })
}

function handleToggleStatus(org) {
  const newStatus = org.status ? 0 : 1
  const label = newStatus ? '启用' : '禁用'
  uni.showModal({
    title: `${label}组织`,
    content: `确认${label}「${org.name}」？${!newStatus ? '子组织将一并禁用。' : ''}`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await toggleOrgStatus(org.id, newStatus)
      loadData()
    },
  })
}

function handleDeleteOrg(org) {
  uni.showModal({
    title: '删除组织',
    content: `确认删除「${org.name}」？组织下有用户或子组织时无法删除。`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await deleteOrg(org.id)
      loadData()
    },
  })
}
</script>

<style lang="scss" scoped>
.orgs-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 8rpx;
  .section-title { font-size: 30rpx; font-weight: 600; color: #333; }
  .add-btn { font-size: 28rpx; color: #576b95; }
}

.org-node {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.org-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  flex-wrap: wrap;
  gap: 12rpx;

  &.child { padding-left: 64rpx; background: #fafafa; }

  .org-name { font-size: 30rpx; color: #333; font-weight: 500; flex: 1; }
  .org-status { font-size: 24rpx; color: #07c160; &.disabled { color: #999; } }
  .org-actions { display: flex; gap: 24rpx; width: 100%; }
}

.action { font-size: 26rpx; color: #576b95; &.danger { color: #e74c3c; } }
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
