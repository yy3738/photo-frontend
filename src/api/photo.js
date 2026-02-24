import { http } from '@/utils/request.js'

// 获取分类列表
export const getCategories = () => http.get('/categories')

// 获取指定分类下的标签列表
export const getTags = (categoryId) =>
  http.get(`/categories/${categoryId}/tags`)

// 获取作品列表
export const getPhotos = (params) => http.get('/photos', params)

// 获取作品详情
export const getPhotoDetail = (id) => http.get(`/photos/${id}`)

// 搜索作品
export const searchPhotos = (params) => http.get('/photos/search', params)

// 购买作品（积分）
export const buyPhoto = (photoId) => http.post(`/photos/${photoId}/buy`)

// 获取原图下载链接
export const getDownloadUrl = (photoId) => http.get(`/photos/${photoId}/download`)
