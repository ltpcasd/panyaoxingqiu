/**
 * 信箱相关 API
 */
import { get, post, put } from '@/utils/request'
import type { Letter, PaginatedResponse } from '@/types'

// 信件查询参数
interface LetterQueryParams {
  page?: number
  pageSize?: number
  isRead?: boolean
}

// 发送信件参数
interface SendLetterParams {
  content: string
  title?: string
  mood?: string
  backgroundStyle?: string
}

/**
 * 获取信件列表
 * @param params 查询参数
 */
export async function getLetters(params: LetterQueryParams = {}): Promise<PaginatedResponse<Letter>> {
  return get<PaginatedResponse<Letter>>('/messages', params as Record<string, unknown>)
}

/**
 * 获取信件详情
 * @param letterId 信件ID
 */
export async function getLetterDetail(letterId: number): Promise<Letter> {
  return get<Letter>(`/messages/${letterId}`)
}

/**
 * 发送信件
 * @param data 信件数据
 */
export async function sendLetter(data: SendLetterParams): Promise<Letter> {
  return post<Letter>('/messages', data as Record<string, unknown>)
}

/**
 * 标记信件已读
 * @param letterId 信件ID
 */
export async function markAsRead(letterId: number): Promise<void> {
  return put(`/messages/${letterId}/read`)
}

/**
 * 批量标记已读
 * @param letterIds 信件ID列表
 * @deprecated 后端暂无此接口
 */
export async function markAllAsRead(letterIds?: number[]): Promise<void> {
  // 如果没有提供ID列表，先获取所有未读信件
  if (!letterIds || letterIds.length === 0) {
    const response = await getLetters({ isRead: false })
    letterIds = response.list.filter((l: Letter) => !l.isRead).map((l: Letter) => l.id)
  }
  
  // 逐个标记已读
  if (letterIds && letterIds.length > 0) {
    const promises = letterIds.map(id => markAsRead(id))
    await Promise.all(promises)
  }
}

/**
 * 删除信件
 * @param letterId 信件ID
 * @deprecated 后端暂无此接口
 */
export async function deleteLetter(letterId: number): Promise<void> {
  // 后端暂无删除接口，这里仅做占位
  console.warn('删除信件接口暂未实现')
  return Promise.resolve()
}

/**
 * 获取未读信件数量
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return get('/messages/unread-count')
}

/**
 * 获取信件统计
 * @deprecated 后端暂无此接口
 */
export async function getMessageStats(): Promise<{
  totalSent: number
  totalReceived: number
  unreadCount: number
}> {
  // 返回默认值
  return {
    totalSent: 0,
    totalReceived: 0,
    unreadCount: 0
  }
}

/**
 * 获取与伴侣的对话记录
 * @deprecated 后端暂无此接口
 */
export async function getConversation(): Promise<Letter[]> {
  // 获取最近的信件作为对话记录
  const response = await getLetters({ pageSize: 50 })
  return response.list || []
}

export default {
  getLetters,
  getLetterDetail,
  sendLetter,
  markAsRead,
  markAllAsRead,
  deleteLetter,
  getUnreadCount,
  getMessageStats,
  getConversation
}
