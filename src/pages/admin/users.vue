<template>
  <view class="users-page">
    <view class="search-bar">
      <input v-model="keyword" placeholder="搜索昵称/手机号" @confirm="doSearch" />
    </view>

    <view class="user-list">
      <view v-for="user in list" :key="user.id" class="user-item">
        <image :src="user.avatar" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ user.nickname }}</text>
          <text class="role">{{ roleLabel(user.role) }}</text>
          <text class="join-time">{{ user.createdAt }}</text>
        </view>
        <view class="user-actions">
          <text
            v-if="!user.isBanned"
            class="action danger"
            @tap="banUser(user)"
          >封禁</text>
          <text
            v-else
            class="action"
            @tap="unbanUser(user)"
          >解封</text>
        </view>
      </view>
    </view>
    <view class="empty" v-if="!list.length"><text>暂无用户</text></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminUsers, banUser as apiBan, unbanUser as apiUnban } from '@/api/admin.js'
import { USER_ROLE } from '@/constants/index.js'

const list = ref([])
const keyword = ref('')

const roleMap = {
  [USER_ROLE.BUYER]: '买家',
  [USER_ROLE.PHOTOGRAPHER]: '摄影师',
  [USER_ROLE.ADMIN]: '管理员',
}
const roleLabel = (r) => roleMap[r] || r

onMounted(() => doSearch())

async function doSearch() {
  list.value = (await getAdminUsers({ keyword: keyword.value })).list
}

function banUser(user) {
  uni.showModal({
    title: '封禁用户',
    content: `确认封禁「${user.nickname}」？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await apiBan(user.id)
      user.isBanned = true
    },
  })
}

function unbanUser(user) {
  uni.showModal({
    title: '解封用户',
    content: `确认解封「${user.nickname}」？`,
    success: async ({ confirm }) => {
      if (!confirm) return
      await apiUnban(user.id)
      user.isBanned = false
    },
  })
}
</script>

<style lang="scss" scoped>
.users-page { min-height: 100vh; background: #f5f5f5; }

.search-bar {
  background: #fff;
  padding: 20rpx 32rpx;

  input {
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 28rpx;
    font-size: 28rpx;
    width: 100%;
  }
}

.user-list { padding: 16rpx; }

.user-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  gap: 20rpx;

  .avatar { width: 96rpx; height: 96rpx; border-radius: 50%; flex-shrink: 0; }
  .user-info { flex: 1; }
  .nickname { font-size: 30rpx; color: #333; display: block; }
  .role { font-size: 24rpx; color: #576b95; display: block; margin-top: 6rpx; }
  .join-time { font-size: 24rpx; color: #ccc; display: block; margin-top: 4rpx; }
  .user-actions { flex-shrink: 0; }
  .action { font-size: 26rpx; color: #576b95; &.danger { color: #e74c3c; } }
}

.empty { text-align: center; padding: 100rpx; font-size: 28rpx; color: #999; }
</style>
