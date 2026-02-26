import { STORAGE_KEY } from '@/constants/index.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 刷新 token 锁，防止并发多次刷新
let isRefreshing = false
let pendingQueue = []

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  pendingQueue = []
}

function getToken() {
  return uni.getStorageSync(STORAGE_KEY.ACCESS_TOKEN)
}

function getRefreshToken() {
  return uni.getStorageSync(STORAGE_KEY.REFRESH_TOKEN)
}

function saveTokens(accessToken, refreshToken) {
  uni.setStorageSync(STORAGE_KEY.ACCESS_TOKEN, accessToken)
  if (refreshToken) {
    uni.setStorageSync(STORAGE_KEY.REFRESH_TOKEN, refreshToken)
  }
}

function clearTokens() {
  uni.removeStorageSync(STORAGE_KEY.ACCESS_TOKEN)
  uni.removeStorageSync(STORAGE_KEY.REFRESH_TOKEN)
  uni.removeStorageSync(STORAGE_KEY.USER_INFO)
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('no_refresh_token')

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/auth/refresh`,
      method: 'POST',
      data: { refreshToken },
      success: (res) => {
        if (res.statusCode === 200 && res.data?.accessToken) {
          saveTokens(res.data.accessToken, res.data.refreshToken)
          resolve(res.data.accessToken)
        } else {
          reject(new Error('refresh_failed'))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

/**
 * 统一请求封装
 * @param {string} url
 * @param {object} options - method, data, header, noAuth
 */
export function request(url, options = {}) {
  const { method = 'GET', data, header = {}, noAuth = false } = options

  return new Promise(async (resolve, reject) => {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...header,
    }
    if (!noAuth && token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      success: async (res) => {
        const { statusCode, data: resData } = res

        if (statusCode === 200 || statusCode === 201) {
          resolve(resData.data !== undefined ? resData.data : resData)
          return
        }

        // token 过期，尝试刷新
        if (statusCode === 401 && !noAuth) {
          if (isRefreshing) {
            // 等待刷新完成后重试
            pendingQueue.push({
              resolve: (newToken) => {
                headers['Authorization'] = `Bearer ${newToken}`
                uni.request({
                  url: `${BASE_URL}${url}`,
                  method,
                  data,
                  header: headers,
                  success: (r) => resolve(r.data),
                  fail: reject,
                })
              },
              reject,
            })
            return
          }

          isRefreshing = true
          try {
            const newToken = await refreshAccessToken()
            processQueue(null, newToken)
            headers['Authorization'] = `Bearer ${newToken}`
            uni.request({
              url: `${BASE_URL}${url}`,
              method,
              data,
              header: headers,
              success: (r) => resolve(r.data),
              fail: reject,
            })
          } catch (err) {
            processQueue(err)
            clearTokens()
            // 跳转登录页
            uni.reLaunch({ url: '/pages/login/index' })
            reject(err)
          } finally {
            isRefreshing = false
          }
          return
        }

        // 其他错误
        const msg = resData?.message || `请求失败（${statusCode}）`
        uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请检查网络', icon: 'none' })
        reject(err)
      },
    })
  })
}

export const http = {
  get: (url, params, options) =>
    request(url, { method: 'GET', data: params, ...options }),
  post: (url, data, options) =>
    request(url, { method: 'POST', data, ...options }),
  put: (url, data, options) =>
    request(url, { method: 'PUT', data, ...options }),
  patch: (url, data, options) =>
    request(url, { method: 'PATCH', data, ...options }),
  delete: (url, data, options) =>
    request(url, { method: 'DELETE', data, ...options }),
}
