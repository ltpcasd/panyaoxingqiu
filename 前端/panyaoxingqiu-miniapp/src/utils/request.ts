/**
 * 网络请求封装
 */
import { API_BASE_URL, STORAGE_KEYS } from '@/config'
import type { ApiError } from '@/types'

// 请求配置接口
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, unknown>
  header?: Record<string, string>
  showLoadingFlag?: boolean
  showErrorFlag?: boolean
}

// 响应数据接口
interface ResponseData<T = unknown> {
  code: number
  data: T
  message: string
  timestamp: number
  requestId: string
}

// UniApp 请求响应类型
interface UniRequestSuccessCallbackResult {
  statusCode: number
  data: unknown
  header: Record<string, string>
  cookies: string[]
}

interface UniRequestFailCallbackError {
  errMsg: string
  errno?: number
}

/**
 * 获取存储的 Token
 */
function getToken(): string {
  return uni.getStorageSync(STORAGE_KEYS.TOKEN) || ''
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  uni.setStorageSync(STORAGE_KEYS.TOKEN, token)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  uni.removeStorageSync(STORAGE_KEYS.TOKEN)
}

/**
 * 显示加载提示
 */
function showLoadingModal(title: string = '加载中...'): void {
  uni.showLoading({ title, mask: true })
}

/**
 * 隐藏加载提示
 */
function hideLoadingModal(): void {
  uni.hideLoading()
}

/**
 * 显示错误提示
 */
function showErrorToast(message: string): void {
  uni.showToast({
    title: message || '请求失败',
    icon: 'none',
    duration: 2000
  })
}

/**
 * 跳转登录页
 */
function redirectToLogin(): void {
  removeToken()
  uni.reLaunch({
    url: '/pages/launch/launch'
  })
}

/**
 * 通用请求方法
 */
export function request<T = unknown>(config: RequestConfig): Promise<T> {
  const { 
    url, 
    method = 'GET', 
    data, 
    header = {}, 
    showLoadingFlag = false, 
    showErrorFlag = true 
  } = config

  // 显示加载状态
  if (showLoadingFlag) {
    showLoadingModal()
  }

  return new Promise((resolve, reject) => {
    const token = getToken()
    
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      success: (res: UniRequestSuccessCallbackResult) => {
        if (showLoadingFlag) {
          hideLoadingModal()
        }

        const responseData = res.data as ResponseData<T>
        
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (responseData.code === 0 || responseData.code === 200) {
            resolve(responseData.data)
          } else {
            // 业务错误
            if (showErrorFlag) {
              showErrorToast(responseData.message || '请求失败')
            }
            reject(responseData as unknown as ApiError)
          }
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          if (showErrorFlag) {
            showErrorToast('登录已过期，请重新登录')
          }
          redirectToLogin()
          reject({ code: 401, message: '未授权' })
        } else if (res.statusCode === 403) {
          if (showErrorFlag) {
            showErrorToast('没有权限访问')
          }
          reject({ code: 403, message: '没有权限' })
        } else if (res.statusCode === 404) {
          if (showErrorFlag) {
            showErrorToast('请求的资源不存在')
          }
          reject({ code: 404, message: '资源不存在' })
        } else if (res.statusCode >= 500) {
          if (showErrorFlag) {
            showErrorToast('服务器错误，请稍后重试')
          }
          reject({ code: res.statusCode, message: '服务器错误' })
        } else {
          if (showErrorFlag) {
            showErrorToast(responseData.message || '请求失败')
          }
          reject(responseData as unknown as ApiError)
        }
      },
      fail: (err: UniRequestFailCallbackError) => {
        if (showLoadingFlag) {
          hideLoadingModal()
        }
        if (showErrorFlag) {
          showErrorToast('网络连接失败，请检查网络')
        }
        reject({ code: -1, message: '网络连接失败', error: err })
      }
    })
  })
}

/**
 * GET 请求
 */
export function get<T = unknown>(url: string, params?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  // 构建查询字符串
  let requestUrl = url
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    if (queryString) {
      requestUrl = `${url}?${queryString}`
    }
  }
  
  return request<T>({
    url: requestUrl,
    method: 'GET',
    ...config
  })
}

/**
 * POST 请求
 */
export function post<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT 请求
 */
export function put<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...config
  })
}

/**
 * PATCH 请求
 */
export function patch<T = unknown>(url: string, data?: Record<string, unknown>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'PATCH',
    data,
    ...config
  })
}

// 导出请求实例
export default {
  request,
  get,
  post,
  put,
  del,
  patch,
  setToken,
  removeToken
}
