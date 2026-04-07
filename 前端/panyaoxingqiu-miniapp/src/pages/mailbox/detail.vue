<template>
  <view class="detail-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="btn-back" @click="handleBack">‹</text>
      <text class="nav-title">信件详情</text>
      <text class="btn-delete" @click="handleDelete">🗑️</text>
    </view>
    
    <!-- 信件内容 -->
    <scroll-view class="letter-content" scroll-y v-if="letter">
      <view class="letter-card" :style="getCardStyle()">
        <!-- 装饰元素 -->
        <view class="decoration-top"></view>
        <view class="decoration-bottom"></view>
        
        <!-- 发件人信息 -->
        <view class="sender-section">
          <image 
            class="sender-avatar"
            :src="letter.sender?.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <view class="sender-info">
            <text class="sender-name">{{ letter.sender?.nickname }}</text>
            <text class="send-time">{{ formatTime(letter.createdAt) }}</text>
          </view>
        </view>
        
        <!-- 心情标签 -->
        <view class="mood-tag" v-if="letter.mood">
          <text>{{ letter.mood }}</text>
        </view>
        
        <!-- 信件正文 -->
        <view class="content-section">
          <text class="letter-text">{{ letter.content }}</text>
        </view>
        
        <!-- 底部装饰 -->
        <view class="letter-footer">
          <text class="footer-text">—— 来自 {{ letter.sender?.nickname }} 的信</text>
          <text class="read-status" v-if="letter.isRead">
            已读 {{ formatTime(letter.readAt || '') }}
          </text>
        </view>
      </view>
      
      <!-- 回复按钮 -->
      <view class="action-section">
        <button class="btn-reply" @click="handleReply">
          <text class="reply-icon">✉️</text>
          <text>回复信件</text>
        </button>
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
import { useMessageStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import type { Letter } from '@/types'

const messageStore = useMessageStore()
const userStore = useUserStore()

// 信件详情
const letter = ref<Letter | null>(null)
const letterId = ref<number>(0)

onLoad((options) => {
  if (options?.id) {
    letterId.value = Number(options.id)
    loadDetail()
  }
})

/**
 * 加载详情
 */
const loadDetail = async () => {
  try {
    const detail = await messageStore.getLetterDetail(letterId.value)
    letter.value = detail
    
    // 标记为已读
    if (!detail.isRead && detail.receiverId === userStore.userInfo?.id) {
      await messageStore.markAsRead(letterId.value)
      letter.value.isRead = true
      letter.value.readAt = new Date().toISOString()
    }
  } catch (error) {
    console.error('加载信件失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/**
 * 获取卡片样式
 */
const getCardStyle = () => {
  const styles: Record<string, string> = {
    '经典': '#FFF8F0',
    '星空': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '樱花': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    '薄荷': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    '夕阳': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    '森林': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  }
  
  const bg = styles[letter.value?.backgroundStyle || ''] || '#FFF8F0'
  const isGradient = bg.includes('gradient')
  
  return {
    background: bg,
    color: isGradient ? '#FFFFFF' : '#4A4A4A'
  }
}

/**
 * 格式化时间
 */
const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 今天
  if (diff < 86400000 && now.getDate() === date.getDate()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  // 昨天
  if (diff < 172800000 && now.getDate() - date.getDate() === 1) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 返回
 */
const handleBack = () => {
  uni.navigateBack()
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
          await messageStore.deleteLetter(letterId.value)
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

/**
 * 回复
 */
const handleReply = () => {
  uni.navigateTo({ url: '/pages/mailbox/write' })
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

.btn-delete {
  font-size: 20px;
  width: 40px;
  text-align: right;
}

.letter-content {
  height: calc(100vh - $status-bar-height - 56px);
  padding: 24px;
}

.letter-card {
  border-radius: 20px;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
  min-height: 400px;
  box-shadow: $shadow-lg;
}

.decoration-top {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.decoration-bottom {
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.sender-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.sender-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.sender-info {
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  opacity: 0.9;
}

.send-time {
  font-size: $font-sm;
  opacity: 0.7;
  margin-top: 4px;
}

.mood-tag {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: $font-sm;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.content-section {
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
}

.letter-text {
  font-size: $font-lg;
  line-height: $leading-relaxed;
  white-space: pre-wrap;
}

.letter-footer {
  position: relative;
  z-index: 1;
  text-align: right;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-text {
  display: block;
  font-size: $font-sm;
  opacity: 0.8;
  margin-bottom: 8px;
}

.read-status {
  font-size: $font-xs;
  opacity: 0.6;
}

.action-section {
  margin-top: 24px;
  padding: 0 24px;
}

.btn-reply {
  width: 100%;
  height: 52px;
  background: $primary-gradient;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $text-white;
  font-size: $font-base;
  font-weight: $font-semibold;
  border: none;
  
  &::after {
    border: none;
  }
}

.reply-icon {
  font-size: 20px;
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
