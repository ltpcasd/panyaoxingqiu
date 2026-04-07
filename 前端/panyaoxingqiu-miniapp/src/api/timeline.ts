/**
 * 时光轴相关 API
 */
import { get, post, put, del } from '@/utils/request'
import type { TimelineEvent, PaginatedResponse } from '@/types'

// 事件类型枚举（与后端保持一致）
export enum EventTypeEnum {
  ANNIVERSARY = 1, // 纪念日
  DAILY = 2,       // 日常
  TRAVEL = 3       // 旅行
}

// 事件类型字符串映射
export const EventTypeMap: Record<string, number> = {
  'anniversary': EventTypeEnum.ANNIVERSARY,
  'daily': EventTypeEnum.DAILY,
  'travel': EventTypeEnum.TRAVEL
}

// 事件类型反向映射
export const EventTypeReverseMap: Record<number, string> = {
  [EventTypeEnum.ANNIVERSARY]: 'anniversary',
  [EventTypeEnum.DAILY]: 'daily',
  [EventTypeEnum.TRAVEL]: 'travel'
}

// 时光轴查询参数
interface TimelineQueryParams {
  page?: number
  pageSize?: number
  eventType?: number | string  // 支持数字或字符串
  year?: number
  month?: number
}

// 创建事件参数（后端期望的格式）
interface CreateEventParams {
  eventType: number           // 后端期望数字类型
  title: string
  content?: string
  eventDate: string
  location?: string
  weather?: string
  mood?: string
  images?: string[]
  isImportant?: boolean
}

/**
 * 获取时光轴列表
 * @param params 查询参数
 */
export async function getTimeline(params: TimelineQueryParams = {}): Promise<PaginatedResponse<TimelineEvent>> {
  // 转换事件类型
  const queryParams: Record<string, unknown> = { ...params }
  if (typeof params.eventType === 'string') {
    queryParams.eventType = EventTypeMap[params.eventType]
  }
  return get<PaginatedResponse<TimelineEvent>>('/timeline', queryParams)
}

/**
 * 获取事件详情
 * @param id 事件ID
 */
export async function getEventDetail(id: string): Promise<TimelineEvent> {
  return get<TimelineEvent>(`/timeline/${id}`)
}

/**
 * 创建事件
 * @param data 事件数据
 */
export async function createEvent(data: Omit<CreateEventParams, 'eventType'> & { eventType: number | string }): Promise<TimelineEvent> {
  // 转换事件类型
  const eventData: CreateEventParams = {
    ...data,
    eventType: typeof data.eventType === 'string' 
      ? EventTypeMap[data.eventType] || EventTypeEnum.DAILY 
      : data.eventType
  }
  return post<TimelineEvent>('/timeline', eventData as unknown as Record<string, unknown>)
}

/**
 * 更新事件
 * @param id 事件ID
 * @param data 事件数据
 */
export async function updateEvent(id: string, data: Partial<CreateEventParams>): Promise<TimelineEvent> {
  const eventData: Record<string, unknown> = { ...data }
  if (typeof data.eventType === 'string') {
    eventData.eventType = EventTypeMap[data.eventType]
  }
  return put<TimelineEvent>(`/timeline/${id}`, eventData)
}

/**
 * 删除事件
 * @param id 事件ID
 */
export async function deleteEvent(id: string): Promise<void> {
  return del<void>(`/timeline/${id}`)
}

/**
 * 获取重要事件列表
 */
export async function getImportantEvents(): Promise<TimelineEvent[]> {
  return get<TimelineEvent[]>('/timeline/important')
}

/**
 * 获取按月分组的事件
 * @param year 年份
 * @param month 月份
 */
export async function getEventsByMonth(year: number, month: number): Promise<TimelineEvent[]> {
  return get<TimelineEvent[]>('/timeline/month', { year, month })
}

/**
 * 喜欢事件
 * @param id 事件ID
 */
export async function likeEvent(id: string): Promise<{ likesCount: number }> {
  return post<{ likesCount: number }>(`/timeline/${id}/like`)
}

/**
 * 取消喜欢
 * @param id 事件ID
 */
export async function unlikeEvent(id: string): Promise<{ likesCount: number }> {
  return del<{ likesCount: number }>(`/timeline/${id}/like`)
}

/**
 * 获取时间线统计
 */
export async function getTimelineStats(): Promise<{
  totalEvents: number
  importantEvents: number
  thisMonthEvents: number
}> {
  return get('/timeline/stats')
}

export default {
  getTimeline,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  getImportantEvents,
  getEventsByMonth,
  likeEvent,
  unlikeEvent,
  getTimelineStats,
  EventTypeEnum,
  EventTypeMap,
  EventTypeReverseMap
}
