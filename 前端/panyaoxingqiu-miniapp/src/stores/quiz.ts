import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as quizApi from '@/api/quiz'
import type { QuizQuestion, QuizRecord, CompatibilityInfo, PaginatedResponse } from '@/types'

/**
 * 默契考验状态管理
 */
export const useQuizStore = defineStore('quiz', () => {
  // ==================== State ====================
  
  /** 今日问题 */
  const todayQuestion = ref<QuizQuestion | null>(null)
  
  /** 是否已回答今日问题 */
  const hasAnsweredToday = ref(false)
  
  /** 我的答案 */
  const myAnswer = ref('')
  
  /** 伴侣的答案 */
  const partnerAnswer = ref('')
  
  /** 是否匹配 */
  const isMatched = ref(false)
  
  /** 默契度信息 */
  const compatibilityInfo = ref<CompatibilityInfo | null>(null)
  
  /** 历史记录 */
  const historyList = ref<QuizRecord[]>([])
  
  /** 加载状态 */
  const loading = ref(false)

  // ==================== Getters ====================
  
  /** 默契度分数 */
  const compatibilityScore = computed(() => compatibilityInfo.value?.score || 0)
  
  /** 总答题数 */
  const totalQuestions = computed(() => compatibilityInfo.value?.totalQuestions || 0)
  
  /** 匹配数 */
  const matchedQuestions = computed(() => compatibilityInfo.value?.matchedQuestions || 0)

  // ==================== Actions ====================
  
  /**
   * 获取今日问题
   */
  const fetchTodayQuestion = async () => {
    try {
      loading.value = true
      const question = await quizApi.getDailyQuestion()
      todayQuestion.value = question
      // 假设后端返回的数据包含是否已回答的状态
      hasAnsweredToday.value = false
      return question
    } catch (error) {
      console.error('获取今日问题失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 提交答案
   */
  const submitAnswer = async (answer: string): Promise<boolean> => {
    try {
      loading.value = true
      if (!todayQuestion.value) {
        throw new Error('没有今日问题')
      }
      const result = await quizApi.submitAnswer({
        questionId: todayQuestion.value.id,
        answer
      })
      hasAnsweredToday.value = true
      myAnswer.value = answer
      isMatched.value = result.isMatch
      partnerAnswer.value = result.partnerAnswer || ''
      return result.isMatch
    } catch (error) {
      console.error('提交答案失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取默契度信息
   */
  const getCompatibilityInfo = async (): Promise<CompatibilityInfo> => {
    try {
      const result = await quizApi.getCompatibility()
      compatibilityInfo.value = result
      return result
    } catch (error) {
      console.error('获取默契度信息失败:', error)
      throw error
    }
  }
  
  /**
   * 获取历史记录
   */
  const getHistory = async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<QuizRecord>> => {
    try {
      loading.value = true
      const list = await quizApi.getQuizHistory(params)
      const result: PaginatedResponse<QuizRecord> = {
        list,
        pagination: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
          total: list.length,
          totalPages: Math.ceil(list.length / (params?.pageSize || 20)),
          hasMore: list.length === (params?.pageSize || 20)
        }
      }
      if (params?.page === 1) {
        historyList.value = result.list
      } else {
        historyList.value.push(...result.list)
      }
      return result
    } catch (error) {
      console.error('获取历史记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 重置今日状态
   */
  const resetTodayStatus = () => {
    hasAnsweredToday.value = false
    myAnswer.value = ''
    partnerAnswer.value = ''
    isMatched.value = false
  }

  return {
    // State
    todayQuestion,
    hasAnsweredToday,
    myAnswer,
    partnerAnswer,
    isMatched,
    compatibilityInfo,
    historyList,
    loading,
    
    // Getters
    compatibilityScore,
    totalQuestions,
    matchedQuestions,
    
    // Actions
    fetchTodayQuestion,
    submitAnswer,
    getCompatibilityInfo,
    getHistory,
    resetTodayStatus
  }
})
