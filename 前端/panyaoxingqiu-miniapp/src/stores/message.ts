import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as messageApi from '@/api/message'
import type { Letter, PaginatedResponse } from '@/types'

/**
 * 信箱状态管理
 */
export const useMessageStore = defineStore('message', () => {
  // ==================== State ====================
  
  /** 信件列表 */
  const letterList = ref<Letter[]>([])
  
  /** 当前信件详情 */
  const currentLetter = ref<Letter | null>(null)
  
  /** 未读数量 */
  const unreadCount = ref(0)
  
  /** 信件统计 */
  const messageStats = ref({
    totalSent: 0,
    totalReceived: 0,
    unreadCount: 0
  })
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 分页信息 */
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  })

  // ==================== Getters ====================
  
  /** 已读信件 */
  const readLetters = computed(() => {
    return letterList.value.filter((l: Letter) => l.isRead)
  })
  
  /** 未读信件 */
  const unreadLetters = computed(() => {
    return letterList.value.filter((l: Letter) => !l.isRead)
  })
  
  /** 是否有未读 */
  const hasUnread = computed(() => unreadCount.value > 0)

  // ==================== Actions ====================
  
  /**
   * 获取信件列表
   */
  const fetchLetters = async (params?: { page?: number; pageSize?: number; isRead?: boolean }): Promise<PaginatedResponse<Letter>> => {
    try {
      loading.value = true
      const result = await messageApi.getLetters(params)
      
      if (params?.page === 1 || !params?.page) {
        letterList.value = result.list
      } else {
        letterList.value.push(...result.list)
      }
      
      pagination.value = result.pagination
      return result
    } catch (error) {
      console.error('获取信件列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取信件详情
   */
  const getLetterDetail = async (letterId: number): Promise<Letter> => {
    try {
      loading.value = true
      const result = await messageApi.getLetterDetail(letterId)
      currentLetter.value = result
      return result
    } catch (error) {
      console.error('获取信件详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 发送信件
   */
  const sendLetter = async (data: { content: string; title?: string; mood?: string; backgroundStyle?: string }): Promise<Letter> => {
    try {
      loading.value = true
      const result = await messageApi.sendLetter(data)
      
      // 添加到列表开头
      letterList.value.unshift(result)
      
      return result
    } catch (error) {
      console.error('发送信件失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 标记已读
   */
  const markAsRead = async (letterId: number): Promise<void> => {
    try {
      await messageApi.markAsRead(letterId)
      
      // 更新本地状态
      const letter = letterList.value.find((l: Letter) => l.id === letterId)
      if (letter) {
        letter.isRead = true
        letter.readAt = new Date().toISOString()
      }
      
      // 更新未读数
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }
  
  /**
   * 批量标记已读
   */
  const markAllAsRead = async (): Promise<void> => {
    try {
      await messageApi.markAllAsRead()
      
      // 更新本地状态
      letterList.value.forEach((letter: Letter) => {
        if (!letter.isRead) {
          letter.isRead = true
          letter.readAt = new Date().toISOString()
        }
      })
      
      unreadCount.value = 0
    } catch (error) {
      console.error('批量标记已读失败:', error)
      throw error
    }
  }
  
  /**
   * 删除信件
   */
  const deleteLetter = async (letterId: number): Promise<void> => {
    try {
      await messageApi.deleteLetter(letterId)
      
      // 从列表中移除
      const index = letterList.value.findIndex((l: Letter) => l.id === letterId)
      if (index > -1) {
        letterList.value.splice(index, 1)
      }
      
      // 如果是当前信件，清空
      if (currentLetter.value?.id === letterId) {
        currentLetter.value = null
      }
    } catch (error) {
      console.error('删除信件失败:', error)
      throw error
    }
  }
  
  /**
   * 获取未读数量
   */
  const fetchUnreadCount = async (): Promise<number> => {
    try {
      const result = await messageApi.getUnreadCount()
      unreadCount.value = result.count
      return result.count
    } catch (error) {
      console.error('获取未读数量失败:', error)
      throw error
    }
  }
  
  /**
   * 获取信件统计
   */
  const fetchMessageStats = async () => {
    try {
      const result = await messageApi.getMessageStats()
      messageStats.value = result
      return result
    } catch (error) {
      console.error('获取信件统计失败:', error)
      throw error
    }
  }
  
  /**
   * 获取对话记录
   */
  const fetchConversation = async (): Promise<Letter[]> => {
    try {
      loading.value = true
      const result = await messageApi.getConversation()
      letterList.value = result
      return result
    } catch (error) {
      console.error('获取对话记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 加载更多
   */
  const loadMore = async (): Promise<boolean> => {
    if (!pagination.value.hasMore || loading.value) {
      return false
    }
    
    try {
      const nextPage = pagination.value.page + 1
      await fetchLetters({ page: nextPage, pageSize: pagination.value.pageSize })
      return pagination.value.hasMore
    } catch (error) {
      console.error('加载更多失败:', error)
      return false
    }
  }
  
  /**
   * 重置列表
   */
  const resetList = () => {
    letterList.value = []
    pagination.value = {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    }
  }

  return {
    // State
    letterList,
    currentLetter,
    unreadCount,
    messageStats,
    loading,
    pagination,
    
    // Getters
    readLetters,
    unreadLetters,
    hasUnread,
    
    // Actions
    fetchLetters,
    getLetterDetail,
    sendLetter,
    markAsRead,
    markAllAsRead,
    deleteLetter,
    fetchUnreadCount,
    fetchMessageStats,
    fetchConversation,
    loadMore,
    resetList
  }
})
