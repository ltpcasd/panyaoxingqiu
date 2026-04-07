<template>
  <view class="create-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="btn-cancel" @click="handleCancel">取消</text>
      <text class="nav-title">添加纪念日</text>
      <text class="btn-save" @click="handleSave">保存</text>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 标题输入 -->
      <view class="form-item">
        <text class="label">标题</text>
        <input 
          class="input"
          v-model="form.title"
          placeholder="例如：第一次见面、第一次旅行..."
          maxlength="50"
        />
      </view>
      
      <!-- 日期选择 -->
      <view class="form-item">
        <text class="label">日期</text>
        <picker mode="date" :value="form.eventDate" @change="onDateChange">
          <view class="picker-value">{{ form.eventDate || '请选择日期' }}</view>
        </picker>
      </view>
      
      <!-- 事件类型 -->
      <view class="form-item">
        <text class="label">类型</text>
        <view class="type-list">
          <view 
            v-for="type in eventTypes" 
            :key="type.value"
            class="type-item"
            :class="{ active: form.eventType === type.value }"
            @click="form.eventType = type.value"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-name">{{ type.label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 内容描述 -->
      <view class="form-item">
        <text class="label">描述（选填）</text>
        <textarea 
          class="textarea"
          v-model="form.content"
          placeholder="记录下这个特别的日子..."
          maxlength="500"
        />
        <text class="word-count">{{ form.content?.length || 0 }}/500</text>
      </view>
      
      <!-- 地点 -->
      <view class="form-item">
        <text class="label">地点（选填）</text>
        <input 
          class="input"
          v-model="form.location"
          placeholder="添加地点"
          maxlength="100"
        />
      </view>
      
      <!-- 心情 -->
      <view class="form-item">
        <text class="label">心情</text>
        <view class="mood-list">
          <text 
            v-for="mood in moods" 
            :key="mood"
            class="mood-item"
            :class="{ active: form.mood === mood }"
            @click="form.mood = mood"
          >
            {{ mood }}
          </text>
        </view>
      </view>
      
      <!-- 重要标记 -->
      <view class="form-item inline">
        <text class="label">标记为重要</text>
        <switch :checked="form.isImportant" @change="form.isImportant = $event.detail.value" color="#FF9A8B" />
      </view>
      
      <!-- 图片上传 -->
      <view class="form-item">
        <text class="label">照片</text>
        <view class="image-list">
          <view 
            v-for="(img, index) in form.images" 
            :key="index"
            class="image-item"
          >
            <image :src="img" mode="aspectFill" />
            <text class="delete-btn" @click="removeImage(index)">×</text>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="form.images.length < 9">
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTimelineStore } from '@/stores/timeline'
import type { EventType } from '@/types'

const timelineStore = useTimelineStore()

// 表单数据
const form = ref({
  title: '',
  eventDate: getTodayDate(),
  eventType: 1 as EventType,
  content: '',
  location: '',
  mood: '',
  isImportant: false,
  images: [] as string[]
})

// 事件类型
const eventTypes = [
  { value: 1, label: '纪念日', icon: '💕' },
  { value: 2, label: '日常', icon: '📅' },
  { value: 3, label: '旅行', icon: '✈️' }
]

// 心情选项
const moods = ['😊', '😍', '🥰', '😄', '😎', '🥳', '😌', '😋']

// 编辑模式
const isEdit = ref(false)
const editId = ref<number | null>(null)

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    editId.value = Number(options.id)
    loadEventDetail(editId.value)
  }
})

/**
 * 获取今天日期
 */
function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * 加载事件详情
 */
const loadEventDetail = async (id: number) => {
  try {
    const detail = await timelineStore.getEventDetail(id)
    if (detail) {
      form.value = {
        title: detail.title,
        eventDate: detail.eventDate,
        eventType: detail.eventType,
        content: detail.content || '',
        location: detail.location || '',
        mood: detail.mood || '',
        isImportant: detail.isImportant,
        images: detail.images || []
      }
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

/**
 * 日期选择
 */
const onDateChange = (e: { detail: { value: string } }) => {
  form.value.eventDate = e.detail.value
}

/**
 * 选择图片
 */
const chooseImage = () => {
  const remainCount = 9 - form.value.images.length
  uni.chooseImage({
    count: remainCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images.push(...res.tempFilePaths)
    }
  })
}

/**
 * 删除图片
 */
const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

/**
 * 取消
 */
const handleCancel = () => {
  uni.navigateBack()
}

/**
 * 保存
 */
const handleSave = async () => {
  if (!form.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  
  if (!form.value.eventDate) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '保存中...' })
  
  try {
    if (isEdit.value && editId.value) {
      await timelineStore.updateEvent(editId.value, form.value)
    } else {
      await timelineStore.createEvent(form.value)
    }
    
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.create-page {
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

.btn-save {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $primary;
}

.form-content {
  height: calc(100vh - $status-bar-height - 56px);
  padding: 16px 24px;
}

.form-item {
  margin-bottom: 24px;
  
  &.inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.label {
  display: block;
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin-bottom: 12px;
}

.input {
  height: 48px;
  background: $bg-white;
  border-radius: 12px;
  padding: 0 16px;
  font-size: $font-base;
  color: $text-primary;
}

.picker-value {
  height: 48px;
  background: $bg-white;
  border-radius: 12px;
  padding: 0 16px;
  font-size: $font-base;
  color: $text-primary;
  line-height: 48px;
}

.textarea {
  height: 120px;
  background: $bg-white;
  border-radius: 12px;
  padding: 16px;
  font-size: $font-base;
  color: $text-primary;
  width: 100%;
  box-sizing: border-box;
}

.word-count {
  display: block;
  text-align: right;
  font-size: $font-sm;
  color: $text-muted;
  margin-top: 8px;
}

.type-list {
  display: flex;
  gap: 12px;
}

.type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: $bg-white;
  border-radius: 12px;
  
  &.active {
    background: rgba($primary, 0.1);
    border: 1px solid $primary;
  }
}

.type-icon {
  font-size: 28px;
}

.type-name {
  font-size: $font-sm;
  color: $text-secondary;
}

.mood-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mood-item {
  width: 48px;
  height: 48px;
  background: $bg-white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  &.active {
    background: rgba($primary, 0.1);
    border: 1px solid $primary;
  }
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: $text-white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 100px;
  height: 100px;
  background: $bg-white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed $border-default;
}

.upload-icon {
  font-size: 32px;
  color: $text-muted;
}
</style>
