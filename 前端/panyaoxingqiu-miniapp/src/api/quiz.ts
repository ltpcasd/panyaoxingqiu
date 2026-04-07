/**
 * 默契考验相关 API
 */
import { get, post } from '@/utils/request'
import type { QuizQuestion, QuizRecord, CompatibilityInfo } from '@/types'

// 提交答案参数
interface SubmitAnswerParams {
  questionId: number
  answer: string
}

// 答题历史查询参数
interface QuizHistoryParams {
  page?: number
  pageSize?: number
  category?: string
}

/**
 * 获取今日问题
 */
export async function getDailyQuestion(): Promise<QuizQuestion> {
  return get<QuizQuestion>('/quiz/daily')
}

/**
 * 获取随机问题
 */
export async function getRandomQuestion(): Promise<QuizQuestion> {
  return get<QuizQuestion>('/quiz/random')
}

/**
 * 提交答案
 * @param data 答案数据
 */
export async function submitAnswer(data: SubmitAnswerParams): Promise<{
  success: boolean
  partnerAnswer?: string
  isMatch: boolean
  score: number
}> {
  return post('/quiz/answer', data as Record<string, unknown>)
}

/**
 * 获取答题历史
 * @param params 查询参数
 */
export async function getQuizHistory(params: QuizHistoryParams = {}): Promise<QuizRecord[]> {
  return get<QuizRecord[]>('/quiz/history', params as Record<string, unknown>)
}

/**
 * 获取默契度信息
 */
export async function getCompatibility(): Promise<CompatibilityInfo> {
  return get<CompatibilityInfo>('/quiz/compatibility')
}

/**
 * 获取问题分类列表
 */
export async function getCategories(): Promise<string[]> {
  return get<string[]>('/quiz/categories')
}

/**
 * 获取指定分类的问题
 * @param category 分类名称
 */
export async function getQuestionsByCategory(category: string): Promise<QuizQuestion[]> {
  return get<QuizQuestion[]>('/quiz/category', { category })
}

/**
 * 获取答题统计
 */
export async function getQuizStats(): Promise<{
  totalQuestions: number
  answeredQuestions: number
  matchedQuestions: number
  streakDays: number
  compatibilityScore: number
}> {
  return get('/quiz/stats')
}

/**
 * 跳过问题
 * @param questionId 问题ID
 */
export async function skipQuestion(questionId: number): Promise<void> {
  return post('/quiz/skip', { questionId })
}

/**
 * 获取待回答的问题数量
 */
export async function getPendingQuestionsCount(): Promise<{ count: number }> {
  return get('/quiz/pending')
}

export default {
  getDailyQuestion,
  getRandomQuestion,
  submitAnswer,
  getQuizHistory,
  getCompatibility,
  getCategories,
  getQuestionsByCategory,
  getQuizStats,
  skipQuestion,
  getPendingQuestionsCount
}
