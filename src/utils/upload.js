import { http } from './request.js'

/**
 * 压缩图片
 * @param {string} src - 本地图片路径
 * @param {number} quality - 压缩质量 0-100，默认 80
 */
export function compressImage(src, quality = 80) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src,
      quality,
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: reject,
    })
  })
}

/**
 * 获取 MinIO 上传签名
 * @param {string} filename
 * @param {string} type - 'preview' | 'original'
 */
export async function getMinIOSignature(filename, type = 'original') {
  return http.get('/upload/signature', { filename, type })
}

// 兼容旧命名
export const getOssSignature = getMinIOSignature

/**
 * MinIO 直传（POST formData方式）
 * @param {object} signature - 后端返回的签名信息
 * @param {string} filePath - 本地文件路径
 * @param {function} onProgress - 进度回调 (percent: number)
 */
export function uploadToMinIO(signature, filePath, onProgress) {
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: `http://${signature.host}/photo`,
      filePath,
      name: 'file',
      formData: {
        key: signature.key,
        ...signature.formData,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(signature.key)
        } else {
          reject(new Error(`上传失败：${res.statusCode} - ${res.data}`))
        }
      },
      fail: reject,
    })

    if (onProgress) {
      uploadTask.onProgressUpdate(({ progress }) => onProgress(progress))
    }
  })
}

// 兼容旧命名
export const uploadToOss = uploadToMinIO

/**
 * 完整上传流程：压缩 → 获取签名 → MinIO 直传
 * @param {string} filePath - 本地图片路径
 * @param {object} options - { compress, quality, type, onProgress }
 * @returns {string} MinIO key
 */
export async function uploadImage(filePath, options = {}) {
  const { compress = true, quality = 80, type = 'original', onProgress } = options

  let targetPath = filePath
  if (compress) {
    targetPath = await compressImage(filePath, quality)
  }

  const filename = filePath.split('/').pop()
  const signature = await getOssSignature(filename, type)
  const key = await uploadToOss(signature, targetPath, onProgress)
  return key
}
