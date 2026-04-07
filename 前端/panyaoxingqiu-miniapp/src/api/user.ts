/**
 * 用户相关 API
 */
import { get, post, put } from '@/utils/request'
import { STORAGE_KEYS } from '@/config'
import type { UserInfo, UserSettings } from '@/types'

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  const result = await get<UserInfo>('/user/info')
  // 更新本地缓存
  if (result) {
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, result)
  }
  return result
}

/**
 * 更新用户信息
 * @param data 用户信息
 */
export async function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  const result = await put<UserInfo>('/user/info', data as Record<string, unknown>)
  // 更新本地缓存
  if (result) {
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, result)
  }
  return result
}

/**
 * 更新用户设置
 * @param settings 用户设置
 */
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const result = await put<UserSettings>('/user/settings', settings as Record<string, unknown>)
  return result
}

/**
 * 获取用户设置
 */
export async function getUserSettings(): Promise<UserSettings> {
  return get<UserSettings>('/user/settings')
}

/**
 * 更新用户昵称
 * @param nickname 昵称
 */
export async function updateNickname(nickname: string): Promise<UserInfo> {
  return updateUserInfo({ nickname })
}

/**
 * 更新用户头像
 * @param avatarUrl 头像地址
 */
export async function updateAvatar(avatarUrl: string): Promise<UserInfo> {
  return updateUserInfo({ avatarUrl })
}

/**
 * 解绑配对关系
 */
export async function unbindCouple(): Promise<void> {
  await post('/user/unbind')
  // 清除本地配对信息
  uni.removeStorageSync(STORAGE_KEYS.COUPLE_INFO)
}

/**
 * 获取本地缓存的用户信息
 */
export function getCachedUserInfo(): UserInfo | null {
  return uni.getStorageSync(STORAGE_KEYS.USER_INFO) || null
}

/**
 * 检查是否已配对
 */
export function checkCoupled(): boolean {
  const userInfo = getCachedUserInfo()
  return !!userInfo?.coupleId
}

export default {
  getUserInfo,
  updateUserInfo,
  updateUserSettings,
  getUserSettings,
  updateNickname,
  updateAvatar,
  unbindCouple,
  getCachedUserInfo,
  checkCoupled
}
