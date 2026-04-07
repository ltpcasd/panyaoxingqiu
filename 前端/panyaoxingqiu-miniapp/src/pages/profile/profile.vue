<template>
  <view class="profile-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 头部背景 -->
    <view 
      class="header-bg"
      :style="{ backgroundImage: headerBackground }"
      @longpress="handleBgLongPress"
    >
      <!-- 背景编辑按钮 -->
      <view class="bg-edit-btn" @click="handleEditBackground">
        <text class="edit-icon">✏️</text>
      </view>
    </view>
    
    <!-- 主内容 -->
    <scroll-view class="content" scroll-y>
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <!-- 头像 -->
        <view class="avatar-wrapper" @click="handleAvatarClick">
          <image 
            class="user-avatar"
            :src="userStore.avatarUrl || '/static/avatar-default.png'"
            mode="aspectFill"
          />
          <view class="avatar-overlay">
            <text class="camera-icon">📷</text>
          </view>
        </view>
        
        <!-- 用户信息 -->
        <text class="user-name">{{ userStore.nickname }}</text>
        <text class="user-id">ID: {{ userStore.userInfo?.id || '000000' }}</text>
        
        <!-- 配对信息 -->
        <view class="couple-info" v-if="userStore.isPaired">
          <view class="partner">
            <image 
              class="partner-avatar"
              :src="userStore.partner?.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="partner-name">{{ userStore.partner?.nickname }}</text>
          </view>
          <text class="heart">💕</text>
          <text class="days">{{ userStore.togetherDays }} 天</text>
        </view>
      </view>
      
      <!-- 设置列表 -->
      <view class="settings-list">
        <!-- 个人信息 -->
        <view class="settings-group">
          <text class="group-title">个人信息</text>
          <view class="settings-item" @click="navigateTo('/pages/avatar-settings/avatar-settings')">
            <view class="item-icon">📷</view>
            <text class="item-text">头像设置</text>
            <image 
              class="item-avatar"
              :src="userStore.avatarUrl || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <text class="item-arrow">›</text>
          </view>
        </view>
        
        <!-- 个性化设置 -->
        <view class="settings-group">
          <text class="group-title">个性化设置</text>
          <view class="settings-item" @click="navigateTo('/pages/background-select/background-select')">
            <view class="item-icon" style="background: linear-gradient(135deg, rgba(255, 154, 139, 0.2) 0%, rgba(255, 180, 168, 0.2) 100%);">🎨</view>
            <text class="item-text">主页背景</text>
            <text class="item-arrow">›</text>
          </view>
          <view class="settings-item" @click="handleNotification">
            <view class="item-icon">🔔</view>
            <text class="item-text">消息通知</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
        
        <!-- 其他 -->
        <view class="settings-group">
          <text class="group-title">其他</text>
          <view class="settings-item" @click="handleAbout">
            <view class="item-icon">📋</view>
            <text class="item-text">关于潘瑶星球</text>
            <text class="item-arrow">›</text>
          </view>
          <view class="settings-item" @click="handleFeedback">
            <view class="item-icon">💬</view>
            <text class="item-text">意见反馈</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
      
      <!-- 版本号 -->
      <text class="version">版本 2.0.0</text>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 头部背景
const headerBackground = computed(() => {
  if (userStore.backgroundImage) {
    return `url(${userStore.backgroundImage})`
  }
  // 使用 CSS 渐变字符串代替 SCSS 变量
  return 'linear-gradient(135deg, #FF9A8B 0%, #FFB4A8 100%)'
})

onShow(() => {
  // 刷新用户信息
  userStore.fetchUserInfo()
})

/**
 * 长按背景
 */
const handleBgLongPress = () => {
  uni.showActionSheet({
    itemList: ['更换背景图', '使用默认背景'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.navigateTo({ url: '/pages/background-select/background-select' })
      } else if (res.tapIndex === 1) {
        userStore.updateBackground('')
      }
    }
  })
}

/**
 * 点击编辑背景按钮
 */
const handleEditBackground = () => {
  uni.navigateTo({ url: '/pages/background-select/background-select' })
}

/**
 * 点击头像
 */
const handleAvatarClick = () => {
  uni.showActionSheet({
    itemList: ['更换我的头像', '查看大图'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.navigateTo({ url: '/pages/avatar-settings/avatar-settings?type=personal' })
      }
    }
  })
}

/**
 * 页面跳转
 */
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

/**
 * 消息通知设置
 */
const handleNotification = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 关于我们
 */
const handleAbout = () => {
  uni.showModal({
    title: '关于潘瑶星球',
    content: '潘瑶星球 v2.0.0\n\n专为情侣打造的私密互动空间，记录恋爱时光、增进彼此默契、共同完成成长任务。',
    showCancel: false
  })
}

/**
 * 意见反馈
 */
const handleFeedback = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
  background: transparent;
}

.header-bg {
  height: 200px;
  background: $primary-gradient;
  position: relative;
  background-size: cover;
  background-position: center;
}

.bg-edit-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba($bg-white, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  font-size: 16px;
}

.content {
  height: calc(100vh - 200px - $status-bar-height);
}

.user-card {
  @include card;
  margin: -60px 24px 24px;
  padding: 32px;
  text-align: center;
  position: relative;
  z-index: 10;
}

.avatar-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 16px;
  position: relative;
  border: 4px solid $bg-white;
  box-shadow: $shadow-md;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $primary-gradient;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:active .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 28px;
}

.user-name {
  display: block;
  font-size: $font-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 4px;
}

.user-id {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 24px;
}

.couple-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: rgba($primary, 0.1);
  border-radius: 12px;
}

.partner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.partner-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $accent-gradient;
}

.partner-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.heart {
  font-size: $font-lg;
  color: $primary;
}

.days {
  font-size: $font-sm;
  color: $text-secondary;
}

.settings-list {
  padding: 0 24px;
}

.settings-group {
  @include card;
  margin-bottom: 16px;
  padding: 16px 0;
}

.group-title {
  display: block;
  font-size: $font-sm;
  color: $text-muted;
  padding: 8px 24px;
  font-weight: $font-semibold;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  
  &:active {
    background: rgba($primary, 0.05);
  }
}

.item-icon {
  width: 36px;
  height: 36px;
  background: rgba($primary, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 18px;
}

.item-text {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  background: $primary-gradient;
}

.item-arrow {
  font-size: $font-xl;
  color: $text-muted;
}

.version {
  display: block;
  text-align: center;
  padding: 32px;
  font-size: $font-sm;
  color: $text-muted;
}
</style>
