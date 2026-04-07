<template>
  <view class="timeline-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 头部 -->
    <view class="header">
      <view class="header-left">
        <!-- 双人头像 -->
        <view class="couple-avatars">
          <image 
            class="avatar-small"
            :src="userStore.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <image 
            class="avatar-small partner"
            :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
        </view>
        <text class="page-title">时光轴</text>
      </view>
      
      <!-- 添加按钮 -->
      <view class="btn-add" @click="handleAdd">
        <text class="add-icon">+</text>
      </view>
    </view>
    
    <!-- 时间线内容 -->
    <scroll-view 
      class="timeline-content" 
      scroll-y
      @scrolltolower="loadMore"
    >
      <!-- 时间线 -->
      <view class="timeline">
        <view 
          v-for="(group, groupIndex) in timelineStore.groupedEvents" 
          :key="groupIndex"
          class="timeline-group"
        >
          <!-- 月份标题 -->
          <view class="month-header">
            <text class="month-text">{{ formatMonth(group.date) }}</text>
          </view>
          
          <!-- 事件列表 -->
          <view 
            v-for="(event, eventIndex) in group.events" 
            :key="event.id"
            class="timeline-item"
          >
            <!-- 时间点 -->
            <view class="timeline-dot" :class="{ important: event.isImportant }"></view>
            
            <!-- 事件卡片 -->
            <view class="event-card" @click="viewEvent(event)">
              <view class="event-header">
                <text class="event-date">{{ formatDate(event.eventDate) }}</text>
                <text v-if="event.isImportant" class="important-badge">重要</text>
              </view>
              <text class="event-title">{{ event.title }}</text>
              <text v-if="event.content" class="event-content">{{ event.content }}</text>
              
              <!-- 图片预览 -->
              <view v-if="event.images?.length" class="event-images">
                <image 
                  v-for="(img, imgIndex) in event.images.slice(0, 3)" 
                  :key="imgIndex"
                  :src="img"
                  mode="aspectFill"
                  class="event-image"
                />
                <view v-if="event.images.length > 3" class="more-images">
                  <text>+{{ event.images.length - 3 }}</text>
                </view>
              </view>
              
              <!-- 互动数据 -->
              <view class="event-stats">
                <text class="stat">❤️ {{ event.likesCount }}</text>
                <text class="stat">💬 {{ event.commentsCount }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="timelineStore.loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!timelineStore.events.length && !timelineStore.loading" class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-title">还没有记录</text>
        <text class="empty-desc">点击右下角按钮，记录你们的第一个美好时刻</text>
        <button class="btn-record" @click="handleAdd">去记录</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useTimelineStore } from '@/stores/timeline'
import type { TimelineEvent } from '@/types'

const userStore = useUserStore()
const timelineStore = useTimelineStore()

onLoad(() => {
  timelineStore.fetchEvents(true)
})

/**
 * 格式化月份
 */
const formatMonth = (dateStr: string): string => {
  const [year, month] = dateStr.split('-')
  return `${year}年${parseInt(month)}月`
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (timelineStore.hasMore && !timelineStore.loading) {
    timelineStore.fetchEvents()
  }
}

/**
 * 添加事件
 */
const handleAdd = () => {
  uni.navigateTo({ url: '/pages/timeline/create' })
}

/**
 * 查看事件详情
 */
const viewEvent = (event: TimelineEvent) => {
  uni.navigateTo({ url: `/pages/timeline/detail?id=${event.id}` })
}
</script>

<style lang="scss" scoped>
.timeline-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.couple-avatars {
  display: flex;
  align-items: center;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid $bg-white;
  background: $primary-gradient;
  
  &.partner {
    background: $accent-gradient;
    margin-left: -8px;
  }
}

.page-title {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.btn-add {
  width: 44px;
  height: 44px;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
}

.add-icon {
  font-size: 28px;
  color: $text-white;
  font-weight: $font-light;
}

.timeline-content {
  height: calc(100vh - $status-bar-height - 76px - $tabbar-height);
  padding: 0 24px;
}

.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, $primary 0%, $accent 100%);
}

.timeline-group {
  margin-bottom: 32px;
}

.month-header {
  margin-bottom: 16px;
  margin-left: -32px;
}

.month-text {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $primary;
  background: $bg-cream;
  padding-right: 12px;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -28px;
  top: 16px;
  width: 16px;
  height: 16px;
  background: $text-muted;
  border-radius: 50%;
  border: 3px solid $bg-white;
  box-shadow: 0 0 0 2px $text-muted;
  
  &.important {
    background: $primary;
    box-shadow: 0 0 0 2px $primary;
    animation: pulse 2s infinite;
  }
}

.event-card {
  @include card;
  margin-left: 8px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-date {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
}

.important-badge {
  font-size: $font-xs;
  color: $primary;
  background: rgba($primary, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
}

.event-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4px;
}

.event-content {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: $leading-relaxed;
  margin-bottom: 12px;
}

.event-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.event-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: $bg-light;
}

.more-images {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-white;
  font-size: $font-base;
}

.event-stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: $font-sm;
  color: $text-muted;
}

.loading-more {
  text-align: center;
  padding: 24px;
  color: $text-muted;
  font-size: $font-sm;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: $font-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: 24px;
  line-height: $leading-relaxed;
}

.btn-record {
  @include btn-primary('md');
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba($primary, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba($primary, 0);
  }
}
</style>
