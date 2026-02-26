import { http } from '@/utils/request.js'

// 获取上传签名
export const getUploadSignature = (filename, type) =>
  http.get('/upload/signature', { filename, type })

// 提交作品
export const createPhoto = (data) => http.post('/studio/photos', data)

// 获取我的作品列表
export const getMyPhotos = (params) => http.get('/studio/photos', params)

// 获取作品详情（摄影师视角，含审核信息）
export const getMyPhotoDetail = (id) => http.get(`/studio/photos/${id}`)

// 编辑作品
export const updatePhoto = (id, data) => http.put(`/studio/photos/${id}`, data)

// 上架/下架作品
export const togglePhotoStatus = (id, status) =>
  http.patch(`/studio/photos/${id}/status`, { status })

// 删除作品
export const deletePhoto = (id) => http.delete(`/studio/photos/${id}`)

// 获取收益概览
export const getEarningsOverview = () => http.get('/studio/stats')

// 获取收益明细
export const getEarningsHistory = (params) => http.get('/studio/earnings', params)

// 获取待确认授权申请
export const getLicenseRequests = (params) => http.get('/studio/licenses', params)

// 确认/拒绝授权申请
export const reviewLicense = (id, data) => http.post(`/studio/licenses/${id}/review`, data)
