<template>
  <view class="custom-tab-bar">
    <view
      v-for="tab in visibleTabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: currentTab === tab.key }"
      @tap="switchTab(tab)"
    >
      <image :src="currentTab === tab.key ? tab.activeIcon : tab.icon" class="tab-icon" />
      <text class="tab-text">{{ tab.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user.js'

const props = defineProps({
  currentTab: { type: String, default: 'home' },
})

const userStore = useUserStore()

const buyerTabs = [
  { key: 'home', text: '首页', path: '/pages/index/index', icon: '/static/tab/home.png', activeIcon: '/static/tab/home-active.png' },
  { key: 'search', text: '搜索', path: '/pages/search/index', icon: '/static/tab/search.png', activeIcon: '/static/tab/search-active.png' },
  { key: 'mine', text: '我的', path: '/pages/mine/index', icon: '/static/tab/mine.png', activeIcon: '/static/tab/mine-active.png' },
]

const photographerTabs = [
  { key: 'home', text: '工作台', path: '/pages/index/index', icon: '/static/tab/home.png', activeIcon: '/static/tab/home-active.png' },
  { key: 'mine', text: '我的', path: '/pages/mine/index', icon: '/static/tab/mine.png', activeIcon: '/static/tab/mine-active.png' },
]

const visibleTabs = computed(() =>
  userStore.isStudioMode ? photographerTabs : buyerTabs
)

function switchTab(tab) {
  if (props.currentTab === tab.key) return
  uni.switchTab({ url: tab.path })
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;

  .tab-icon {
    width: 48rpx;
    height: 48rpx;
  }

  .tab-text {
    font-size: 22rpx;
    color: #999;
  }

  &.active .tab-text {
    color: #333;
  }
}
</style>
