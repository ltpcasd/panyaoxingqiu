// 潘瑶星球 - TypeScript 类型定义

// ==================== 用户相关 ====================

/**
 * 用户性别
 */
export type Gender = 0 | 1 | 2 // 0-未知 1-男 2-女

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  openid: string
  nickname: string
  avatarUrl: string
  gender: Gender
  country?: string
  province?: string
  city?: string
  coupleId?: number
  settings?: UserSettings
}

/**
 * 用户设置
 */
export interface UserSettings {
  notificationEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  privacyLevel: number
  theme: string
}

// ==================== 配对相关 ====================

/**
 * 配对信息
 */
export interface CoupleInfo {
  id: number
  userId1: number
  userId2: number
  partner: PartnerInfo
  coupleAvatar?: string
  backgroundImage?: string
  anniversaryDate?: string
  togetherDays: number
  intimacyScore: number
  level: number
  levelTitle: string
  pairCode: string
}

/**
 * 伴侣信息
 */
export interface PartnerInfo {
  id: number
  nickname: string
  avatarUrl: string
  gender: Gender
}

// ==================== 时光轴相关 ====================

/**
 * 事件类型
 */
export type EventType = 1 | 2 | 3 // 1-纪念日 2-日常 3-旅行

/**
 * 时光轴事件
 */
export interface TimelineEvent {
  id: number
  coupleId: number
  creatorId: number
  eventType: EventType
  title: string
  content?: string
  eventDate: string
  location?: string
  weather?: string
  mood?: string
  images?: string[]
  isImportant: boolean
  likesCount: number
  commentsCount: number
  createdAt: string
}

// ==================== 相册相关 ====================

/**
 * 相册
 */
export interface Album {
  id: number
  coupleId: number
  name: string
  coverImage?: string
  photoCount: number
  sortOrder: number
}

/**
 * 照片
 */
export interface Photo {
  id: number
  albumId: number
  coupleId: number
  uploaderId: number
  originalUrl: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
  description?: string
  tags?: string[]
  takenAt?: string
  createdAt: string
}

// ==================== 任务相关 ====================

/**
 * 任务类型
 */
export type TaskType = 1 | 2 | 3 // 1-每日 2-每周 3-成就

/**
 * 任务状态
 */
export type TaskStatus = 0 | 1 | 2 // 0-进行中 1-已完成 2-已领取

/**
 * 任务
 */
export interface Task {
  id: number
  taskType: TaskType
  title: string
  description?: string
  icon?: string
  rewardPoints: number
  requirement?: Record<string, unknown>
}

/**
 * 用户任务
 */
export interface UserTask {
  id: number
  userId: number
  coupleId: number
  taskId: number
  task: Task
  progress: number
  target: number
  status: TaskStatus
  completedAt?: string
  createdAt: string
}

// ==================== 信箱相关 ====================

/**
 * 信件
 */
export interface Letter {
  id: number
  coupleId: number
  senderId: number
  receiverId: number
  sender?: PartnerInfo
  title?: string
  content: string
  mood?: string
  backgroundStyle?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

// ==================== 默契考验相关 ====================

/**
 * 默契考验问题
 */
export interface QuizQuestion {
  id: number
  category: string
  question: string
  options: QuizOption[]
  difficulty: number
  tags?: string[]
}

/**
 * 选项
 */
export interface QuizOption {
  key: string
  value: string
}

/**
 * 答题记录
 */
export interface QuizRecord {
  id: number
  coupleId: number
  questionId: number
  question: QuizQuestion
  userId1: number
  answer1?: string
  userId2: number
  answer2?: string
  isMatch: boolean
  answeredAt1?: string
  answeredAt2?: string
  createdAt: string
}

/**
 * 默契度信息
 */
export interface CompatibilityInfo {
  score: number
  totalQuestions: number
  matchedQuestions: number
  streakDays: number
}

// ==================== API 响应 ====================

/**
 * 通用响应
 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
  timestamp: number
  requestId: string
}

/**
 * 错误响应
 */
export interface ApiError {
  code: number
  error: string
  message: string
  details?: Record<string, string[]>
  timestamp: number
  requestId: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// ==================== 通用 ====================

/**
 * 图片上传结果
 */
export interface UploadResult {
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
}

/**
 * 空状态配置
 */
export interface EmptyState {
  icon: string
  title: string
  description: string
  action?: {
    text: string
    path: string
  }
}
