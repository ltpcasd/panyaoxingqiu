/**
 * 应用配置
 */

// 导入环境配置
export { API_BASE_URL, IS_PRODUCTION } from './env'

export const API_VERSION = 'v1'

// API 文档地址（仅开发环境使用）
export const API_DOCS_URL = 'http://localhost:3000/api/v1/docs'

// 上传配置
export const UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxCount: 9,
  accept: ['jpg', 'jpeg', 'png', 'gif', 'webp']
}

// 应用配置
export const APP_CONFIG = {
  appName: '潘瑶星球',
  version: '2.0.0'
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  COUPLE_INFO: 'coupleInfo',
  SETTINGS: 'settings'
}

// 缓存时间（秒）
export const CACHE_TIME = {
  USER_INFO: 3600,      // 1小时
  COUPLE_INFO: 1800,    // 30分钟
  TIMELINE: 300,        // 5分钟
  ALBUM: 300,           // 5分钟
  TASKS: 60             // 1分钟
}
