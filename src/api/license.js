import { http } from '@/utils/request.js'

// 提交授权申请
export const applyLicense = (data) => http.post('/licenses', data)

// 获取授权申请详情
export const getLicenseDetail = (id) => http.get(`/licenses/${id}`)

// 下载授权证书
export const getLicenseCertUrl = (id) => http.get(`/licenses/${id}/certificate`)
