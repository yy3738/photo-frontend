<template>
  <view class="admin-index">
    <!-- 待处理 -->
    <view class="pending-card">
      <view class="pending-item" @tap="goWorks">
        <text class="pending-num">{{ dashboard.pendingPhotos ?? 0 }}</text>
        <text class="pending-label">待审核作品</text>
      </view>
      <view class="pending-item" @tap="goLicenses">
        <text class="pending-num">{{ dashboard.pendingLicenses ?? 0 }}</text>
        <text class="pending-label">待审核授权</text>
      </view>
    </view>

    <!-- 数据概览 -->
    <view class="stats-section">
      <view class="stats-row">
        <view class="stat-box">
          <text class="stat-val">{{ dashboard.totalUsers ?? 0 }}</text>
          <text class="stat-lbl">所有用户数量</text>
        </view>
        <view class="stat-box">
          <text class="stat-val">{{ dashboard.totalPhotos ?? 0 }}</text>
          <text class="stat-lbl">所有作品数量</text>
        </view>
      </view>
      <view class="stats-row">
        <!-- <view class="stat-box">
          <text class="stat-val">{{ dashboard.month?.pointsTraded ?? 0 }}</text>
          <text class="stat-lbl">本月积分交易</text>
        </view> -->
        <view class="stat-box">
          <text class="stat-val">{{ dashboard.totalOrders ?? 0 }}</text>
          <text class="stat-lbl">所有交易笔数</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="menu-section">
      <view class="menu-item" @tap="goWorks"><text class="menu-label">作品审核</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goLicenses"><text class="menu-label">授权审核</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goUsers"><text class="menu-label">用户管理</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goCategories"><text class="menu-label">分类标签管理</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goOrgs"><text class="menu-label">组织管理</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goRoles"><text class="menu-label">角色管理</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goMenus"><text class="menu-label">菜单管理</text><text class="arrow">›</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/admin.js'

const dashboard = ref({})

onMounted(async () => {
  dashboard.value = await getDashboard()
})

const goWorks = () => uni.navigateTo({ url: '/pages/admin/works' })
const goLicenses = () => uni.navigateTo({ url: '/pages/admin/licenses' })
const goUsers = () => uni.navigateTo({ url: '/pages/admin/users' })
const goCategories = () => uni.navigateTo({ url: '/pages/admin/categories' })
const goOrgs = () => uni.navigateTo({ url: '/pages/admin/orgs' })
const goRoles = () => uni.navigateTo({ url: '/pages/admin/roles' })
const goMenus = () => uni.navigateTo({ url: '/pages/admin/menus' })
</script>

<style lang="scss" scoped>
.admin-index { min-height: 100vh; background: #f5f5f5; }

.pending-card {
  display: flex;
  background: #e74c3c;
  padding: 40rpx 32rpx;

  .pending-item {
    flex: 1;
    text-align: center;

    .pending-num { display: block; font-size: 56rpx; font-weight: 700; color: #fff; }
    .pending-label { display: block; font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; }
  }
}

.stats-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 24rpx;

  .stats-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
    &:last-child { margin-bottom: 0; }
  }

  .stat-box {
    flex: 1;
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 24rpx;
    text-align: center;

    .stat-val { display: block; font-size: 40rpx; font-weight: 700; color: #333; }
    .stat-lbl { display: block; font-size: 24rpx; color: #999; margin-top: 8rpx; }
  }
}

.menu-section { background: #fff; margin-top: 20rpx; }
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }
  .menu-label { font-size: 30rpx; color: #333; }
  .arrow { font-size: 36rpx; color: #ccc; }
}
</style>
