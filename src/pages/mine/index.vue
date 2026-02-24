<template>
  <view class="mine-page">
    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn" class="not-login" @tap="goLogin">
      <image src="/static/avatar-default.png" class="default-avatar" mode="aspectFill" />
      <text class="login-tip">点击登录</text>
    </view>

    <!-- 已登录 -->
    <view v-else>
      <!-- 用户信息 -->
      <view class="user-card">
        <image :src="userStore.userInfo.avatar" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo.nickname }}</text>
          <view class="points-row">
            <text class="points-label">积分余额</text>
            <text class="points-value">{{ userStore.points }}</text>
          </view>
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="menu-section">
        <view class="menu-item" @tap="goOrders">
          <text class="menu-label">我的订单</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goLicenses">
          <text class="menu-label">我的授权</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 摄影师入口 -->
      <view class="menu-section">
        <view v-if="!userStore.isPhotographer" class="menu-item" @tap="enablePhotographer">
          <text class="menu-label">开启摄影师模式</text>
          <text class="arrow">›</text>
        </view>
        <template v-else>
          <view class="menu-item" @tap="goStudio">
            <text class="menu-label">摄影师工作台</text>
            <text class="arrow">›</text>
          </view>
        </template>
      </view>

      <!-- 管理员入口 -->
      <view v-if="userStore.isAdmin" class="menu-section">
        <view class="menu-item" @tap="goAdmin">
          <text class="menu-label">管理后台</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 退出 -->
      <view class="menu-section">
        <view class="menu-item danger" @tap="handleLogout">
          <text class="menu-label">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goOrders() {
  uni.navigateTo({ url: '/pages/mine/orders' })
}

function goLicenses() {
  uni.navigateTo({ url: '/pages/mine/licenses' })
}

function goStudio() {
  uni.navigateTo({ url: '/pages/studio/index' })
}

function goAdmin() {
  uni.navigateTo({ url: '/pages/admin/index' })
}

async function enablePhotographer() {
  uni.showModal({
    title: '开启摄影师模式',
    content: '开启后即可上传作品并获得积分收益',
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await userStore.enablePhotographer()
        uni.showToast({ title: '已开启摄影师模式', icon: 'success' })
      } catch {}
    },
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确认退出？',
    success: ({ confirm }) => {
      if (confirm) userStore.doLogout()
    },
  })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.not-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;

  .default-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #ddd;
  }

  .login-tip {
    font-size: 30rpx;
    color: #666;
    margin-top: 20rpx;
  }
}

.user-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 40rpx 32rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
  }

  .user-info {
    margin-left: 24rpx;

    .nickname {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      display: block;
    }

    .points-row {
      display: flex;
      align-items: center;
      margin-top: 12rpx;
      gap: 12rpx;
    }

    .points-label {
      font-size: 26rpx;
      color: #999;
    }

    .points-value {
      font-size: 32rpx;
      font-weight: 700;
      color: #f5a623;
    }
  }
}

.menu-section {
  background: #fff;
  margin-top: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .menu-label {
    font-size: 30rpx;
    color: #333;
  }

  .arrow {
    font-size: 36rpx;
    color: #ccc;
  }

  &.danger .menu-label {
    color: #e74c3c;
  }
}
</style>
