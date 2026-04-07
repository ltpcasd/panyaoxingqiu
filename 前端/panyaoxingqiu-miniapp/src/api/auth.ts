/**
 * 认证相关 API
 */
import { post, setToken, removeToken } from '@/utils/request'
import { STORAGE_KEYS } from '@/config'
import type { UserInfo } from '@/types'

// 登录请求参数
interface LoginParams {
  code: string
  nickname?: string
  avatarUrl?: string
  gender?: number
  userInfo?: {
    nickName?: string
    avatarUrl?: string
    gender?: number
    country?: string
    province?: string
    city?: string
  }
}

// 登录响应（后端实际返回格式）
interface LoginResponse {
  token: string
  expiresIn: number
  userInfo: UserInfo
  coupleInfo?: {
    id: string
    partnerId: string
    partnerNickname: string
    partnerAvatarUrl: string
    coupleAvatar?: string
    backgroundImage?: string
    anniversaryDate?: string
    togetherDays: number
    intimacyScore: number
    level: number
    levelTitle: string
  }
}

// UniApp 登录响应类型
interface UniLoginSuccessCallbackResult {
  code: string
  errMsg: string
}

interface UniLoginFailCallbackError {
  errMsg: string
  errno?: number
}

/**
 * 微信登录
 * @param data 登录参数
 */
export async function wxLogin(data: LoginParams): Promise<LoginResponse> {
  // 构建符合后端期望的请求体
  const requestBody: any = {
    code: data.code
  }
  
  // 如果传入了userInfo，使用后端期望的格式
  if (data.userInfo) {
    requestBody.userInfo = data.userInfo
  } else if (data.nickname || data.avatarUrl) {
    requestBody.userInfo = {
      nickName: data.nickname,
      avatarUrl: data.avatarUrl,
      gender: data.gender
    }
  }
  
  const result = await post<LoginResponse>('/auth/login', requestBody)
  
  // 保存 token
  if (result.token) {
    setToken(result.token)
    // 保存用户信息
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, result.userInfo)
    // 保存配对信息
    if (result.coupleInfo) {
      uni.setStorageSync(STORAGE_KEYS.COUPLE_INFO, result.coupleInfo)
    }
  }
  return result
}

/**
 * 获取微信登录 code
 */
export function getWxCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes: UniLoginSuccessCallbackResult) => {
        resolve(loginRes.code)
      },
      fail: (err: UniLoginFailCallbackError) => {
        reject(err)
      }
    })
  })
}

/**
 * 微信授权登录流程
 * @param userInfo 用户信息
 */
export async function wxLoginWithUserInfo(userInfo: { nickname: string; avatarUrl: string; gender: number }): Promise<LoginResponse> {
  // 获取微信 code
  const code = await getWxCode()
  
  // 调用登录接口，使用后端期望的格式
  return wxLogin({
    code,
    userInfo: {
      nickName: userInfo.nickname,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender
    }
  })
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  try {
    await post('/auth/logout')
  } finally {
    // 清除本地数据
    removeToken()
    uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    uni.removeStorageSync(STORAGE_KEYS.COUPLE_INFO)
    
    // 跳转登录页
    uni.reLaunch({
      url: '/pages/launch/launch'
    })
  }
}

/**
 * 检查登录状态
 */
export function checkLoginStatus(): boolean {
  const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
  return !!token
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<string> {
  const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
  const result = await post<{ token: string; expiresIn: number }>('/auth/refresh', { refreshToken: token })
  if (result.token) {
    setToken(result.token)
  }
  return result.token
}

/**
 * 获取用户手机号
 * @param code 手机号授权码
 */
export async function getPhoneNumber(code: string): Promise<{ phoneNumber: string }> {
  return post('/auth/phone', { code })
}

export default {
  wxLogin,
  getWxCode,
  wxLoginWithUserInfo,
  logout,
  checkLoginStatus,
  refreshToken,
  getPhoneNumber
}
