<template>
  <view class="licenses-page">
    <!-- 状态筛选 -->
    <scroll-view class="status-tabs" scroll-x>
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @tap="onTabChange(tab.value)"
      >{{ tab.label }}</view>
    </scroll-view>

    <!-- 列表 -->
    <view class="license-list">
      <view v-for="item in list" :key="item.id" class="license-item">
        <image :src="item.photoPreviewUrl" class="thumb" mode="aspectFill" />
        <view class="license-info">
          <text class="photo-title">{{ item.photoTitle }}</text>
          <text class="purpose">用途：{{ purposeLabel(item.purpose) }}</text>
          <text class="scene">场景：{{ item.scene }}</text>
          <text class="status-text" :class="item.status">{{ statusLabel(item.status) }}</text>
        </view>
        <!-- 待确认时显示操作按钮 -->
        <view v-if="item.status === 'pending_photographer'" class="actions">
          <text class="btn approve" @tap="handleReview(item, 'approve')">同意</text>
          <text class="btn reject" @tap="handleReview(item, 'reject')">拒绝</text>
        </view>
      </view>
    </view>

    <view class="empty" v-if="!loading && !list.length">
      <text>暂无授权申请</text>
    </view>

    <view class="load-more" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { getLicenseRequests, reviewLicense } from '@/api/studio.js'
import { LICENSE_PURPOSE, PAGE_SIZE } from '@/constants/index.js'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const currentStatus = ref('pending_photographer')

const tabs = [
  { label: '待确认', value: 'pending_photographer' },
  { label: '已同意', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

const purposeLabel = (val) =>
  LICENSE_PURPOSE.find(p => p.value === val)?.label || val

const statusLabel = (s) =>
  tabs.find(t => t.value === s)?.label || s

async function loadList(reset = false) {
  if (loading.value) return
  if (!reset && !hasMore.value) return

  loading.value = true
  if (reset) {
    page.value = 1
    list.value = []
    hasMore.value = true
  }

  try {
    const res = await getLicenseRequests({
      status: currentStatus.value,
      page: page.value,
      pageSize: PAGE_SIZE,
    })
    const newList = res?.list ?? []
    list.value = reset ? newList : [...list.value, ...newList]
    hasMore.value = newList.length === PAGE_SIZE
    page.value += 1
  } finally {
    loading.value = false
  }
}

function onTabChange(status) {
  currentStatus.value = status
  loadList(true)
}

async function handleReview(item, action) {
  if (action === 'reject') {
    // 弹窗输入拒绝原因
    uni.showModal({
      title: '拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async ({ confirm, content }) => {
        if (!confirm || !content?.trim()) return
        await reviewLicense(item.id, { action: 'reject', rejectReason: content.trim() })
        uni.showToast({ title: '已拒绝', icon: 'success' })
        loadList(true)
      },
    })
  } else {
    uni.showModal({
      title: '确认同意',
      content: '同意后将生成授权证书并通知买家',
      success: async ({ confirm }) => {
        if (!confirm) return
        await reviewLicense(item.id, { action: 'approve' })
        uni.showToast({ title: '已同意', icon: 'success' })
        loadList(true)
      },
    })
  }
}

onMounted(() => loadList(true))

onReachBottom(() => loadList())
</script>

<style lang="scss" scoped>
.licenses-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.license-list { padding: 16rpx; }

.license-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  padding: 16rpx;
  gap: 16rpx;

  .thumb {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }

  .license-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .photo-title { font-size: 30rpx; color: #333; }
    .purpose, .scene { font-size: 24rpx; color: #666; }

    .status-text {
      font-size: 24rpx;
      &.pending_photographer { color: #f39c12; }
      &.approved { color: #07c160; }
      &.rejected { color: #e74c3c; }
    }
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    justify-content: center;

    .btn {
      font-size: 26rpx;
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
      text-align: center;
    }

    .approve { color: #07c160; background: #e8f5e9; }
    .reject { color: #e74c3c; background: #fde8e8; }
  }
}

.empty {
  text-align: center;
  padding: 100rpx;
  font-size: 28rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: #999;
}
</style>
