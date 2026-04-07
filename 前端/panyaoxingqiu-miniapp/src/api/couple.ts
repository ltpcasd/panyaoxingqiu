/**
 * 配对相关 API
 */
import { get, post, put, del } from '@/utils/request'
import { STORAGE_KEYS } from '@/config'
import type { CoupleInfo } from '@/types'

// 创建配对响应（后端实际返回格式）
interface CreatePairResponse {
  pairCode: string
  coupleId?: string
  status: number
}

// 加入配对响应（后端实际返回格式）
interface JoinPairResponse {
  id: string
  pairCode: string
  status: number
  coupleAvatar?: string
  backgroundImage?: string
  anniversaryDate?: string
  togetherDays: number
  intimacyScore: number
  level: number
  levelTitle: string
  me?: {
    id: string
    nickname: string
    avatarUrl: string
  }
  partner?: {
    id: string
    nickname: string
    avatarUrl: string
  }
}

// 配对码查询响应（后端实际返回格式）
interface PairCodeInfo {
  valid: boolean
  user?: {
    id: string
    nickname: string
    avatarUrl: string
  }
}

// 配对状态响应（后端实际返回格式）
interface CoupleStatusResponse {
  hasCouple: boolean
  status: number
  coupleId?: string
  partnerId?: string
}

/**
 * 获取配对状态
 */
export async function getCoupleStatus(): Promise<CoupleStatusResponse> {
  return get('/couples/me/status')
}

/**
 * 生成配对码
 */
export async function createPairCode(): Promise<CreatePairResponse> {
  return post<CreatePairResponse>('/couples/pair-code')
}

/**
 * 查询配对码
 * @param code 配对码
 */
export async function getPairCodeInfo(code: string): Promise<PairCodeInfo> {
  return get<PairCodeInfo>(`/couples/pair-code/${code}`)
}

/**
 * 加入配对
 * @param pairCode 配对码
 * @param anniversaryDate 纪念日（可选）
 */
export async function joinByPairCode(pairCode: string, anniversaryDate?: string): Promise<JoinPairResponse> {
  const result = await post<JoinPairResponse>('/couples/join', { 
    pairCode,
    anniversaryDate 
  })
  // 缓存配对信息
  if (result) {
    uni.setStorageSync(STORAGE_KEYS.COUPLE_INFO, result)
  }
  return result
}

/**
 * 获取我的配对信息
 */
export async function getCoupleInfo(): Promise<JoinPairResponse> {
  const result = await get<JoinPairResponse>('/couples/me')
  // 更新缓存
  if (result) {
    uni.setStorageSync(STORAGE_KEYS.COUPLE_INFO, result)
  }
  return result
}

/**
 * 更新配对信息（包含纪念日、头像、背景等）
 * @param data 更新数据
 */
export async function updateCoupleInfo(data: { 
  anniversaryDate?: string
  coupleAvatar?: string
  backgroundImage?: string
}): Promise<JoinPairResponse> {
  const result = await put<JoinPairResponse>('/couples/me', data)
  // 更新缓存
  if (result) {
    uni.setStorageSync(STORAGE_KEYS.COUPLE_INFO, result)
  }
  return result
}

/**
 * 更新纪念日
 * @param date 纪念日日期
 */
export async function updateAnniversary(date: string): Promise<JoinPairResponse> {
  return updateCoupleInfo({ anniversaryDate: date })
}

/**
 * 更新双人头像
 * @param avatarUrl 双人头像地址
 */
export async function updateCoupleAvatar(avatarUrl: string): Promise<JoinPairResponse> {
  return post<JoinPairResponse>('/couples/me/avatar', { coupleAvatar: avatarUrl })
}

/**
 * 更新背景图
 * @param backgroundImage 背景图地址
 */
export async function updateBackgroundImage(backgroundImage: string): Promise<JoinPairResponse> {
  return put<JoinPairResponse>('/couples/me/background', { backgroundImage })
}

/**
 * 解除配对
 */
export async function unbindCouple(): Promise<void> {
  await del('/couples/me')
  // 清除缓存
  uni.removeStorageSync(STORAGE_KEYS.COUPLE_INFO)
}

/**
 * 验证配对码
 * @param pairCode 配对码
 */
export async function verifyPairCode(pairCode: string): Promise<PairCodeInfo> {
  return get<PairCodeInfo>(`/couples/verify?code=${pairCode}`)
}

/**
 * 检查配对状态（兼容旧方法）
 * @deprecated 请使用 getCoupleStatus
 */
export async function checkCoupleStatus(): Promise<CoupleStatusResponse> {
  return getCoupleStatus()
}

/**
 * 获取本地缓存的配对信息
 */
export function getCachedCoupleInfo(): JoinPairResponse | null {
  return uni.getStorageSync(STORAGE_KEYS.COUPLE_INFO) || null
}

/**
 * 获取在一起天数
 */
export function getTogetherDays(): number {
  const coupleInfo = getCachedCoupleInfo()
  if (coupleInfo?.anniversaryDate) {
    const startDate = new Date(coupleInfo.anniversaryDate)
    const now = new Date()
    const diff = now.getTime() - startDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
  return coupleInfo?.togetherDays || 0
}

export default {
  getCoupleStatus,
  createPairCode,
  getPairCodeInfo,
  joinByPairCode,
  getCoupleInfo,
  updateCoupleInfo,
  updateAnniversary,
  updateCoupleAvatar,
  updateBackgroundImage,
  unbindCouple,
  verifyPairCode,
  checkCoupleStatus,
  getCachedCoupleInfo,
  getTogetherDays
}
