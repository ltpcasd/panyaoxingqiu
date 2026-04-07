<template>
  <view class="task-page">
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
        <text class="page-title">成长任务</text>
      </view>
    </view>
    
    <!-- 主内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 等级卡片 -->
      <view class="level-card">
        <view class="level-header">
          <view class="level-icon">💕</view>
          <view class="level-info">
            <text class="level-label">当前等级</text>
            <text class="level-name">Lv.{{ taskStore.currentLevel }} {{ taskStore.levelTitle }}</text>
          </view>
        </view>
        
        <!-- 进度条 -->
        <view class="level-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: taskStore.levelProgress + '%' }"></view>
          </view>
          <view class="progress-stats">
            <text>{{ taskStore.currentPoints }}/{{ taskStore.nextLevelPoints }}</text>
            <text>距离下一级还需 {{ taskStore.nextLevelPoints - taskStore.currentPoints }} 分</text>
          </view>
        </view>
      </view>
      
      <!-- 今日任务 -->
      <view class="task-section">
        <text class="section-title">今日任务</text>
        <view class="task-list">
          <view 
            v-for="task in taskStore.todayTasks" 
            :key="task.id"
            class="task-item"
          >
            <view class="task-icon">{{ task.task.icon }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.task.title }}</text>
              <text class="task-reward">+{{ task.task.rewardPoints }} 分</text>
            </view>
            <view 
              class="task-status"
              :class="{ completed: task.status === 1, claimed: task.status === 2 }"
              @click="handleTaskAction(task)"
            >
              <text v-if="task.status === 0">去完成</text>
              <text v-else-if="task.status === 1">领取</text>
              <text v-else>✓</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 成就任务 -->
      <view class="task-section">
        <text class="section-title">成就任务</text>
        <view class="task-list">
          <view 
            v-for="task in taskStore.achievementTasks" 
            :key="task.id"
            class="task-item"
          >
            <view class="task-icon">{{ task.task.icon }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.task.title }}</text>
              <view class="task-progress">
                <view class="progress-mini">
                  <view 
                    class="progress-mini-fill" 
                    :style="{ width: (task.progress / task.target * 100) + '%' }"
                  ></view>
                </view>
                <text class="progress-text">{{ task.progress }}/{{ task.target }}</text>
              </view>
            </view>
            <view 
              class="task-status"
              :class="{ completed: task.status === 1 }"
            >
              <text v-if="task.status === 0">进行中</text>
              <text v-else>✓</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import type { UserTask } from '@/types'

const userStore = useUserStore()
const taskStore = useTaskStore()

onLoad(() => {
  // 加载任务列表
  loadTasks()
})

/**
 * 加载任务
 */
const loadTasks = async () => {
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('加载任务失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/**
 * 处理任务操作
 */
const handleTaskAction = (task: UserTask) => {
  if (task.status === 0) {
    // 去完成任务
    goToCompleteTask(task)
  } else if (task.status === 1) {
    // 领取奖励
    claimReward(task)
  }
}

/**
 * 去完成任务
 */
const goToCompleteTask = (task: UserTask) => {
  switch (task.taskId) {
    case 1:
      // 互道早安 - 跳转到信箱
      uni.switchTab({ url: '/pages/mailbox/mailbox' })
      break
    case 2:
      // 上传合照 - 跳转到相册
      uni.switchTab({ url: '/pages/album/album' })
      break
    case 3:
      // 默契考验
      uni.navigateTo({ url: '/pages/compatibility/compatibility' })
      break
    default:
      uni.showToast({ title: '去完成', icon: 'none' })
  }
}

/**
 * 领取奖励
 */
const claimReward = async (task: UserTask) => {
  try {
    const points = await taskStore.claimReward(task.id)
    uni.showToast({ 
      title: `+${points}分`, 
      icon: 'success' 
    })
  } catch (error) {
    console.error('领取奖励失败:', error)
    uni.showToast({ title: '领取失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
}

.header {
  display: flex;
  align-items: center;
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

.content {
  height: calc(100vh - $status-bar-height - 72px - $tabbar-height);
  padding: 0 24px;
}

.level-card {
  background: $primary-gradient;
  border-radius: 20px;
  padding: 24px;
  color: $text-white;
  margin-bottom: 24px;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.level-icon {
  width: 60px;
  height: 60px;
  background: rgba($bg-white, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.level-info {
  flex: 1;
}

.level-label {
  display: block;
  font-size: $font-sm;
  opacity: 0.9;
  margin-bottom: 4px;
}

.level-name {
  display: block;
  font-size: $font-2xl;
  font-weight: $font-bold;
}

.level-progress {
  margin-top: 8px;
}

.progress-bar {
  height: 8px;
  background: rgba($bg-white, 0.2);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: $bg-white;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: $font-sm;
  opacity: 0.9;
}

.task-section {
  margin-bottom: 24px;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 16px;
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

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-mini {
  flex: 1;
  height: 4px;
  background: $border-light;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-mini-fill {
  height: 100%;
  background: $primary-gradient;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: $font-xs;
  color: $text-muted;
}

.task-status {
  padding: 6px 16px;
  background: rgba($primary, 0.1);
  border-radius: 9999px;
  font-size: $font-sm;
  color: $primary;
  font-weight: $font-semibold;
  
  &.completed {
    background: $primary;
    color: $text-white;
  }
  
  &.claimed {
    background: $success;
    color: $text-white;
  }
}
</style>
