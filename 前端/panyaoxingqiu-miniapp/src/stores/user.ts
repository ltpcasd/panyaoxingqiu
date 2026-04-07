import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, CoupleInfo } from '@/types'
import { STORAGE_KEYS } from '@/config'
import * as authApi from '@/api/auth'
import * as userApi from '@/api/user'
import * as coupleApi from '@/api/couple'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // ==================== State ====================
  
  /** 用户信息 */
  const userInfo = ref<UserInfo | null>(null)
  
  /** 配对信息 */
  const coupleInfo = ref<CoupleInfo | null>(null)
  
  /** 登录状态 */
  const isLoggedIn = ref(false)
  
  /** 是否已配对 */
  const isPaired = computed(() => !!coupleInfo.value)
  
  /** Token */
  const token = ref('')

  // ==================== Getters ====================
  
  /** 获取用户ID */
  const userId = computed(() => userInfo.value?.id)
  
  /** 获取用户昵称 */
  const nickname = computed(() => userInfo.value?.nickname || '')
  
  /** 获取用户头像 */
  const avatarUrl = computed(() => userInfo.value?.avatarUrl || '')
  
  /** 获取伴侣信息 */
  const partner = computed(() => coupleInfo.value?.partner)
  
  /** 获取双人头像 */
  const coupleAvatar = computed(() => coupleInfo.value?.coupleAvatar)
  
  /** 获取背景图 */
  const backgroundImage = computed(() => coupleInfo.value?.backgroundImage)
  
  /** 获取在一起天数 */
  const togetherDays = computed(() => coupleInfo.value?.togetherDays || 0)

  // ==================== Actions ====================
  
  /**
   * 初始化
   */
  const init = async () => {
    // 从本地存储读取token
    const storedToken = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
      // 获取用户信息
      await fetchUserInfo()
      // 获取配对信息
      await fetchCoupleInfo()
    }
  }
  
  /**
   * 微信登录
   */
  const wxLogin = async (): Promise<boolean> => {
    try {
      // 获取微信登录凭证
      const code = await authApi.getWxCode()
      
      // 获取用户信息授权
      const [profileErr, profileRes] = await uni.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      if (profileErr) {
        throw new Error('获取用户信息失败')
      }
      
      // 调用后端登录接口
      const result = await authApi.wxLogin({
        code,
        nickname: profileRes.userInfo?.nickName,
        avatarUrl: profileRes.userInfo?.avatarUrl,
        gender: profileRes.userInfo?.gender
      })
      
      userInfo.value = result.user
      isLoggedIn.value = true
      token.value = result.token
      
      // 如果已配对，获取配对信息
      if (result.user.coupleId) {
        await fetchCoupleInfo()
      }
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      uni.showToast({ title: '登录失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    try {
      const result = await userApi.getUserInfo()
      userInfo.value = result
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 从本地读取
      const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
      if (stored) {
        userInfo.value = stored
      }
    }
  }
  
  /**
   * 获取配对信息
   */
  const fetchCoupleInfo = async () => {
    try {
      const result = await coupleApi.getCoupleInfo()
      coupleInfo.value = result
    } catch (error) {
      console.error('获取配对信息失败:', error)
      // 从本地读取
      const stored = uni.getStorageSync(STORAGE_KEYS.COUPLE_INFO)
      if (stored) {
        coupleInfo.value = stored
      }
    }
  }
  
  /**
   * 更新用户信息
   */
  const updateUserInfo = async (data: Partial<UserInfo>) => {
    try {
      const result = await userApi.updateUserInfo(data)
      userInfo.value = result
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }
  
  /**
   * 更新头像
   */
  const updateAvatar = async (avatarUrl: string) => {
    await updateUserInfo({ avatarUrl })
  }
  
  /**
   * 更新双人头像
   */
  const updateCoupleAvatar = async (avatarUrl: string) => {
    try {
      const result = await coupleApi.updateCoupleAvatar(avatarUrl)
      coupleInfo.value = result
    } catch (error) {
      console.error('更新双人头像失败:', error)
      throw error
    }
  }
  
  /**
   * 更新背景图
   */
  const updateBackground = async (imageUrl: string) => {
    try {
      const result = await coupleApi.updateBackgroundImage(imageUrl)
      coupleInfo.value = result
    } catch (error) {
      console.error('更新背景图失败:', error)
      throw error
    }
  }
  
  /**
   * 创建配对
   */
  const createPair = async (): Promise<string> => {
    try {
      const result = await coupleApi.createPairCode()
      return result.pairCode
    } catch (error) {
      console.error('创建配对失败:', error)
      throw error
    }
  }
  
  /**
   * 加入配对
   */
  const joinPair = async (pairCode: string): Promise<boolean> => {
    try {
      const result = await coupleApi.joinByPairCode(pairCode)
      coupleInfo.value = result.couple
      return true
    } catch (error) {
      console.error('加入配对失败:', error)
      uni.showToast({ title: '配对码无效', icon: 'none' })
      return false
    }
  }
  
  /**
   * 更新纪念日
   */
  const updateAnniversary = async (date: string) => {
    try {
      const result = await coupleApi.updateAnniversary(date)
      coupleInfo.value = result
    } catch (error) {
      console.error('更新纪念日失败:', error)
      throw error
    }
  }
  
  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      userInfo.value = null
      coupleInfo.value = null
      isLoggedIn.value = false
      token.value = ''
    }
  }

  return {
    // State
    userInfo,
    coupleInfo,
    isLoggedIn,
    token,
    
    // Getters
    isPaired,
    userId,
    nickname,
    avatarUrl,
    partner,
    coupleAvatar,
    backgroundImage,
    togetherDays,
    
    // Actions
    init,
    wxLogin,
    fetchUserInfo,
    fetchCoupleInfo,
    updateUserInfo,
    updateAvatar,
    updateCoupleAvatar,
    updateBackground,
    createPair,
    joinPair,
    updateAnniversary,
    logout
  }
})
