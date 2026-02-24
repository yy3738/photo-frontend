<template>
  <view class="menus-page">
    <view class="section-header">
      <text class="section-title">菜单管理</text>
      <text class="add-btn" @tap="showAdd()">+ 新增</text>
    </view>

    <view class="menu-tree">
      <template v-for="menu in menuTree" :key="menu.id">
        <view class="menu-node level-0">
          <view class="menu-item">
            <text class="menu-icon">{{ typeIcon(menu.type) }}</text>
            <text class="menu-name">{{ menu.name }}</text>
            <text class="menu-type">{{ typeLabel(menu.type) }}</text>
            <text class="menu-path" v-if="menu.path">{{ menu.path }}</text>
          </view>
          <view class="menu-actions">
            <text class="action" @tap="showAdd(menu.id)">添加子级</text>
            <text class="action" @tap="showEdit(menu)">编辑</text>
            <text class="action danger" @tap="handleDelete(menu)">删除</text>
          </view>
        </view>
        <!-- 二级 -->
        <template v-for="child in menu.children || []" :key="child.id">
          <view class="menu-node level-1">
            <view class="menu-item">
              <text class="menu-icon">{{ typeIcon(child.type) }}</text>
              <text class="menu-name">{{ child.name }}</text>
              <text class="menu-type">{{ typeLabel(child.type) }}</text>
              <text class="menu-path" v-if="child.path">{{ child.path }}</text>
              <text class="menu-perm" v-if="child.permission">{{ child.permission }}</text>
            </view>
            <view class="menu-actions">
              <text class="action" @tap="showAdd(child.id)">添加子级</text>
              <text class="action" @tap="showEdit(child)">编辑</text>
              <text class="action danger" @tap="handleDelete(child)">删除</text>
            </view>
          </view>
          <!-- 三级（按钮） -->
          <view v-for="btn in child.children || []" :key="btn.id" class="menu-node level-2">
            <view class="menu-item">
              <text class="menu-icon">{{ typeIcon(btn.type) }}</text>
              <text class="menu-name">{{ btn.name }}</text>
              <text class="menu-perm" v-if="btn.permission">{{ btn.permission }}</text>
            </view>
            <view class="menu-actions">
              <text class="action" @tap="showEdit(btn)">编辑</text>
              <text class="action danger" @tap="handleDelete(btn)">删除</text>
            </view>
          </view>
        </template>
      </template>
    </view>

    <view class="empty" v-if="!menuTree.length"><text>暂无菜单</text></view>

    <!-- 新增/编辑弹窗 -->
    <view class="modal-mask" v-if="formVisible" @tap.self="formVisible = false">
      <view class="modal">
        <text class="modal-title">{{ editing ? '编辑菜单' : '新增菜单' }}</text>
        <view class="form-row">
          <text class="form-label">名称</text>
          <input v-model="form.name" placeholder="菜单名称" />
        </view>
        <view class="form-row">
          <text class="form-label">类型</text>
          <view class="type-picker">
            <text
              v-for="t in menuTypes"
              :key="t.value"
              class="type-option"
              :class="{ active: form.type === t.value }"
              @tap="form.type = t.value"
            >{{ t.label }}</text>
          </view>
        </view>
        <view class="form-row" v-if="form.type === 'menu'">
          <text class="form-label">路由路径</text>
          <input v-model="form.path" placeholder="/admin/users" />
        </view>
        <view class="form-row" v-if="form.type === 'button'">
          <text class="form-label">权限标识</text>
          <input v-model="form.permission" placeholder="如 photo:review" />
        </view>
        <button class="modal-confirm" @tap="handleSubmit" :loading="submitting">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/rbac.js'

const menuTree = ref([])
const formVisible = ref(false)
const editing = ref(null)
const submitting = ref(false)
const parentId = ref('0')

const menuTypes = [
  { label: '目录', value: 'dir' },
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' },
]

const form = ref({ name: '', type: 'dir', path: '', permission: '', icon: '', sort: 0 })

const typeLabel = (t) => ({ dir: '目录', menu: '菜单', button: '按钮' }[t] || t)
const typeIcon = (t) => ({ dir: '📁', menu: '📄', button: '🔘' }[t] || '·')

onMounted(loadData)

async function loadData() {
  menuTree.value = await getMenuTree()
}

function showAdd(pid = '0') {
  editing.value = null
  parentId.value = pid
  form.value = { name: '', type: 'dir', path: '', permission: '', icon: '', sort: 0 }
  formVisible.value = true
}

function showEdit(menu) {
  editing.value = menu
  parentId.value = menu.parentId
  form.value = {
    name: menu.name,
    type: menu.type,
    path: menu.path || '',
    permission: menu.permission || '',
    icon: menu.icon || '',
    sort: menu.sort,
  }
  formVisible.value = true
}

async function handleSubmit() {
  if (!form.value.name.trim()) return uni.showToast({ title: '请输入菜单名称', icon: 'none' })

  submitting.value = true
  try {
    const data = { ...form.value, parentId: parentId.value }
    if (editing.value) {
      await updateMenu(editing.value.id, data)
    } else {
      await createMenu(data)
    }
    formVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

function handleDelete(menu) {
  uni.showModal({
    title: '删除菜单',
    content: `确认删除「${menu.name}」？有子菜单时无法删除。`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await deleteMenu(menu.id)
      loadData()
    },
  })
}
</script>

<style lang="scss" scoped>
.menus-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 8rpx;
  .section-title { font-size: 30rpx; font-weight: 600; color: #333; }
  .add-btn { font-size: 28rpx; color: #576b95; }
}

.menu-node {
  background: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &.level-1 { padding-left: 64rpx; background: #fafafa; }
  &.level-2 { padding-left: 96rpx; background: #f5f5f5; }

  .menu-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .menu-icon { font-size: 28rpx; }
  .menu-name { font-size: 28rpx; color: #333; font-weight: 500; }
  .menu-type { font-size: 22rpx; color: #576b95; background: #f0f4ff; padding: 2rpx 12rpx; border-radius: 12rpx; }
  .menu-path { font-size: 22rpx; color: #999; }
  .menu-perm { font-size: 22rpx; color: #f5a623; background: #fff8ee; padding: 2rpx 12rpx; border-radius: 12rpx; }
  .menu-actions { display: flex; gap: 24rpx; }
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
  .type-picker {
    display: flex; gap: 16rpx;
    .type-option {
      padding: 12rpx 28rpx; border-radius: 28rpx; font-size: 26rpx;
      color: #666; background: #f5f5f5;
      &.active { background: #333; color: #fff; }
    }
  }
  .modal-confirm {
    width: 100%; height: 88rpx; background: #333; color: #fff;
    border-radius: 44rpx; font-size: 30rpx; border: none; margin-top: 16rpx;
  }
}
</style>
