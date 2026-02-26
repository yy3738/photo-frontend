import { http } from './request.js'
import { STORAGE_KEY } from '@/constants/index.js'

/**
 * 微信登录：获取 code → 换取 token
 */
export async function wxLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: async ({ code }) => {
        try {
          const res = await http.post('/auth/wx-login', { code }, { noAuth: true })
          const { accessToken, refreshToken, user } = res
          uni.setStorageSync(STORAGE_KEY.ACCESS_TOKEN, accessToken)
          uni.setStorageSync(STORAGE_KEY.REFRESH_TOKEN, refreshToken)
          uni.setStorageSync(STORAGE_KEY.USER_INFO, JSON.stringify(user))
          resolve(user)
        } catch (err) {
          reject(err)
        }
      },
      fail: reject,
    })
  })
}

/**
 * 获取本地缓存的用户信息
 */
export function getCachedUser() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY.USER_INFO)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 是否已登录
 */
export function isLoggedIn() {
  return !!uni.getStorageSync(STORAGE_KEY.ACCESS_TOKEN)
}

/**
 * 退出登录
 */
export function logout() {
  uni.removeStorageSync(STORAGE_KEY.ACCESS_TOKEN)
  uni.removeStorageSync(STORAGE_KEY.REFRESH_TOKEN)
  uni.removeStorageSync(STORAGE_KEY.USER_INFO)
  uni.reLaunch({ url: '/pages/login/index' })
}

/**
 * 需要登录时的拦截：未登录则跳转登录页
 * @returns {boolean} 是否已登录
 */
export function requireLogin() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }
  return true
}
