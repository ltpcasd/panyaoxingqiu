<template>
  <view class="index-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 主内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 头部区域 -->
      <view class="header">
        <!-- 双人头像 -->
        <view class="avatar-section" @click="handleAvatarClick">
          <view class="couple-avatars">
            <image 
              class="avatar avatar-me"
              :src="userStore.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <image 
              class="avatar avatar-partner"
              :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
          </view>
          <view class="avatar-edit-hint">
            <text class="edit-icon">✏️</text>
          </view>
        </view>
        
        <!-- 用户信息 -->
        <view class="user-info">
          <text class="couple-name">
            {{ userStore.nickname }} & {{ userStore.partner?.nickname || 'TA' }}
          </text>
          <view class="days-badge">
            <text class="days-text">在潘瑶星球</text>
            <text class="days-number">{{ userStore.togetherDays }}</text>
            <text class="days-text">天</text>
          </view>
        </view>
      </view>
      
      <!-- 功能卡片网格 -->
      <view class="feature-grid">
        <!-- 时光轴 - 大图 -->
        <view class="feature-card featured" @click="navigateTo('/pages/timeline/timeline')">
          <view class="card-icon-large">
            <text class="icon">📅</text>
          </view>
          <view class="card-content">
            <text class="card-title">时光轴</text>
            <text class="card-desc">记录我们的点点滴滴</text>
          </view>
        </view>
        
        <!-- 记忆星云 -->
        <view class="feature-card" @click="navigateTo('/pages/album/album')">
          <text class="card-icon">📷</text>
          <text class="card-title">记忆星云</text>
          <text class="card-desc">{{ albumStore.totalPhotos }} 张照片</text>
        </view>
        
        <!-- 默契考验 -->
        <view class="feature-card" @click="navigateTo('/pages/compatibility/compatibility')">
          <text class="card-icon">🎯</text>
          <text class="card-title">默契考验</text>
          <text class="card-desc">默契度 85%</text>
        </view>
      </view>
      
      <!-- 今日任务预览 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">今日任务</text>
          <text class="section-more" @click="navigateTo('/pages/task/task')">查看更多</text>
        </view>
        <view class="task-list">
          <view 
            v-for="task in todayTasks" 
            :key="task.id"
            class="task-item"
          >
            <view class="task-icon">{{ task.task?.icon || '📋' }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.task?.title || '任务' }}</text>
              <text class="task-reward">+{{ task.task?.rewardPoints || 0 }} 分</text>
            </view>
            <view 
              class="task-status"
              :class="{ completed: task.status === 1 || task.status === 2 }"
            >
              <text v-if="task.status === 1 || task.status === 2">✓</text>
            </view>
          </view>
          <!-- 空状态 -->
          <view v-if="todayTasks.length === 0 && !taskLoading" class="empty-tasks">
            <text class="empty-text">暂无今日任务</text>
          </view>
          <!-- 加载状态 -->
          <view v-if="taskLoading" class="loading-tasks">
            <text class="loading-text">加载中...</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAlbumStore } from '@/stores/album'
import { useTaskStore } from '@/stores/task'
import type { UserTask } from '@/types'

const userStore = useUserStore()
const albumStore = useAlbumStore()
const taskStore = useTaskStore()

// 任务加载状态
const taskLoading = ref(false)

// 今日任务 - 从 taskStore 获取
const todayTasks = computed(() => taskStore.todayTasks)

onLoad(() => {
  // 加载相册数据
  albumStore.fetchAlbums()
  // 加载今日任务
  fetchTodayTasks()
})

onShow(() => {
  // 刷新数据
  userStore.fetchCoupleInfo()
  // 刷新任务列表
  fetchTodayTasks()
})

/**
 * 获取今日任务
 */
const fetchTodayTasks = async () => {
  try {
    taskLoading.value = true
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('获取今日任务失败:', error)
  } finally {
    taskLoading.value = false
  }
}

/**
 * 点击头像
 */
const handleAvatarClick = () => {
  uni.showActionSheet({
    itemList: ['更换双人头像', '更换我的头像', '查看大图'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          uni.navigateTo({ url: '/pages/avatar-settings/avatar-settings?type=couple' })
          break
        case 1:
          uni.navigateTo({ url: '/pages/avatar-settings/avatar-settings?type=personal' })
          break
        case 2:
          // 预览大图
          break
      }
    }
  })
}

/**
 * 页面跳转
 */
const navigateTo = (url: string) => {
  if (url.includes('/pages/index/index')) {
    return
  }
  if (url.startsWith('/pages/')) {
    const page = url.replace('/pages/', '').split('/')[0]
    const tabPages = ['index', 'timeline', 'task', 'mailbox', 'profile']
    if (tabPages.includes(page)) {
      uni.switchTab({ url })
    } else {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
}

.content {
  height: calc(100vh - $status-bar-height - $tabbar-height);
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.avatar-section {
  position: relative;
}

.couple-avatars {
  display: flex;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid $bg-white;
  background: $bg-light;
}

.avatar-me {
  background: $primary-gradient;
  z-index: 2;
}

.avatar-partner {
  background: $accent-gradient;
  margin-left: -16px;
}

.avatar-edit-hint {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-section:active .avatar-edit-hint {
  opacity: 1;
}

.edit-icon {
  font-size: 12px;
}

.user-info {
  flex: 1;
}

.couple-name {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 8px;
}

.days-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(90deg, rgba($primary, 0.15) 0%, rgba($accent, 0.1) 100%);
  padding: 6px 16px;
  border-radius: 20px;
}

.days-text {
  font-size: $font-sm;
  color: $primary;
  font-weight: $font-semibold;
}

.days-number {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $primary;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.feature-card {
  @include card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  
  &:active {
    transform: scale(0.98);
  }
}

.feature-card.featured {
  grid-column: span 2;
  flex-direction: row;
  background: $primary-gradient;
  color: $text-white;
}

.card-icon {
  font-size: 40px;
}

.card-icon-large {
  width: 60px;
  height: 60px;
  background: rgba($bg-white, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-large .icon {
  font-size: 32px;
}

.card-content {
  flex: 1;
}

.card-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  margin-bottom: 4px;
}

.feature-card.featured .card-title {
  color: $text-white;
}

.card-desc {
  font-size: $font-sm;
  color: $text-secondary;
}

.feature-card.featured .card-desc {
  color: rgba($text-white, 0.9);
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-more {
  font-size: $font-sm;
  color: $primary;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  @include card;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.task-icon {
  width: 48px;
  height: 48px;
  background: $primary-gradient;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.task-info {
  flex: 1;
}

.task-name {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4px;
}

.task-reward {
  font-size: $font-sm;
  color: $text-secondary;
}

.task-status {
  width: 24px;
  height: 24px;
  border: 2px solid $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.completed {
    background: $primary;
    border-color: $primary;
    color: $text-white;
  }
}

.empty-tasks,
.loading-tasks {
  padding: 32px;
  text-align: center;
}

.empty-text,
.loading-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
