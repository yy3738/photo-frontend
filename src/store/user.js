import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wxLogin, getCachedUser, logout } from '@/utils/auth.js'
import { http } from '@/utils/request.js'
import { USER_ROLE } from '@/constants/index.js'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(getCachedUser())
  const loading = ref(false)

  const isLoggedIn = computed(() => !!userInfo.value)
  const isPhotographer = computed(() =>
    userInfo.value?.role === USER_ROLE.PHOTOGRAPHER ||
    userInfo.value?.role === USER_ROLE.ADMIN
  )
  const isAdmin = computed(() => userInfo.value?.role === USER_ROLE.ADMIN)
  const points = computed(() => userInfo.value?.points ?? 0)

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
    const res = await http.get('/user/me')
    userInfo.value = res
    uni.setStorageSync('user_info', JSON.stringify(res))
    return res
  }

  async function enablePhotographer() {
    const res = await http.post('/user/enable-photographer')
    userInfo.value = { ...userInfo.value, role: USER_ROLE.PHOTOGRAPHER }
    uni.setStorageSync('user_info', JSON.stringify(userInfo.value))
    return res
  }

  function doLogout() {
    userInfo.value = null
    logout()
  }

  return {
    userInfo,
    loading,
    isLoggedIn,
    isPhotographer,
    isAdmin,
    points,
    login,
    fetchUserInfo,
    enablePhotographer,
    doLogout,
  }
})
