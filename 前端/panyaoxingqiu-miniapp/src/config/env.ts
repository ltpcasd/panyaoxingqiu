/**
 * 环境配置
 * 根据运行环境自动切换API地址
 */

// 判断是否为生产环境
// 在小程序中，通过 process.env.NODE_ENV 判断
const isProduction = process.env.NODE_ENV === 'production'

// API 基础地址配置
const API_URLS = {
  development: 'http://localhost:3000/api/v1',
  production: 'https://panyaoxingqiu.railway.app/api/v1'
}

// 导出当前环境的API地址
export const API_BASE_URL = isProduction 
  ? API_URLS.production 
  : API_URLS.development

// 环境标识
export const IS_PRODUCTION = isProduction
