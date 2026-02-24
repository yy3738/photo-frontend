// 用户角色
export const USER_ROLE = {
  BUYER: 'buyer',       // 买家（默认）
  PHOTOGRAPHER: 'photographer', // 摄影师
  ADMIN: 'admin',       // 管理员
}

// 作品审核状态
export const PHOTO_STATUS = {
  PENDING: 'pending',     // 待审核
  APPROVED: 'approved',   // 已上架
  REJECTED: 'rejected',   // 审核拒绝
  OFFLINE: 'offline',     // 已下架
}

// 授权申请状态
export const LICENSE_STATUS = {
  PENDING_ADMIN: 'pending_admin',         // 待管理员审核
  PENDING_PHOTOGRAPHER: 'pending_photographer', // 待摄影师确认
  APPROVED: 'approved',                   // 已授权
  REJECTED: 'rejected',                   // 已拒绝
}

// 积分规则
export const POINTS = {
  RATIO: 10,          // 1元 = 10积分
  MIN_PRICE: 10,      // 最低定价（积分）
  MAX_PRICE: 9999,    // 最高定价（积分）
}

// 授权用途选项
export const LICENSE_PURPOSE = [
  { label: '商业广告', value: 'commercial' },
  { label: '新闻媒体', value: 'news' },
  { label: '个人创作', value: 'personal' },
  { label: '教育出版', value: 'education' },
  { label: '其他', value: 'other' },
]

// 审核拒绝原因预设
export const REJECT_REASONS = [
  { label: '画质不达标', value: 'quality' },
  { label: '内容违规', value: 'violation' },
  { label: '信息不完整', value: 'incomplete' },
  { label: '重复上传', value: 'duplicate' },
  { label: '其他', value: 'other' },
]

// 本地存储 key
export const STORAGE_KEY = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
}

// 分页
export const PAGE_SIZE = 20
