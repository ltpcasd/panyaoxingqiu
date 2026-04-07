<template>
  <view class="bind-page">
    <view class="content">
      <view class="logo-section">
        <text class="logo-icon"></text>
        <text class="logo-title">潘瑶星球</text>
      </view>
      <view class="id-card">
        <text class="id-label">我的ID码</text>
        <text class="id-code">{{ userStore.userCode || '------' }}</text>
      </view>
      <view class="bind-section">
        <text class="bind-title">绑定伴侣</text>
        <input class="bind-input" v-model="partnerCode" placeholder="输入TA的ID码" maxlength="6" />
        <button class="bind-btn" @click="handleBind">开始绑定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

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
.bind-page { min-height: 100vh; background: linear-gradient(180deg, #FFF5E6 0%, #FFE4CC 100%); }
.content { padding: 80px 32px; display: flex; flex-direction: column; align-items: center; }
.logo-section { text-align: center; margin-bottom: 40px; }
.logo-icon { font-size: 64px; }
.logo-title { font-size: 32px; font-weight: bold; color: #FF6B6B; }
.id-card { width: 100%; background: white; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: center; }
.id-label { font-size: 14px; color: #999; }
.id-code { font-size: 36px; font-weight: bold; color: #FF6B6B; letter-spacing: 8px; }
.bind-section { width: 100%; background: white; border-radius: 20px; padding: 24px; }
.bind-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 16px; display: block; text-align: center; }
.bind-input { width: 100%; height: 56px; background: #F8F8F8; border-radius: 12px; padding: 0 20px; margin-bottom: 16px; font-size: 20px; text-align: center; }
.bind-btn { width: 100%; height: 52px; background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); border-radius: 26px; color: white; font-size: 18px; font-weight: bold; border: none; }
</style>
