<template>
  <view class="login-page">
    <view class="logo-area">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <text class="app-name">摄影集市</text>
      <text class="slogan">发现好作品，遇见好摄影师</text>
    </view>

    <view class="btn-area">
      <button class="wx-login-btn" @tap="handleLogin" :loading="loading">
        微信一键登录
      </button>
      <text class="agreement">
        登录即代表同意
        <text class="link">《用户协议》</text>
        和
        <text class="link">《隐私政策》</text>
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const loading = ref(false)

async function handleLogin() {
  if (loading.value) return
  loading.value = true
  try {
    await userStore.login()
    // 登录成功，返回上一页或跳首页
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  } catch (err) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 60rpx 80rpx;
  background: #fff;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 32rpx;
  }

  .app-name {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-top: 32rpx;
  }

  .slogan {
    font-size: 28rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.btn-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .wx-login-btn {
    width: 100%;
    height: 96rpx;
    background: #07c160;
    color: #fff;
    font-size: 34rpx;
    border-radius: 48rpx;
    border: none;
  }

  .agreement {
    font-size: 24rpx;
    color: #999;
    margin-top: 24rpx;

    .link {
      color: #576b95;
    }
  }
}
</style>
