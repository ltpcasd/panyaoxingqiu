<template>
  <view class="compatibility-page">
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
        <text class="page-title">默契考验</text>
      </view>
    </view>
    
    <!-- 主内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 默契度卡片 -->
      <view class="compatibility-card">
        <view class="compatibility-header">
          <!-- 我的头像 -->
          <view class="player">
            <image 
              class="player-avatar"
              :src="userStore.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="player-name">{{ userStore.nickname }}</text>
          </view>
          
          <!-- 默契度 -->
          <view class="score-section">
            <text class="score">{{ compatibilityScore }}%</text>
            <text class="score-label">默契度</text>
          </view>
          
          <!-- 伴侣头像 -->
          <view class="player">
            <image 
              class="player-avatar partner"
              :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="player-name">{{ userStore.partner?.nickname || 'TA' }}</text>
          </view>
        </view>
        
        <!-- 进度条 -->
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: compatibilityScore + '%' }"></view>
        </view>
      </view>
      
      <!-- 今日问题 -->
      <view class="question-card" v-if="currentQuestion">
        <text class="question-label">今日问题</text>
        <text class="question-text">{{ currentQuestion.question }}</text>
        
        <!-- 选项列表 -->
        <view class="options-list">
          <view 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ selected: selectedOption === option.key, answered: hasAnswered }"
            @click="selectOption(option.key)"
          >
            <text class="option-key">{{ option.key }}</text>
            <text class="option-value">{{ option.value }}</text>
          </view>
        </view>
        
        <!-- 答题状态 -->
        <view v-if="hasAnswered" class="answer-status">
          <text v-if="isMatched" class="status-success">🎉 默契满分！你们的答案一致</text>
          <text v-else class="status-waiting">⏳ 等待对方回答...</text>
        </view>
      </view>
      
      <!-- 历史记录 -->
      <view class="history-section">
        <view class="section-header">
          <text class="section-title">答题记录</text>
          <text class="section-more" @click="viewHistory">查看全部</text>
        </view>
        
        <view class="history-list">
          <view 
            v-for="(record, index) in historyRecords" 
            :key="index"
            class="history-item"
          >
            <view class="history-question">{{ record.question }}</view>
            <view class="history-result" :class="{ matched: record.isMatch }">
              <text>{{ record.isMatch ? '✓ 默契' : '✗ 不同' }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useQuizStore } from '@/stores/quiz'
import type { QuizQuestion, QuizRecord } from '@/types'

const userStore = useUserStore()
const quizStore = useQuizStore()

// 默契度分数
const compatibilityScore = ref(85)

// 当前问题
const currentQuestion = ref<QuizQuestion | null>(null)

// 选中的选项
const selectedOption = ref('')

// 是否已答题
const hasAnswered = ref(false)

// 是否匹配
const isMatched = ref(false)

// 历史记录
const historyRecords = ref<Partial<QuizRecord>[]>([])

onLoad(() => {
  // 加载今日问题
  loadTodayQuestion()
  // 加载历史记录
  loadHistory()
  // 加载默契度
  loadCompatibility()
})

/**
 * 加载今日问题
 */
const loadTodayQuestion = async () => {
  try {
    await quizStore.fetchTodayQuestion()
    currentQuestion.value = quizStore.todayQuestion
    hasAnswered.value = quizStore.hasAnsweredToday
    selectedOption.value = quizStore.myAnswer
    isMatched.value = quizStore.isMatched
  } catch (error) {
    console.error('加载今日问题失败:', error)
  }
}

/**
 * 加载历史记录
 */
const loadHistory = async () => {
  try {
    const result = await quizStore.getHistory({ page: 1, pageSize: 4 })
    historyRecords.value = result.list.slice(0, 4).map(item => ({
      question: item.question.question,
      isMatch: item.isMatch
    }))
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

/**
 * 加载默契度
 */
const loadCompatibility = async () => {
  try {
    const info = await quizStore.getCompatibilityInfo()
    compatibilityScore.value = info.score
  } catch (error) {
    console.error('加载默契度失败:', error)
  }
}

/**
 * 选择选项
 */
const selectOption = async (key: string) => {
  if (hasAnswered.value) return
  
  selectedOption.value = key
  hasAnswered.value = true
  
  try {
    const matched = await quizStore.submitAnswer(key)
    isMatched.value = matched
    
    if (matched) {
      uni.showToast({ title: '默契满分！', icon: 'success' })
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

/**
 * 查看历史记录
 */
const viewHistory = () => {
  uni.navigateTo({ url: '/pages/compatibility/history' })
}
</script>

<style lang="scss" scoped>
.compatibility-page {
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

.compatibility-card {
  @include card;
  margin-bottom: 24px;
  padding: 24px;
}

.compatibility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid $bg-white;
  box-shadow: $shadow-md;
  background: $primary-gradient;
  
  &.partner {
    background: $accent-gradient;
  }
}

.player-name {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score {
  font-size: 36px;
  font-weight: $font-bold;
  color: $primary;
}

.score-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.progress-bar {
  height: 8px;
  background: $border-light;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary 0%, $accent 100%);
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.question-card {
  @include card;
  margin-bottom: 24px;
  padding: 24px;
}

.question-label {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 16px;
}

.question-text {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: 24px;
  line-height: $leading-relaxed;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: $bg-cream;
  border-radius: 12px;
  
  &:active:not(.answered) {
    background: rgba($primary, 0.1);
  }
  
  &.selected {
    background: rgba($primary, 0.15);
    border: 1px solid $primary;
  }
  
  &.answered {
    opacity: 0.7;
  }
}

.option-key {
  width: 28px;
  height: 28px;
  background: rgba($primary, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $primary;
}

.option-value {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.answer-status {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid $border-light;
  text-align: center;
}

.status-success {
  font-size: $font-base;
  color: $success;
  font-weight: $font-semibold;
}

.status-waiting {
  font-size: $font-base;
  color: $text-secondary;
}

.history-section {
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  @include card;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.history-question {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
  margin-right: 16px;
}

.history-result {
  font-size: $font-sm;
  color: $error;
  
  &.matched {
    color: $success;
  }
}
</style>
