<template>
  <view class="history-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="btn-back" @click="handleBack">‹</text>
      <text class="nav-title">默契历史</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ stats.totalQuestions }}</text>
        <text class="stat-label">总答题数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.matchedQuestions }}</text>
        <text class="stat-label">默契次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.matchRate }}%</text>
        <text class="stat-label">默契率</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.streakDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>
    
    <!-- 历史记录列表 -->
    <scroll-view class="history-list" scroll-y @scrolltolower="loadMore">
      <view 
        v-for="record in historyList" 
        :key="record.id"
        class="history-card"
        :class="{ matched: record.isMatch }"
      >
        <!-- 日期 -->
        <view class="record-date">
          <text class="date-day">{{ formatDay(record.createdAt) }}</text>
          <text class="date-month">{{ formatMonth(record.createdAt) }}</text>
        </view>
        
        <!-- 内容 -->
        <view class="record-content">
          <text class="question">{{ record.question.question }}</text>
          <view class="answers">
            <view class="answer-item">
              <text class="answer-label">你的答案</text>
              <text class="answer-value">{{ record.answer1 || '未回答' }}</text>
            </view>
            <view class="answer-divider">vs</view>
            <view class="answer-item">
              <text class="answer-label">TA的答案</text>
              <text class="answer-value">{{ record.answer2 || '未回答' }}</text>
            </view>
          </view>
        </view>
        
        <!-- 结果 -->
        <view class="record-result">
          <text class="result-icon">{{ record.isMatch ? '💕' : '😅' }}</text>
          <text class="result-text">{{ record.isMatch ? '默契' : '不同' }}</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!historyList.length && !loading" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-title">还没有答题记录</text>
        <text class="empty-desc">快去默契考验页面开始答题吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useQuizStore } from '@/stores/quiz'
import type { QuizRecord } from '@/types'

const quizStore = useQuizStore()

// 历史记录
const historyList = ref<QuizRecord[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 统计数据
const stats = ref({
  totalQuestions: 0,
  matchedQuestions: 0,
  matchRate: 0,
  streakDays: 0
})

onLoad(() => {
  loadStats()
  loadHistory()
})

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    const data = await quizStore.getCompatibilityInfo()
    stats.value = {
      totalQuestions: data.totalQuestions || 0,
      matchedQuestions: data.matchedQuestions || 0,
      matchRate: data.score || 0,
      streakDays: data.streakDays || 0
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

/**
 * 加载历史记录
 */
const loadHistory = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  try {
    const res = await quizStore.getHistory({
      page: page.value,
      pageSize: 20
    })
    
    if (page.value === 1) {
      historyList.value = res.list
    } else {
      historyList.value.push(...res.list)
    }
    
    hasMore.value = res.pagination.hasMore
  } catch (error) {
    console.error('加载历史失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++
    loadHistory()
  }
}

/**
 * 格式化日期
 */
const formatDay = (dateStr: string): string => {
  const date = new Date(dateStr)
  return String(date.getDate()).padStart(2, '0')
}

/**
 * 格式化月份
 */
const formatMonth = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

/**
 * 返回
 */
const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.history-page {
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

.placeholder {
  width: 40px;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 24px;
  background: $primary-gradient;
  margin: 16px 24px;
  border-radius: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: $font-bold;
  color: $text-white;
}

.stat-label {
  font-size: $font-sm;
  color: rgba($text-white, 0.8);
  margin-top: 4px;
}

.history-list {
  height: calc(100vh - $status-bar-height - 56px - 120px - 32px);
  padding: 0 24px;
}

.history-card {
  @include card;
  display: flex;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid $error;
  
  &.matched {
    border-left-color: $success;
  }
}

.record-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.date-day {
  font-size: 24px;
  font-weight: $font-bold;
  color: $primary;
}

.date-month {
  font-size: $font-sm;
  color: $text-secondary;
}

.record-content {
  flex: 1;
}

.question {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 12px;
  line-height: $leading-relaxed;
}

.answers {
  display: flex;
  align-items: center;
  gap: 12px;
}

.answer-item {
  flex: 1;
  text-align: center;
}

.answer-label {
  display: block;
  font-size: $font-xs;
  color: $text-muted;
  margin-bottom: 4px;
}

.answer-value {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.answer-divider {
  font-size: $font-sm;
  color: $text-muted;
  font-weight: $font-bold;
}

.record-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.result-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.result-text {
  font-size: $font-xs;
  color: $text-secondary;
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
}
</style>
