import { http } from '@/utils/request.js'

// ---- 作品审核 ----
export const getAdminPhotos = (params) => http.get('/admin/photos', params)
export const reviewPhoto = (id, data) => http.post(`/admin/photos/${id}/review`, data)

// ---- 授权审核 ----
export const getAdminLicenses = (params) => http.get('/admin/licenses', params)
export const reviewAdminLicense = (id, data) => http.post(`/admin/licenses/${id}/review`, data)

// ---- 用户管理 ----
export const getAdminUsers = (params) => http.get('/admin/users', params)
export const banUser = (id) => http.post(`/admin/users/${id}/ban`)
export const unbanUser = (id) => http.post(`/admin/users/${id}/unban`)

// ---- 分类管理 ----
export const getAdminCategories = () => http.get('/admin/categories')
export const createCategory = (data) => http.post('/admin/categories', data)
export const updateCategory = (id, data) => http.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => http.delete(`/admin/categories/${id}`)

// ---- 标签管理 ----
export const getAdminTags = (params) => http.get('/admin/tags', params)
export const createTag = (data) => http.post('/admin/tags', data)
export const updateTag = (id, data) => http.put(`/admin/tags/${id}`, data)
export const deleteTag = (id) => http.delete(`/admin/tags/${id}`)

// ---- 数据概览 ----
export const getDashboard = () => http.get('/admin/dashboard')
