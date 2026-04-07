<template>
  <view class="write-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="btn-cancel" @click="handleCancel">取消</text>
      <text class="nav-title">写信</text>
      <text class="btn-send" @click="handleSend">发送</text>
    </view>
    
    <!-- 编辑区域 -->
    <scroll-view class="edit-content" scroll-y>
      <!-- 收信人信息 -->
      <view class="receiver-section">
        <text class="label">To:</text>
        <view class="receiver-info">
          <image 
            class="receiver-avatar"
            :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <text class="receiver-name">{{ userStore.partner?.nickname || 'TA' }}</text>
        </view>
      </view>
      
      <!-- 信纸样式选择 -->
      <view class="style-section">
        <text class="section-title">信纸样式</text>
        <scroll-view class="style-list" scroll-x>
          <view 
            v-for="(style, index) in paperStyles" 
            :key="index"
            class="style-item"
            :class="{ active: selectedStyle === index }"
            :style="{ background: style.background }"
            @click="selectedStyle = index"
          >
            <text class="style-name">{{ style.name }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 心情选择 -->
      <view class="mood-section">
        <text class="section-title">心情标签</text>
        <view class="mood-list">
          <view 
            v-for="mood in moods" 
            :key="mood.value"
            class="mood-item"
            :class="{ active: selectedMood === mood.value }"
            @click="selectedMood = mood.value"
          >
            <text class="mood-emoji">{{ mood.emoji }}</text>
            <text class="mood-name">{{ mood.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 信件内容 -->
      <view class="letter-section" :style="{ background: paperStyles[selectedStyle].background }">
        <textarea 
          class="letter-input"
          v-model="letterContent"
          placeholder="写下你想对TA说的话..."
          maxlength="1000"
          :style="{ color: paperStyles[selectedStyle].textColor }"
        />
        <text class="word-count" :style="{ color: paperStyles[selectedStyle].textColor }">
          {{ letterContent.length }}/1000
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'

const userStore = useUserStore()
const messageStore = useMessageStore()

// 信纸样式
const paperStyles = [
  { name: '经典', background: '#FFF8F0', textColor: '#4A4A4A' },
  { name: '星空', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#FFFFFF' },
  { name: '樱花', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', textColor: '#FFFFFF' },
  { name: '薄荷', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', textColor: '#FFFFFF' },
  { name: '夕阳', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', textColor: '#FFFFFF' },
  { name: '森林', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', textColor: '#FFFFFF' }
]

// 心情选项
const moods = [
  { value: 'miss', emoji: '🥺', name: '想念' },
  { value: 'love', emoji: '😍', name: '爱意' },
  { value: 'happy', emoji: '🥰', name: '开心' },
  { value: 'sorry', emoji: '😔', name: '抱歉' },
  { value: 'grateful', emoji: '🙏', name: '感谢' },
  { value: 'encourage', emoji: '💪', name: '鼓励' }
]

// 选中的样式和心情
const selectedStyle = ref(0)
const selectedMood = ref('love')
const letterContent = ref('')

/**
 * 取消
 */
const handleCancel = () => {
  if (letterContent.value.trim()) {
    uni.showModal({
      title: '确认退出',
      content: '退出后内容将不会保存',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

/**
 * 发送信件
 */
const handleSend = async () => {
  if (!letterContent.value.trim()) {
    uni.showToast({ title: '请输入信件内容', icon: 'none' })
    return
  }
  
  const selectedMoodItem = moods.find(m => m.value === selectedMood.value)
  
  uni.showLoading({ title: '发送中...' })
  
  try {
    await messageStore.sendLetter({
      content: letterContent.value.trim(),
      mood: `${selectedMoodItem?.emoji} ${selectedMoodItem?.name}`,
      backgroundStyle: paperStyles[selectedStyle.value].name
    })
    
    uni.hideLoading()
    uni.showToast({ title: '发送成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.write-page {
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

.btn-cancel {
  font-size: $font-base;
  color: $text-secondary;
}

.nav-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.btn-send {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $primary;
}

.edit-content {
  height: calc(100vh - $status-bar-height - 56px);
  padding: 24px;
}

.receiver-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.label {
  font-size: $font-base;
  color: $text-secondary;
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $bg-white;
  padding: 8px 16px;
  border-radius: 9999px;
}

.receiver-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.receiver-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.style-section {
  margin-bottom: 24px;
}

.section-title {
  display: block;
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin-bottom: 12px;
}

.style-list {
  white-space: nowrap;
}

.style-item {
  display: inline-block;
  width: 80px;
  height: 100px;
  border-radius: 12px;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  
  &.active {
    border-color: $primary;
  }
}

.style-name {
  font-size: $font-sm;
  font-weight: $font-semibold;
}

.mood-section {
  margin-bottom: 24px;
}

.mood-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mood-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: $bg-white;
  border-radius: 9999px;
  border: 2px solid transparent;
  
  &.active {
    border-color: $primary;
    background: rgba($primary, 0.1);
  }
}

.mood-emoji {
  font-size: 20px;
}

.mood-name {
  font-size: $font-sm;
  color: $text-primary;
}

.letter-section {
  border-radius: 16px;
  padding: 24px;
  min-height: 300px;
  position: relative;
}

.letter-input {
  width: 100%;
  min-height: 250px;
  font-size: $font-base;
  line-height: $leading-relaxed;
}

.word-count {
  position: absolute;
  bottom: 16px;
  right: 24px;
  font-size: $font-sm;
  opacity: 0.6;
}
</style>
