import { http } from '@/utils/request.js'

// 微信登录（由 utils/auth.js 封装，这里仅保留直接调用入口）
export const wxLogin = (code) =>
  http.post('/auth/wx-login', { code }, { noAuth: true })

// 刷新 token
export const refreshToken = (refreshToken) =>
  http.post('/auth/refresh', { refreshToken }, { noAuth: true })
