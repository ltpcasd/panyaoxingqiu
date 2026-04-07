<template>
  <view class="avatar-settings-page">
    <!-- 头部 -->
    <view class="header">
      <text class="btn-back" @click="handleBack">‹</text>
      <text class="title">头像设置</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 内容区 -->
    <scroll-view class="content" scroll-y>
      <!-- 双人头像 -->
      <view class="section couple-section">
        <text class="section-label">双人头像</text>
        <view class="couple-preview">
          <image 
            class="avatar-large"
            :src="userStore.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <text class="heart-icon">💕</text>
          <image 
            class="avatar-large partner"
            :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
        </view>
        <button class="btn-change" @click="changeCoupleAvatar">
          <text class="btn-icon">✏️</text>
          <text>更换双人头像</text>
        </button>
      </view>
      
      <!-- 个人头像 -->
      <view class="section personal-section">
        <text class="section-label">个人头像</text>
        <view class="personal-avatars">
          <view class="personal-item" @click="changePersonalAvatar">
            <image 
              class="avatar-medium"
              :src="userStore.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="avatar-label">我的头像</text>
          </view>
          <view class="personal-item">
            <image 
              class="avatar-medium partner"
              :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="avatar-label">TA的头像</text>
          </view>
        </view>
      </view>
      
      <!-- 最近使用 -->
      <view class="section history-section">
        <text class="section-label">最近使用</text>
        <scroll-view class="history-list" scroll-x>
          <view 
            v-for="(avatar, index) in recentAvatars" 
            :key="index"
            class="history-item"
            @click="selectHistoryAvatar(avatar)"
          >
            <image :src="avatar" mode="aspectFill" />
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 当前类型
const currentType = ref<'personal' | 'couple'>('personal')

// 最近使用的头像
const recentAvatars = ref([
  '/static/avatar/cat.png',
  '/static/avatar/dog.png',
  '/static/avatar/rabbit.png',
  '/static/avatar/fox.png'
])

onLoad((options) => {
  if (options?.type) {
    currentType.value = options.type as 'personal' | 'couple'
  }
})

/**
 * 返回
 */
const handleBack = () => {
  uni.navigateBack()
}

/**
 * 更换双人头像
 */
const changeCoupleAvatar = () => {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseImage('album', 'couple')
      } else if (res.tapIndex === 1) {
        chooseImage('camera', 'couple')
      }
    }
  })
}

/**
 * 更换个人头像
 */
const changePersonalAvatar = () => {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseImage('album', 'personal')
      } else if (res.tapIndex === 1) {
        chooseImage('camera', 'personal')
      }
    }
  })
}

/**
 * 选择图片
 */
const chooseImage = (sourceType: 'album' | 'camera', type: 'personal' | 'couple') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: [sourceType],
    success: (res) => {
      // 跳转到裁剪页面
      uni.navigateTo({
        url: `/pages/avatar-crop/avatar-crop?src=${res.tempFilePaths[0]}&type=${type}`
      })
    }
  })
}

/**
 * 选择历史头像
 */
const selectHistoryAvatar = (avatar: string) => {
  uni.showModal({
    title: '提示',
    content: '确定使用此头像吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 更新头像
        uni.showToast({ title: '设置成功', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.avatar-settings-page {
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

.btn-back {
  font-size: 32px;
  color: $text-primary;
  padding: 0 8px;
}

.title {
  font-size: $font-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.placeholder {
  width: 40px;
}

.content {
  flex: 1;
  padding: 24px;
}

.section {
  @include card;
  margin-bottom: 24px;
  padding: 32px;
}

.section-label {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 24px;
  text-align: center;
}

.couple-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid $bg-white;
  box-shadow: $shadow-md;
  background: $primary-gradient;
  
  &.partner {
    background: $accent-gradient;
  }
}

.heart-icon {
  font-size: 24px;
}

.btn-change {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba($primary, 0.1);
  border: none;
  border-radius: 9999px;
  color: $primary;
  font-size: $font-base;
  font-weight: $font-semibold;
  margin: 0 auto;
}

.btn-icon {
  font-size: 16px;
}

.personal-avatars {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.personal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-medium {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid $bg-white;
  box-shadow: $shadow-md;
  background: $primary-gradient;
  
  &.partner {
    background: $accent-gradient;
  }
}

.avatar-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.history-list {
  white-space: nowrap;
}

.history-item {
  display: inline-block;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-right: 16px;
  overflow: hidden;
  background: $bg-cream;
  
  image {
    width: 100%;
    height: 100%;
  }
  
  &:last-child {
    margin-right: 0;
  }
}
</style>
