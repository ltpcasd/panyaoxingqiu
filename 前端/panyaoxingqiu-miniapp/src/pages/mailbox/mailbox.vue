<template>
  <view class="mailbox-page">
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
        <text class="page-title">心动信箱</text>
      </view>
      
      <!-- 写信按钮 -->
      <view class="btn-write" @click="handleWrite">
        <text class="write-icon">✏️</text>
      </view>
    </view>
    
    <!-- 信件列表 -->
    <scroll-view 
      class="letter-list" 
      scroll-y
      @scrolltolower="loadMore"
    >
      <view 
        v-for="letter in messageStore.letterList" 
        :key="letter.id"
        class="letter-card"
        :class="{ unread: !letter.isRead }"
        @click="viewLetter(letter)"
      >
        <!-- 装饰背景 -->
        <view class="card-decoration"></view>
        
        <!-- 发件人信息 -->
        <view class="letter-header">
          <image 
            class="sender-avatar"
            :src="letter.sender?.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <view class="sender-info">
            <text class="sender-name">来自{{ letter.sender?.nickname }}的信</text>
            <text class="send-time">{{ formatTime(letter.createdAt) }}</text>
          </view>
          <view v-if="!letter.isRead" class="unread-dot"></view>
        </view>
        
        <!-- 信件内容预览 -->
        <view class="letter-preview">
          <text class="letter-content">{{ letter.content }}</text>
        </view>
        
        <!-- 心情标签 -->
        <view v-if="letter.mood" class="letter-mood">
          <text class="mood-tag">{{ letter.mood }}</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="messageStore.loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!messageStore.letterList.length && !messageStore.loading" class="empty-state">
        <text class="empty-icon">💌</text>
        <text class="empty-title">信箱是空的</text>
        <text class="empty-desc">给TA写一封信，表达你的心意</text>
        <button class="btn-write-letter" @click="handleWrite">写一封信</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { formatRelativeTime } from '@/utils'
import type { Letter } from '@/types'

const userStore = useUserStore()
const messageStore = useMessageStore()

onLoad(() => {
  loadLetters()
})

/**
 * 格式化时间
 */
const formatTime = (date: string): string => {
  return formatRelativeTime(date)
}

/**
 * 加载信件
 */
const loadLetters = async () => {
  try {
    await messageStore.fetchLetters()
  } catch (error) {
    console.error('加载信件失败:', error)
  }
}

/**
 * 加载更多
 */
const loadMore = () => {
  messageStore.loadMore()
}

/**
 * 写信
 */
const handleWrite = () => {
  uni.navigateTo({ url: '/pages/mailbox/write' })
}

/**
 * 查看信件详情
 */
const viewLetter = async (letter: Letter) => {
  // 标记为已读
  if (!letter.isRead) {
    try {
      await messageStore.markAsRead(letter.id)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  
  uni.navigateTo({ 
    url: `/pages/mailbox/detail?id=${letter.id}` 
  })
}
</script>

<style lang="scss" scoped>
.mailbox-page {
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

.btn-write {
  width: 44px;
  height: 44px;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
}

.write-icon {
  font-size: 20px;
}

.letter-list {
  height: calc(100vh - $status-bar-height - 76px - $tabbar-height);
  padding: 0 24px;
}

.letter-card {
  @include card;
  margin-bottom: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &.unread {
    border-left: 4px solid $primary;
  }
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: $primary-gradient;
  opacity: 0.1;
  border-radius: 0 0 0 80px;
}

.letter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.sender-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: $accent-gradient;
}

.sender-info {
  flex: 1;
}

.sender-name {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4px;
}

.send-time {
  font-size: $font-sm;
  color: $text-muted;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: $error;
  border-radius: 50%;
}

.letter-preview {
  margin-bottom: 12px;
}

.letter-content {
  font-size: $font-base;
  color: $text-secondary;
  line-height: $leading-relaxed;
  @include text-ellipsis(2);
}

.letter-mood {
  display: flex;
  gap: 8px;
}

.mood-tag {
  padding: 4px 12px;
  background: $bg-cream;
  border-radius: 9999px;
  font-size: $font-sm;
  color: $primary;
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

.btn-write-letter {
  @include btn-primary('md');
}
</style>
