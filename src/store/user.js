import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wxLogin, getCachedUser, logout } from '@/utils/auth.js'
import { http } from '@/utils/request.js'
import { USER_ROLE, STORAGE_KEY } from '@/constants/index.js'

// 模式常量
export const APP_MODE = {
  BUYER: 'buyer',
  PHOTOGRAPHER: 'photographer',
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(getCachedUser())
  const loading = ref(false)
  // 当前使用模式（纯前端切换，不影响后端角色）
  const currentMode = ref(uni.getStorageSync('app_mode') || APP_MODE.BUYER)

  const isLoggedIn = computed(() => !!userInfo.value)
  const isPhotographer = computed(() =>
    userInfo.value?.role === USER_ROLE.PHOTOGRAPHER ||
    userInfo.value?.role === USER_ROLE.ADMIN
  )
  const isAdmin = computed(() => userInfo.value?.role === USER_ROLE.ADMIN)
  const points = computed(() => userInfo.value?.points ?? 0)
  const isStudioMode = computed(() => currentMode.value === APP_MODE.PHOTOGRAPHER)

  function switchMode(mode) {
    currentMode.value = mode
    uni.setStorageSync('app_mode', mode)
  }

  async function login() {
    loading.value = true
    try {
      const user = await wxLogin()
      userInfo.value = user
      return user
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo() {
    const user = await http.get('/user/me')
    userInfo.value = user
    uni.setStorageSync(STORAGE_KEY.USER_INFO, JSON.stringify(user))
    return user
  }

  async function enablePhotographer() {
    await http.post('/user/enable-photographer')
    userInfo.value = { ...userInfo.value, role: USER_ROLE.PHOTOGRAPHER }
    uni.setStorageSync(STORAGE_KEY.USER_INFO, JSON.stringify(userInfo.value))
  }

  function doLogout() {
    userInfo.value = null
    currentMode.value = APP_MODE.BUYER
    uni.removeStorageSync('app_mode')
    logout()
  }

  return {
    userInfo,
    loading,
    currentMode,
    isLoggedIn,
    isPhotographer,
    isAdmin,
    points,
    isStudioMode,
    switchMode,
    login,
    fetchUserInfo,
    enablePhotographer,
    doLogout,
  }
})
