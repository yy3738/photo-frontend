<template>
  <view class="detail-page" v-if="photo">
    <!-- 预览图 -->
    <image :src="photo.previewUrl" mode="widthFix" class="preview-img" />

    <!-- 作品信息 -->
    <view class="info-card">
      <text class="title">{{ photo.title }}</text>
      <view class="meta">
        <text class="category">{{ photo.categoryName }}</text>
        <view class="tags">
          <text v-for="tag in photo.tags" :key="tag.id" class="tag">{{ tag.name }}</text>
        </view>
      </view>
      <text class="desc" v-if="photo.description">{{ photo.description }}</text>
    </view>

    <!-- 摄影师信息 -->
    <view class="photographer-card" @tap="goPhotographer(photo.photographer.id)">
      <image :src="photo.photographer.avatar" class="avatar" mode="aspectFill" />
      <view class="pg-info">
        <text class="pg-name">{{ photo.photographer.nickname }}</text>
        <text class="pg-works">{{ photo.photographer.worksCount }} 件作品</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="price-info">
        <text class="price">{{ photo.price }}</text>
        <text class="unit">积分</text>
      </view>
      <view class="btns">
        <button
          v-if="photo.allowLicense"
          class="btn-license"
          @tap="goApplyLicense"
        >申请授权</button>
        <button
          v-if="!isPurchased"
          class="btn-buy"
          @tap="handleBuy"
          :loading="buying"
        >积分购买</button>
        <button
          v-else
          class="btn-download"
          @tap="handleDownload"
          :loading="downloading"
        >下载原图</button>
      </view>
    </view>
  </view>

  <view v-else class="loading">
    <text>加载中...</text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPhotoDetail, buyPhoto, getDownloadUrl } from '@/api/photo.js'
import { useUserStore } from '@/store/user.js'
import { requireLogin } from '@/utils/auth.js'

const props = defineProps({ id: String })
const userStore = useUserStore()

const photo = ref(null)
const isPurchased = ref(false)
const buying = ref(false)
const downloading = ref(false)

onMounted(async () => {
  const id = props.id || getPageId()
  const res = await getPhotoDetail(id)
  photo.value = res
  isPurchased.value = res.isPurchased
})

function getPageId() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  return page?.options?.id
}

async function handleBuy() {
  if (!requireLogin()) return
  if (buying.value) return

  const needed = photo.value.price
  if (userStore.points < needed) {
    uni.showToast({ title: `积分不足（需要 ${needed} 积分）`, icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认购买',
    content: `消耗 ${needed} 积分购买此作品？\n当前余额：${userStore.points} 积分`,
    success: async ({ confirm }) => {
      if (!confirm) return
      buying.value = true
      try {
        await buyPhoto(photo.value.id)
        isPurchased.value = true
        await userStore.fetchUserInfo()
        uni.showToast({ title: '购买成功', icon: 'success' })
      } catch {
        // 错误已在 request.js 中 toast
      } finally {
        buying.value = false
      }
    },
  })
}

async function handleDownload() {
  if (downloading.value) return
  downloading.value = true
  try {
    const { url } = await getDownloadUrl(photo.value.id)
    uni.downloadFile({
      url,
      success: ({ tempFilePath }) => {
        uni.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => uni.showToast({ title: '保存失败，请授权相册权限', icon: 'none' }),
        })
      },
    })
  } finally {
    downloading.value = false
  }
}

function goPhotographer(id) {
  uni.navigateTo({ url: `/pages/photographer/index?id=${id}` })
}

function goApplyLicense() {
  if (!requireLogin()) return
  uni.navigateTo({ url: `/pages/license/apply?photoId=${photo.value.id}` })
}
</script>

<style lang="scss" scoped>
.detail-page {
  padding-bottom: 140rpx;
}

.preview-img {
  width: 100%;
  display: block;
}

.info-card {
  background: #fff;
  padding: 32rpx;
  margin-top: 16rpx;

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 16rpx;
  }

  .category {
    font-size: 24rpx;
    color: #fff;
    background: #333;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  .tag {
    font-size: 24rpx;
    color: #666;
    background: #f0f0f0;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
  }

  .desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-top: 20rpx;
  }
}

.photographer-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 28rpx 32rpx;
  margin-top: 16rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .pg-info {
    flex: 1;
    margin-left: 20rpx;

    .pg-name {
      font-size: 30rpx;
      color: #333;
      display: block;
    }

    .pg-works {
      font-size: 24rpx;
      color: #999;
      margin-top: 6rpx;
      display: block;
    }
  }

  .arrow {
    font-size: 36rpx;
    color: #ccc;
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);

  .price-info {
    .price {
      font-size: 44rpx;
      font-weight: 700;
      color: #f5a623;
    }
    .unit {
      font-size: 24rpx;
      color: #999;
      margin-left: 4rpx;
    }
  }

  .btns {
    display: flex;
    gap: 16rpx;
  }

  button {
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 40rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }

  .btn-license {
    background: #f5f5f5;
    color: #333;
  }

  .btn-buy {
    background: #333;
    color: #fff;
  }

  .btn-download {
    background: #07c160;
    color: #fff;
  }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
