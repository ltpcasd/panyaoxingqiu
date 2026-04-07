<template>
  <view class="avatar-crop-page">
    <!-- 头部 -->
    <view class="header">
      <text class="btn-cancel" @click="handleCancel">取消</text>
      <text class="title">裁剪头像</text>
      <text class="btn-done" @click="handleDone">完成</text>
    </view>
    
    <!-- 裁剪区域 -->
    <view class="crop-area">
      <!-- 图片 -->
      <image 
        v-if="imageSrc"
        class="crop-image"
        :src="imageSrc"
        mode="aspectFit"
        :style="imageStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      />
      <!-- 裁剪框 -->
      <view class="crop-frame">
        <view class="crop-circle"></view>
      </view>
      <!-- 提示文字 -->
      <text class="crop-tip">双指缩放调整大小，拖动调整位置</text>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="toolbar">
      <view class="tool-item" @click="chooseFromAlbum">
        <text class="tool-icon">🖼️</text>
        <text class="tool-text">相册</text>
      </view>
      <view class="tool-item" @click="takePhoto">
        <text class="tool-icon">📷</text>
        <text class="tool-text">拍照</text>
      </view>
      <view class="tool-item" @click="rotateImage">
        <text class="tool-icon">🔄</text>
        <text class="tool-text">旋转</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 图片路径
const imageSrc = ref('')

// 图片变换参数
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const rotation = ref(0)

// 触摸相关
const touches = ref<Touch[]>([])
const initialDistance = ref(0)
const initialScale = ref(1)

// 图片样式
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`
}))

// 裁剪类型
const cropType = ref<'personal' | 'couple'>('personal')

onLoad((options) => {
  cropType.value = options?.type as 'personal' | 'couple' || 'personal'
  
  // 如果有传入图片路径
  if (options?.src) {
    imageSrc.value = options.src
  } else {
    // 默认选择图片
    chooseFromAlbum()
  }
})

/**
 * 从相册选择
 */
const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      imageSrc.value = res.tempFilePaths[0]
      resetTransform()
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
      imageSrc.value = res.tempFilePaths[0]
      resetTransform()
    }
  })
}

/**
 * 重置变换
 */
const resetTransform = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  rotation.value = 0
}

/**
 * 旋转图片
 */
const rotateImage = () => {
  rotation.value = (rotation.value + 90) % 360
}

/**
 * 触摸开始
 */
const handleTouchStart = (e: TouchEvent) => {
  touches.value = Array.from(e.touches)
  
  if (touches.value.length === 2) {
    // 双指缩放
    const touch1 = touches.value[0]
    const touch2 = touches.value[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    initialDistance.value = distance
    initialScale.value = scale.value
  }
}

/**
 * 触摸移动
 */
const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  
  const currentTouches = Array.from(e.touches)
  
  if (currentTouches.length === 2 && touches.value.length === 2) {
    // 双指缩放
    const touch1 = currentTouches[0]
    const touch2 = currentTouches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    const scaleRatio = distance / initialDistance.value
    scale.value = Math.max(0.5, Math.min(3, initialScale.value * scaleRatio))
  } else if (currentTouches.length === 1) {
    // 单指拖动
    const touch = currentTouches[0]
    const prevTouch = touches.value[0]
    
    if (prevTouch) {
      const deltaX = touch.clientX - prevTouch.clientX
      const deltaY = touch.clientY - prevTouch.clientY
      
      translateX.value += deltaX
      translateY.value += deltaY
    }
    
    touches.value = currentTouches
  }
}

/**
 * 触摸结束
 */
const handleTouchEnd = () => {
  touches.value = []
}

/**
 * 取消
 */
const handleCancel = () => {
  uni.navigateBack()
}

/**
 * 完成裁剪
 */
const handleDone = async () => {
  if (!imageSrc.value) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '处理中...' })
  
  try {
    // TODO: 调用后端接口上传裁剪后的图片
    // const res = await uploadCroppedImage(imageSrc.value)
    
    // 模拟上传成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.hideLoading()
    uni.showToast({ title: '设置成功', icon: 'success' })
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '处理失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.avatar-crop-page {
  min-height: 100vh;
  background: $bg-white;
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

.btn-cancel {
  font-size: $font-base;
  color: $text-secondary;
}

.title {
  font-size: $font-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.btn-done {
  font-size: $font-base;
  color: $primary;
  font-weight: $font-semibold;
}

.crop-area {
  flex: 1;
  background: #1a1a1a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.crop-image {
  max-width: 100%;
  max-height: 100%;
  transition: none;
}

.crop-frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.crop-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 2px solid $bg-white;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
}

.crop-tip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba($bg-white, 0.8);
  font-size: $font-sm;
}

.toolbar {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 24px;
  background: $bg-white;
  border-top: 1px solid $border-light;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tool-icon {
  font-size: 24px;
}

.tool-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
