<template>
  <view class="detail-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="btn-back" @click="handleBack">‹</text>
      <text class="nav-title">纪念日详情</text>
      <text class="btn-more" @click="handleMore">⋮</text>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y v-if="eventDetail">
      <!-- 头部信息 -->
      <view class="header-section">
        <view class="date-badge">
          <text class="month">{{ formatMonth(eventDetail.eventDate) }}</text>
          <text class="day">{{ formatDay(eventDetail.eventDate) }}</text>
        </view>
        <view class="title-section">
          <text class="title">{{ eventDetail.title }}</text>
          <view class="tags">
            <text class="tag" v-if="eventDetail.isImportant">重要</text>
            <text class="tag type">{{ getTypeLabel(eventDetail.eventType) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 心情和地点 -->
      <view class="meta-section" v-if="eventDetail.mood || eventDetail.location">
        <text v-if="eventDetail.mood" class="mood">{{ eventDetail.mood }}</text>
        <text v-if="eventDetail.location" class="location">📍 {{ eventDetail.location }}</text>
      </view>
      
      <!-- 内容描述 -->
      <view class="content-section" v-if="eventDetail.content">
        <text class="content-text">{{ eventDetail.content }}</text>
      </view>
      
      <!-- 图片展示 -->
      <view class="images-section" v-if="eventDetail.images?.length">
        <view 
          v-for="(img, index) in eventDetail.images" 
          :key="index"
          class="image-item"
          @click="previewImage(index)"
        >
          <image :src="img" mode="aspectFill" />
        </view>
      </view>
      
      <!-- 统计信息 -->
      <view class="stats-section">
        <view class="stat-item">
          <text class="stat-icon">❤️</text>
          <text class="stat-count">{{ eventDetail.likesCount || 0 }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">💬</text>
          <text class="stat-count">{{ eventDetail.commentsCount || 0 }}</text>
        </view>
      </view>
      
      <!-- 创建信息 -->
      <view class="footer-section">
        <text class="create-time">创建于 {{ formatTime(eventDetail.createdAt) }}</text>
      </view>
    </scroll-view>
    
    <!-- 加载状态 -->
    <view class="loading-state" v-else>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTimelineStore } from '@/stores/timeline'
import type { TimelineEvent, EventType } from '@/types'

const timelineStore = useTimelineStore()

// 事件详情
const eventDetail = ref<TimelineEvent | null>(null)
const eventId = ref<number>(0)

onLoad((options) => {
  if (options?.id) {
    eventId.value = Number(options.id)
    loadDetail()
  }
})

/**
 * 加载详情
 */
const loadDetail = async () => {
  try {
    const detail = await timelineStore.getEventDetail(eventId.value)
    eventDetail.value = detail
  } catch (error) {
    console.error('加载详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/**
 * 格式化月份
 */
const formatMonth = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

/**
 * 格式化日期
 */
const formatDay = (dateStr: string): string => {
  const date = new Date(dateStr)
  return String(date.getDate()).padStart(2, '0')
}

/**
 * 格式化时间
 */
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 获取类型标签
 */
const getTypeLabel = (type: EventType): string => {
  const labels: Record<number, string> = {
    1: '纪念日',
    2: '日常',
    3: '旅行'
  }
  return labels[type] || '其他'
}

/**
 * 预览图片
 */
const previewImage = (index: number) => {
  if (eventDetail.value?.images) {
    uni.previewImage({
      urls: eventDetail.value.images,
      current: index
    })
  }
}

/**
 * 返回
 */
const handleBack = () => {
  uni.navigateBack()
}

/**
 * 更多操作
 */
const handleMore = () => {
  uni.showActionSheet({
    itemList: ['编辑', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 编辑
        uni.navigateTo({
          url: `/pages/timeline/create?id=${eventId.value}`
        })
      } else if (res.tapIndex === 1) {
        // 删除
        handleDelete()
      }
    }
  })
}

/**
 * 删除
 */
const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否继续？',
    confirmColor: '#FF6B6B',
    success: async (res) => {
      if (res.confirm) {
        try {
          await timelineStore.deleteEvent(eventId.value)
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: $bg-white;
}

.btn-back {
  font-size: 28px;
  color: $text-primary;
  width: 40px;
}

.nav-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.btn-more {
  font-size: 24px;
  color: $text-primary;
  width: 40px;
  text-align: right;
}

.content {
  height: calc(100vh - $status-bar-height - 56px);
  padding: 24px;
}

.header-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.date-badge {
  width: 80px;
  height: 80px;
  background: $primary-gradient;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-white;
  flex-shrink: 0;
}

.month {
  font-size: $font-sm;
  opacity: 0.9;
}

.day {
  font-size: 32px;
  font-weight: $font-bold;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 12px;
  line-height: $leading-relaxed;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: rgba($error, 0.1);
  border-radius: 9999px;
  font-size: $font-xs;
  color: $error;
  
  &.type {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.meta-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: $bg-white;
  border-radius: 12px;
}

.mood {
  font-size: 24px;
}

.location {
  font-size: $font-sm;
  color: $text-secondary;
}

.content-section {
  background: $bg-white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.content-text {
  font-size: $font-base;
  color: $text-primary;
  line-height: $leading-relaxed;
}

.images-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-count {
  font-size: $font-base;
  color: $text-secondary;
}

.footer-section {
  text-align: center;
  padding: 24px;
}

.create-time {
  font-size: $font-sm;
  color: $text-muted;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - $status-bar-height - 56px);
  font-size: $font-base;
  color: $text-secondary;
}
</style>
