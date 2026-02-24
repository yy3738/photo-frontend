<template>
  <view class="roles-page">
    <view class="section-header">
      <text class="section-title">角色管理</text>
      <text class="add-btn" @tap="goAdd">+ 新增</text>
    </view>

    <view class="role-list">
      <view v-for="role in list" :key="role.id" class="role-item">
        <view class="role-info">
          <text class="role-name">{{ role.name }}</text>
          <text class="role-code">{{ role.code }}</text>
          <text class="role-status" :class="{ disabled: !role.status }">{{ role.status ? '启用' : '禁用' }}</text>
        </view>
        <view class="role-actions">
          <text class="action" @tap="goEdit(role)">编辑</text>
          <text class="action" @tap="handleToggleStatus(role)">{{ role.status ? '禁用' : '启用' }}</text>
          <text class="action danger" @tap="handleDelete(role)">删除</text>
        </view>
      </view>
    </view>

    <view class="empty" v-if="!list.length"><text>暂无角色</text></view>

    <!-- 新增/编辑弹窗 -->
    <view class="modal-mask" v-if="formVisible" @tap.self="formVisible = false">
      <view class="modal">
        <text class="modal-title">{{ editingRole ? '编辑角色' : '新增角色' }}</text>
        <view class="form-row">
          <text class="form-label">名称</text>
          <input v-model="form.name" placeholder="角色名称" />
        </view>
        <view class="form-row">
          <text class="form-label">编码</text>
          <input v-model="form.code" placeholder="角色编码（唯一）" />
        </view>
        <view class="form-row">
          <text class="form-label">备注</text>
          <input v-model="form.remark" placeholder="备注（选填）" />
        </view>
        <button class="modal-confirm" @tap="handleSubmit" :loading="submitting">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRoles, createRole, updateRole, toggleRoleStatus, deleteRole } from '@/api/rbac.js'

const list = ref([])
const formVisible = ref(false)
const editingRole = ref(null)
const submitting = ref(false)
const form = ref({ name: '', code: '', remark: '', sort: 0, menuIds: [] })

onMounted(loadData)

async function loadData() {
  const res = await getRoles({ page: 1, pageSize: 100 })
  list.value = res.list
}

function goAdd() {
  editingRole.value = null
  form.value = { name: '', code: '', remark: '', sort: 0, menuIds: [] }
  formVisible.value = true
}

function goEdit(role) {
  editingRole.value = role
  form.value = { name: role.name, code: role.code, remark: role.remark || '', sort: role.sort, menuIds: role.menuIds || [] }
  formVisible.value = true
}

async function handleSubmit() {
  if (!form.value.name.trim()) return uni.showToast({ title: '请输入角色名称', icon: 'none' })
  if (!form.value.code.trim()) return uni.showToast({ title: '请输入角色编码', icon: 'none' })

  submitting.value = true
  try {
    if (editingRole.value) {
      await updateRole(editingRole.value.id, form.value)
    } else {
      await createRole(form.value)
    }
    formVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

function handleToggleStatus(role) {
  const newStatus = role.status ? 0 : 1
  const label = newStatus ? '启用' : '禁用'
  uni.showModal({
    title: `${label}角色`,
    content: `确认${label}「${role.name}」？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await toggleRoleStatus(role.id, newStatus)
      loadData()
    },
  })
}

function handleDelete(role) {
  uni.showModal({
    title: '删除角色',
    content: `确认删除「${role.name}」？已分配给用户的角色无法删除。`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await deleteRole(role.id)
      loadData()
    },
  })
}
</script>

<style lang="scss" scoped>
.roles-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 8rpx;
  .section-title { font-size: 30rpx; font-weight: 600; color: #333; }
  .add-btn { font-size: 28rpx; color: #576b95; }
}

.role-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;

  .role-info { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
  .role-name { font-size: 30rpx; color: #333; font-weight: 500; }
  .role-code { font-size: 24rpx; color: #576b95; background: #f0f4ff; padding: 4rpx 16rpx; border-radius: 16rpx; }
  .role-status { font-size: 24rpx; color: #07c160; &.disabled { color: #999; } }
  .role-actions { display: flex; gap: 32rpx; }
}

.action { font-size: 26rpx; color: #576b95; &.danger { color: #e74c3c; } }
.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }

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
  .form-row {
    margin-bottom: 20rpx;
    .form-label { font-size: 26rpx; color: #999; display: block; margin-bottom: 8rpx; }
    input { width: 100%; height: 72rpx; background: #f5f5f5; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; }
  }
  .modal-confirm {
    width: 100%; height: 88rpx; background: #333; color: #fff;
    border-radius: 44rpx; font-size: 30rpx; border: none; margin-top: 16rpx;
  }
}
</style>
