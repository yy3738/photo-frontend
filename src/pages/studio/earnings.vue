<template>
  <view class="earnings-page">
    <!-- 概览 -->
    <view class="overview-card">
      <view class="overview-item">
        <text class="ov-val">{{ overview.totalEarned ?? 0 }}</text>
        <text class="ov-lbl">总积分收益</text>
      </view>
      <view class="overview-item">
        <text class="ov-val">{{ overview.monthEarned ?? 0 }}</text>
        <text class="ov-lbl">本月收益</text>
      </view>
      <view class="overview-item">
        <text class="ov-val">{{ overview.currentPoints ?? 0 }}</text>
        <text class="ov-lbl">当前余额</text>
      </view>
    </view>

    <!-- 明细 -->
    <view class="history-list">
      <view class="section-title">收益明细</view>
      <view v-for="item in history" :key="item.id" class="history-item">
        <view class="history-info">
          <text class="history-title">{{ item.relatedPhotoTitle }}</text>
          <text class="history-time">{{ item.createdAt }}</text>
        </view>
        <text class="history-points">+{{ item.amount }}</text>
      </view>
      <view class="empty" v-if="!history.length"><text>暂无收益记录</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEarningsOverview, getEarningsHistory } from '@/api/studio.js'

const overview = ref({})
const history = ref([])

onMounted(async () => {
  const [ov, hist] = await Promise.all([
    getEarningsOverview(),
    getEarningsHistory({ page: 1, pageSize: 50 }),
  ])
  overview.value = ov
  history.value = hist.list
})
</script>

<style lang="scss" scoped>
.earnings-page { min-height: 100vh; background: #f5f5f5; }

.overview-card {
  display: flex;
  background: #333;
  padding: 48rpx 32rpx;

  .overview-item {
    flex: 1;
    text-align: center;
    .ov-val { display: block; font-size: 48rpx; font-weight: 700; color: #f5a623; }
    .ov-lbl { display: block; font-size: 24rpx; color: rgba(255,255,255,0.6); margin-top: 8rpx; }
  }
}

.history-list {
  background: #fff;
  margin-top: 20rpx;
  padding: 0 32rpx;

  .section-title {
    font-size: 28rpx;
    color: #999;
    padding: 24rpx 0 16rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .history-info { flex: 1; }
  .history-title { font-size: 30rpx; color: #333; display: block; }
  .history-time { font-size: 24rpx; color: #ccc; display: block; margin-top: 6rpx; }
  .history-points { font-size: 36rpx; font-weight: 700; color: #07c160; }
}

.empty { text-align: center; padding: 60rpx; font-size: 28rpx; color: #999; }
</style>
