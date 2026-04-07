<template>
  <view class="bg-select-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">更换主页背景</text>
      <text class="btn-close" @click="handleClose">✕</text>
    </view>
    
    <!-- 来源选项 -->
    <view class="source-options">
      <view 
        v-for="(option, index) in sourceOptions" 
        :key="index"
        class="source-btn"
        :class="{ active: currentSource === index }"
        @click="selectSource(index)"
      >
        <text class="source-icon">{{ option.icon }}</text>
        <text class="source-text">{{ option.name }}</text>
      </view>
    </view>
    
    <!-- 背景列表 -->
    <scroll-view class="bg-list" scroll-y>
      <!-- 渐变背景 -->
      <view class="bg-section">
        <text class="section-title">渐变背景</text>
        <view class="bg-grid">
          <view 
            v-for="(bg, index) in gradientBackgrounds" 
            :key="index"
            class="bg-item"
            :class="{ selected: selectedBg === bg.id }"
            :style="{ background: bg.gradient }"
            @click="selectBackground(bg)"
          />
        </view>
      </view>
      
      <!-- 推荐背景 -->
      <view class="bg-section" v-if="currentSource === 2">
        <text class="section-title">推荐背景</text>
        <view class="bg-grid">
          <view 
            v-for="(bg, index) in recommendedBackgrounds" 
            :key="index"
            class="bg-item"
            :class="{ selected: selectedBg === bg.id }"
            @click="selectBackground(bg)"
          >
            <image :src="bg.url" mode="aspectFill" />
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部按钮 -->
    <view class="footer">
      <button class="btn-apply" @click="handleApply">应用背景</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 来源选项
const sourceOptions = [
  { name: '相册', icon: '🖼️' },
  { name: '拍照', icon: '📷' },
  { name: '推荐', icon: '✨' }
]

const currentSource = ref(2) // 默认推荐

// 渐变背景
const gradientBackgrounds = [
  { id: 'gradient-1', gradient: 'linear-gradient(135deg, #FF9A8B 0%, #F4D03F 100%)' },
  { id: 'gradient-2', gradient: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)' },
  { id: 'gradient-3', gradient: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)' },
  { id: 'gradient-4', gradient: 'linear-gradient(135deg, #FD79A8 0%, #E84393 100%)' },
  { id: 'gradient-5', gradient: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)' },
  { id: 'gradient-6', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)' }
]

// 推荐背景
const recommendedBackgrounds = [
  { id: 'rec-1', url: '/static/bg/romantic.jpg' },
  { id: 'rec-2', url: '/static/bg/sunset.jpg' },
  { id: 'rec-3', url: '/static/bg/starry.jpg' },
  { id: 'rec-4', url: '/static/bg/flowers.jpg' }
]

// 选中的背景
const selectedBg = ref('')

/**
 * 选择来源
 */
const selectSource = (index: number) => {
  currentSource.value = index
  
  if (index === 0) {
    // 从相册选择
    chooseFromAlbum()
  } else if (index === 1) {
    // 拍照
    takePhoto()
  }
}

/**
 * 从相册选择
 */
const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      // 处理选择的图片
      handleCustomImage(res.tempFilePaths[0])
    },
    fail: () => {
      currentSource.value = 2 // 返回推荐
    }
  })
}

/**
 * 拍照
 */
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      handleCustomImage(res.tempFilePaths[0])
    },
    fail: () => {
      currentSource.value = 2 // 返回推荐
    }
  })
}

/**
 * 处理自定义图片
 */
const handleCustomImage = (imagePath: string) => {
  // 可以在这里进行裁剪
  selectedBg.value = 'custom-' + Date.now()
}

/**
 * 选择背景
 */
const selectBackground = (bg: { id: string; gradient?: string; url?: string }) => {
  selectedBg.value = bg.id
}

/**
 * 关闭页面
 */
const handleClose = () => {
  uni.navigateBack()
}

/**
 * 应用背景
 */
const handleApply = async () => {
  if (!selectedBg.value) {
    uni.showToast({ title: '请选择背景', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '应用中...' })
  
  try {
    // TODO: 调用后端接口保存背景设置
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    uni.hideLoading()
    uni.showToast({ title: '应用成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '应用失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.bg-select-page {
  min-height: 100vh;
  background: $bg-cream;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: $bg-white;
  border-bottom: 1px solid $border-light;
}

.title {
  font-size: $font-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.btn-close {
  font-size: $font-xl;
  color: $text-secondary;
  padding: 8px;
}

.source-options {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  background: $bg-white;
  margin-bottom: 16px;
}

.source-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: $bg-cream;
  border: 2px solid transparent;
  border-radius: 12px;
  
  &.active {
    border-color: $primary;
    background: rgba($primary, 0.1);
  }
}

.source-icon {
  font-size: 28px;
}

.source-text {
  font-size: $font-sm;
  color: $text-primary;
}

.bg-list {
  flex: 1;
  padding: 0 24px;
}

.bg-section {
  margin-bottom: 24px;
}

.section-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin-bottom: 16px;
}

.bg-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.bg-item {
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid transparent;
  cursor: pointer;
  
  &.selected {
    border-color: $primary;
  }
  
  image {
    width: 100%;
    height: 100%;
  }
}

.footer {
  padding: 16px 24px;
  background: $bg-white;
  border-top: 1px solid $border-light;
}

.btn-apply {
  @include btn-primary('lg');
  width: 100%;
}
</style>
