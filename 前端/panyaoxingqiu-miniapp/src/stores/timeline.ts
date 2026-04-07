import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as timelineApi from '@/api/timeline'
import type { TimelineEvent, PaginatedResponse, EventType } from '@/types'

/**
 * 时光轴状态管理
 */
export const useTimelineStore = defineStore('timeline', () => {
  // ==================== State ====================
  
  /** 事件列表 */
  const eventList = ref<TimelineEvent[]>([])
  
  /** 当前事件详情 */
  const currentEvent = ref<TimelineEvent | null>(null)
  
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
  
  /** 重要事件 */
  const importantEvents = computed(() => {
    return eventList.value.filter((e: TimelineEvent) => e.isImportant)
  })
  
  /** 按日期分组的事件 */
  const eventsByDate = computed(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    
    eventList.value.forEach((event: TimelineEvent) => {
      const date = event.eventDate.split('T')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })
    
    return groups
  })

  // ==================== 别名 Getters (兼容性) ====================
  
  /** 
   * 事件列表别名 - 兼容页面使用 timelineStore.events
   */
  const events = computed(() => eventList.value)
  
  /** 
   * 按日期分组事件别名 - 兼容页面使用 timelineStore.groupedEvents
   */
  const groupedEvents = computed(() => {
    const groups: { date: string; events: TimelineEvent[] }[] = []
    const grouped = eventsByDate.value
    
    Object.keys(grouped).sort().reverse().forEach(date => {
      groups.push({
        date,
        events: grouped[date]
      })
    })
    
    return groups
  })
  
  /**
   * 是否有更多数据 - 兼容页面使用 timelineStore.hasMore
   */
  const hasMore = computed(() => pagination.value.hasMore)

  // ==================== Actions ====================
  
  /**
   * 获取事件列表
   */
  const fetchEvents = async (reset: boolean = false): Promise<PaginatedResponse<TimelineEvent>> => {
    try {
      loading.value = true
      
      if (reset) {
        pagination.value.page = 1
        eventList.value = []
      }
      
      const result = await timelineApi.getTimeline({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      })
      
      if (pagination.value.page === 1) {
        eventList.value = result.list
      } else {
        eventList.value.push(...result.list)
      }
      
      pagination.value = result.pagination
      return result
    } catch (error) {
      console.error('获取事件列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取事件详情
   */
  const getEventDetail = async (eventId: number): Promise<TimelineEvent> => {
    try {
      loading.value = true
      const result = await timelineApi.getEventDetail(eventId)
      currentEvent.value = result
      return result
    } catch (error) {
      console.error('获取事件详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建事件
   */
  const createEvent = async (data: Partial<TimelineEvent>): Promise<TimelineEvent> => {
    try {
      loading.value = true
      const result = await timelineApi.createEvent({
        eventType: (data.eventType || 1) as EventType,
        title: data.title || '',
        content: data.content,
        eventDate: data.eventDate || new Date().toISOString(),
        location: data.location,
        mood: data.mood,
        images: data.images,
        isImportant: data.isImportant
      })
      
      // 添加到列表开头
      eventList.value.unshift(result)
      pagination.value.total++
      
      return result
    } catch (error) {
      console.error('创建事件失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新事件
   */
  const updateEvent = async (eventId: number, data: Partial<TimelineEvent>): Promise<TimelineEvent> => {
    try {
      loading.value = true
      const result = await timelineApi.updateEvent(eventId, {
        eventType: data.eventType as EventType,
        title: data.title,
        content: data.content,
        eventDate: data.eventDate,
        location: data.location,
        mood: data.mood,
        images: data.images,
        isImportant: data.isImportant
      })
      
      // 更新本地列表
      const index = eventList.value.findIndex((e: TimelineEvent) => e.id === eventId)
      if (index > -1) {
        eventList.value[index] = result
      }
      
      // 更新当前事件
      if (currentEvent.value?.id === eventId) {
        currentEvent.value = result
      }
      
      return result
    } catch (error) {
      console.error('更新事件失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 删除事件
   */
  const deleteEvent = async (eventId: number): Promise<void> => {
    try {
      loading.value = true
      await timelineApi.deleteEvent(eventId)
      
      // 从列表中移除
      const index = eventList.value.findIndex((e: TimelineEvent) => e.id === eventId)
      if (index > -1) {
        eventList.value.splice(index, 1)
        pagination.value.total--
      }
      
      // 如果是当前事件，清空
      if (currentEvent.value?.id === eventId) {
        currentEvent.value = null
      }
    } catch (error) {
      console.error('删除事件失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 点赞事件
   */
  const likeEvent = async (eventId: number): Promise<void> => {
    try {
      await timelineApi.likeEvent(eventId)
      
      // 更新本地数据
      const event = eventList.value.find((e: TimelineEvent) => e.id === eventId)
      if (event) {
        event.likesCount++
      }
      
      if (currentEvent.value?.id === eventId) {
        currentEvent.value.likesCount++
      }
    } catch (error) {
      console.error('点赞失败:', error)
      throw error
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
      pagination.value.page++
      await fetchEvents()
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
    eventList.value = []
    pagination.value = {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    }
  }

  return {
    // State
    eventList,
    currentEvent,
    loading,
    pagination,
    
    // Getters
    importantEvents,
    eventsByDate,
    // 别名 Getters (兼容性)
    events,
    groupedEvents,
    hasMore,
    
    // Actions
    fetchEvents,
    getEventDetail,
    createEvent,
    updateEvent,
    deleteEvent,
    likeEvent,
    loadMore,
    resetList
  }
})
