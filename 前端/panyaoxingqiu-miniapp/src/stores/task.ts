import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as taskApi from '@/api/task'
import type { UserTask } from '@/types'

// 等级信息接口
interface LevelInfo {
  level: number
  title: string
  currentPoints: number
  nextLevelPoints: number
}

// 任务列表响应
interface TasksResponse {
  todayTasks: UserTask[]
  achievementTasks: UserTask[]
  levelInfo: LevelInfo
}

/**
 * 任务状态管理
 */
export const useTaskStore = defineStore('task', () => {
  // ==================== State ====================
  
  /** 今日任务列表 */
  const todayTasks = ref<UserTask[]>([])
  
  /** 成就任务列表 */
  const achievementTasks = ref<UserTask[]>([])
  
  /** 当前等级 */
  const currentLevel = ref(1)
  
  /** 等级标题 */
  const levelTitle = ref('新手恋人')
  
  /** 当前积分 */
  const currentPoints = ref(0)
  
  /** 下一级所需积分 */
  const nextLevelPoints = ref(100)
  
  /** 加载状态 */
  const loading = ref(false)

  // ==================== Getters ====================
  
  /** 等级进度百分比 */
  const levelProgress = computed(() => {
    if (nextLevelPoints.value === 0) return 100
    return Math.min((currentPoints.value / nextLevelPoints.value) * 100, 100)
  })
  
  /** 未完成任务数 */
  const incompleteTasksCount = computed(() => {
    return todayTasks.value.filter((t: UserTask) => t.status === 0).length
  })
  
  /** 已完成任务数 */
  const completedTasksCount = computed(() => {
    return todayTasks.value.filter((t: UserTask) => t.status === 1 || t.status === 2).length
  })

  // ==================== Actions ====================
  
  /**
   * 获取任务列表
   */
  const fetchTasks = async () => {
    try {
      loading.value = true
      
      // 调用新的 API 获取用户任务
      const userTasks = await taskApi.getUserTasks()
      todayTasks.value = userTasks
      
      // 获取等级信息
      try {
        const levelInfo = await taskApi.getLevelInfo()
        currentLevel.value = levelInfo.level
        levelTitle.value = levelInfo.title
        currentPoints.value = levelInfo.currentPoints
        nextLevelPoints.value = levelInfo.nextLevelPoints
      } catch (levelError) {
        console.warn('获取等级信息失败:', levelError)
      }
      
      return {
        todayTasks: userTasks,
        achievementTasks: [],
        levelInfo: {
          level: currentLevel.value,
          title: levelTitle.value,
          currentPoints: currentPoints.value,
          nextLevelPoints: nextLevelPoints.value
        }
      } as TasksResponse
    } catch (error) {
      console.error('获取任务列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 领取任务奖励
   */
  const claimReward = async (taskId: number): Promise<number> => {
    try {
      loading.value = true
      const result = await taskApi.claimReward(taskId)
      
      // 更新本地任务状态
      const task = todayTasks.value.find((t: UserTask) => t.id === taskId)
      if (task) {
        task.status = 2
        currentPoints.value += result.points
      }
      
      return result.points
    } catch (error) {
      console.error('领取奖励失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新任务进度
   */
  const updateTaskProgress = async (taskId: number, progress: number) => {
    try {
      const result = await taskApi.updateTaskProgress(taskId, progress)
      
      // 更新本地任务
      const todayTask = todayTasks.value.find((t: UserTask) => t.id === taskId)
      if (todayTask) {
        todayTask.progress = result.progress
        todayTask.status = result.status
      }
      
      const achievementTask = achievementTasks.value.find((t: UserTask) => t.id === taskId)
      if (achievementTask) {
        achievementTask.progress = result.progress
        achievementTask.status = result.status
      }
      
      return result
    } catch (error) {
      console.error('更新任务进度失败:', error)
      throw error
    }
  }
  
  /**
   * 获取任务详情
   */
  const getTaskDetail = async (taskId: number): Promise<UserTask> => {
    try {
      return await taskApi.getTaskDetail(taskId)
    } catch (error) {
      console.error('获取任务详情失败:', error)
      throw error
    }
  }
  
  /**
   * 完成每日签到
   */
  const dailyCheckIn = async (): Promise<{ success: boolean; points: number }> => {
    try {
      // 尝试领取所有可领取的奖励
      const result = await taskApi.claimAllRewards()
      
      // 刷新任务列表
      await fetchTasks()
      
      return { success: result.success, points: result.totalPoints }
    } catch (error) {
      console.error('签到失败:', error)
      throw error
    }
  }
  
  /**
   * 获取等级信息
   */
  const fetchLevelInfo = async (): Promise<LevelInfo> => {
    try {
      const levelInfo = await taskApi.getLevelInfo()
      currentLevel.value = levelInfo.level
      levelTitle.value = levelInfo.title
      currentPoints.value = levelInfo.currentPoints
      nextLevelPoints.value = levelInfo.nextLevelPoints
      
      return levelInfo
    } catch (error) {
      console.error('获取等级信息失败:', error)
      // 返回默认值
      return {
        level: currentLevel.value,
        title: levelTitle.value,
        currentPoints: currentPoints.value,
        nextLevelPoints: nextLevelPoints.value
      }
    }
  }

  return {
    // State
    todayTasks,
    achievementTasks,
    currentLevel,
    levelTitle,
    currentPoints,
    nextLevelPoints,
    loading,
    
    // Getters
    levelProgress,
    incompleteTasksCount,
    completedTasksCount,
    
    // Actions
    fetchTasks,
    claimReward,
    updateTaskProgress,
    getTaskDetail,
    dailyCheckIn,
    fetchLevelInfo
  }
})
