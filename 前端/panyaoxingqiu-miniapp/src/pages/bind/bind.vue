<template>
  <view class="bind-page">
    <view class="content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo-icon">
          <GiIcon name="heart" :size="44" color="#fff" />
        </view>
        <text class="logo-title">潘瑶星球</text>
        <text class="logo-subtitle">两个人的专属空间</text>
      </view>
      
      <!-- ID码卡片 -->
      <view class="id-card">
        <text class="id-label">我的ID码</text>
        <text class="id-code">{{ (userStore.userInfo as any)?.userCode || userStore.userId?.toString().padStart(6, '0').slice(-6) || '------' }}</text>
        <text class="id-hint">将此ID码分享给TA完成绑定</text>
      </view>
      
      <!-- 绑定卡片 -->
      <view class="bind-card">
        <text class="bind-title">绑定伴侣</text>
        <input class="bind-input" v-model="partnerCode" placeholder="输入TA的ID码" maxlength="6" />
        <button class="bind-btn" @click="handleBind">开始绑定</button>
      </view>
      
      <!-- 步骤说明 -->
      <view class="steps">
        <view class="step-item">
          <view class="step-num">1</view>
          <text class="step-text">将你的ID码分享给TA</text>
        </view>
        <view class="step-item">
          <view class="step-num">2</view>
          <text class="step-text">TA输入你的ID码完成绑定</text>
        </view>
        <view class="step-item">
          <view class="step-num">3</view>
          <text class="step-text">绑定后解锁所有情侣功能</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import GiIcon from '@/components/GiIcon.vue'

const userStore = useUserStore()
const partnerCode = ref('')

onLoad(() => {
  if (!userStore.isLoggedIn) userStore.init()
})

const handleBind = async () => {
  if (partnerCode.value.length !== 6) {
    uni.showToast({ title: '请输入6位ID码', icon: 'none' })
    return
  }
  const result = await userStore.bindCouple(partnerCode.value.toUpperCase())
  if (result.success) {
    uni.switchTab({ url: '/pages/index/index' })
  } else {
    uni.showToast({ title: result.message, icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.bind-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FFF5F0 0%, #FFE8E0 50%, #FFF0E5 100%);
}

.content {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, $coral 0%, $peach 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: $shadow-glow;
}

.logo-title {
  font-size: $font-3xl;
  font-weight: $font-bold;
  color: $coral;
  display: block;
  margin-bottom: 6px;
}

.logo-subtitle {
  font-size: $font-sm;
  color: $text-secondary;
}

.id-card {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-xl;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: $shadow-card;
}

.id-label {
  font-size: $font-sm;
  color: $text-secondary;
  display: block;
  margin-bottom: 12px;
}

.id-code {
  font-size: 36px;
  font-weight: $font-bold;
  color: $coral;
  letter-spacing: 6px;
  font-family: 'Courier New', monospace;
}

.id-hint {
  font-size: $font-xs;
  color: $text-muted;
  display: block;
  margin-top: 12px;
}

.bind-card {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-xl;
  padding: 24px;
  box-shadow: $shadow-card;
}

.bind-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  display: block;
  text-align: center;
  margin-bottom: 16px;
}

.bind-input {
  width: 100%;
  height: 54px;
  background: $bg-cream;
  border: 2px solid transparent;
  border-radius: $radius-md;
  padding: 0 20px;
  margin-bottom: 14px;
  font-size: 20px;
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: $text-primary;
  
  &:focus {
    border-color: $coral;
  }
}

.bind-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, $coral 0%, $peach 100%);
  border-radius: $radius-lg;
  color: $text-white;
  font-size: $font-lg;
  font-weight: $font-semibold;
  border: none;
  box-shadow: $shadow-soft;
  
  &:active {
    transform: scale(0.98);
  }
}

.steps {
  margin-top: 24px;
  padding: 0 10px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, $coral 0%, $peach 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-white;
  font-size: $font-sm;
  font-weight: $font-semibold;
  flex-shrink: 0;
}

.step-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
