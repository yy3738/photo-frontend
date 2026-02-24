<template>
  <view class="studio-page">
    <!-- 数据概览 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ overview.totalEarned ?? '-' }}</text>
        <text class="stat-label">总积分收益</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ overview.monthEarned ?? '-' }}</text>
        <text class="stat-label">本月收益</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ overview.currentPoints ?? '-' }}</text>
        <text class="stat-label">当前余额</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="menu-section">
      <view class="menu-item" @tap="goUpload">
        <text class="menu-label">上传作品</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goWorks">
        <text class="menu-label">我的作品</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goEarnings">
        <text class="menu-label">积分收益</text>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEarningsOverview } from '@/api/studio.js'

const overview = ref({})

onMounted(async () => {
  overview.value = await getEarningsOverview()
})

const goUpload = () => uni.navigateTo({ url: '/pages/studio/upload' })
const goWorks = () => uni.navigateTo({ url: '/pages/studio/works' })
const goEarnings = () => uni.navigateTo({ url: '/pages/studio/earnings' })
</script>

<style lang="scss" scoped>
.studio-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.stats-card {
  display: flex;
  background: #333;
  padding: 48rpx 32rpx;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-value {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: rgba(255,255,255,0.6);
      margin-top: 8rpx;
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

  &:last-child { border-bottom: none; }

  .menu-label { font-size: 30rpx; color: #333; }
  .arrow { font-size: 36rpx; color: #ccc; }
}
</style>
