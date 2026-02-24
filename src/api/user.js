import { http } from '@/utils/request.js'

// 获取当前用户信息
export const getMe = () => http.get('/user/me')

// 开启摄影师模式
export const enablePhotographer = () => http.post('/user/enable-photographer')

// 获取积分明细
export const getPointsHistory = (params) => http.get('/user/points-history', params)

// 获取我的订单
export const getMyOrders = (params) => http.get('/user/orders', params)

// 获取我的授权申请
export const getMyLicenses = (params) => http.get('/user/licenses', params)
