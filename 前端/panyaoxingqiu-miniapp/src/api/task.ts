/**
 * 任务相关 API
 */
import { get, post } from '@/utils/request'
import type { UserTask, TaskType } from '@/types'

// 任务查询参数
interface TaskQueryParams {
  taskType?: TaskType
  status?: number
}

// 等级信息
interface LevelInfo {
  level: number
  title: string
  currentPoints: number
  nextLevelPoints: number
}

/**
 * 获取任务列表
 * @param params 查询参数
 */
export async function getTasks(params: TaskQueryParams = {}): Promise<UserTask[]> {
  return get<UserTask[]>('/tasks', params as Record<string, unknown>)
}

/**
 * 获取用户任务（今日任务）
 */
export async function getUserTasks(): Promise<UserTask[]> {
  return get<UserTask[]>('/tasks/user-tasks')
}

/**
 * 获取每日任务
 * @deprecated 请使用 getUserTasks
 */
export async function getDailyTasks(): Promise<UserTask[]> {
  return getUserTasks()
}

/**
 * 获取每周任务
 * @deprecated 后端暂无此接口，使用 getUserTasks 替代
 */
export async function getWeeklyTasks(): Promise<UserTask[]> {
  return getUserTasks()
}

/**
 * 获取成就任务
 * @deprecated 后端暂无此接口，使用 getUserTasks 替代
 */
export async function getAchievementTasks(): Promise<UserTask[]> {
  return getUserTasks()
}

/**
 * 获取任务详情
 * @param taskId 任务ID
 */
export async function getTaskDetail(taskId: number): Promise<UserTask> {
  return get<UserTask>(`/tasks/${taskId}`)
}

/**
 * 更新任务进度
 * @param taskId 任务ID
 * @param progress 进度
 * @deprecated 后端暂无此接口
 */
export async function updateTaskProgress(taskId: number, progress: number): Promise<UserTask> {
  return post<UserTask>(`/tasks/${taskId}/progress`, { progress })
}

/**
 * 领取任务奖励
 * @param taskId 任务ID
 */
export async function claimReward(taskId: number): Promise<{
  success: boolean
  points: number
  message: string
}> {
  return post(`/tasks/${taskId}/claim`)
}

/**
 * 批量领取奖励
 * @deprecated 后端暂无此接口
 */
export async function claimAllRewards(): Promise<{
  success: boolean
  totalPoints: number
  claimedTasks: number[]
}> {
  return post('/tasks/claim-all')
}

/**
 * 获取任务统计
 * @deprecated 后端暂无此接口
 */
export async function getTaskStats(): Promise<{
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalPoints: number
  todayCompleted: number
}> {
  // 返回默认值，避免报错
  return {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalPoints: 0,
    todayCompleted: 0
  }
}

/**
 * 获取积分历史
 * @deprecated 后端暂无此接口
 */
export async function getPointsHistory(): Promise<{
  total: number
  history: {
    id: number
    points: number
    type: string
    description: string
    createdAt: string
  }[]
}> {
  return {
    total: 0,
    history: []
  }
}

/**
 * 检查任务完成情况
 * @deprecated 后端暂无此接口
 */
export async function checkTasksCompletion(): Promise<{
  hasUnclaimed: boolean
  unclaimedCount: number
}> {
  return {
    hasUnclaimed: false,
    unclaimedCount: 0
  }
}

/**
 * 获取等级信息
 */
export async function getLevelInfo(): Promise<LevelInfo> {
  return get<LevelInfo>('/tasks/level')
}

export default {
  getTasks,
  getUserTasks,
  getDailyTasks,
  getWeeklyTasks,
  getAchievementTasks,
  getTaskDetail,
  updateTaskProgress,
  claimReward,
  claimAllRewards,
  getTaskStats,
  getPointsHistory,
  checkTasksCompletion,
  getLevelInfo
}
