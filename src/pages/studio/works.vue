<template>
  <view class="works-page">
    <!-- 状态筛选 -->
    <scroll-view class="status-tabs" scroll-x>
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @tap="currentStatus = tab.value"
      >{{ tab.label }}</view>
    </scroll-view>

    <!-- 作品列表 -->
    <view class="work-list">
      <view v-for="item in filteredList" :key="item.id" class="work-item">
        <image :src="item.previewUrl" class="thumb" mode="aspectFill" />
        <view class="work-info">
          <text class="work-title">{{ item.title }}</text>
          <text class="work-status" :class="item.status">{{ statusLabel(item.status) }}</text>
          <text class="work-price">{{ item.price }} 积分</text>
          <text class="reject-reason" v-if="item.status === 'rejected'">
            拒绝原因：{{ item.rejectReason }}
          </text>
        </view>
        <view class="work-actions">
          <text class="action-btn" @tap="goEdit(item.id)">编辑</text>
          <text
            v-if="item.status === 'approved'"
            class="action-btn"
            @tap="toggleStatus(item, 'offline')"
          >下架</text>
          <text
            v-if="item.status === 'offline'"
            class="action-btn"
            @tap="toggleStatus(item, 'approved')"
          >上架</text>
        </view>
      </view>
    </view>

    <view class="empty" v-if="!filteredList.length">
      <text>暂无作品</text>
    </view>

    <!-- 上传按钮 -->
    <view class="fab" @tap="goUpload">+</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyPhotos, togglePhotoStatus } from '@/api/studio.js'
import { PHOTO_STATUS } from '@/constants/index.js'

const list = ref([])
const currentStatus = ref('')

const tabs = [
  { label: '全部', value: '' },
  { label: '待审核', value: PHOTO_STATUS.PENDING },
  { label: '已上架', value: PHOTO_STATUS.APPROVED },
  { label: '已下架', value: PHOTO_STATUS.OFFLINE },
  { label: '审核拒绝', value: PHOTO_STATUS.REJECTED },
]

const filteredList = computed(() =>
  currentStatus.value
    ? list.value.filter(i => i.status === currentStatus.value)
    : list.value
)

const statusLabel = (s) => tabs.find(t => t.value === s)?.label || s

onMounted(async () => {
  list.value = (await getMyPhotos()).list
})

async function toggleStatus(item, status) {
  await togglePhotoStatus(item.id, status)
  item.status = status
}

const goEdit = (id) => uni.navigateTo({ url: `/pages/studio/edit?id=${id}` })
const goUpload = () => uni.navigateTo({ url: '/pages/studio/upload' })
</script>

<style lang="scss" scoped>
.works-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-tabs {
  display: flex;
  white-space: nowrap;
  padding: 20rpx 24rpx;
  background: #fff;

  .tab-item {
    display: inline-block;
    padding: 10rpx 24rpx;
    margin-right: 12rpx;
    border-radius: 28rpx;
    font-size: 26rpx;
    color: #666;
    background: #f5f5f5;

    &.active { background: #333; color: #fff; }
  }
}

.work-list { padding: 16rpx; }

.work-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  padding: 16rpx;
  gap: 16rpx;

  .thumb {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  .work-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .work-title { font-size: 30rpx; color: #333; }
    .work-price { font-size: 26rpx; color: #f5a623; }
    .reject-reason { font-size: 24rpx; color: #e74c3c; }

    .work-status {
      font-size: 24rpx;
      &.pending { color: #f39c12; }
      &.approved { color: #07c160; }
      &.offline { color: #999; }
      &.rejected { color: #e74c3c; }
    }
  }

  .work-actions {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    justify-content: center;

    .action-btn {
      font-size: 26rpx;
      color: #576b95;
      text-align: center;
    }
  }
}

.empty {
  text-align: center;
  padding: 100rpx;
  font-size: 28rpx;
  color: #999;
}

.fab {
  position: fixed;
  bottom: 60rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #333;
  color: #fff;
  font-size: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.2);
}
</style>
