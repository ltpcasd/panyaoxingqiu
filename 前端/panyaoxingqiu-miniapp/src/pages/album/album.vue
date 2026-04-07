<template>
  <view class="album-page">
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
        <text class="page-title">记忆星云</text>
      </view>
      
      <!-- 添加按钮 -->
      <view class="btn-add" @click="handleAdd">
        <text class="add-icon">+</text>
      </view>
    </view>
    
    <!-- 相册分类 -->
    <scroll-view class="category-list" scroll-x>
      <view 
        v-for="(album, index) in albumStore.albums" 
        :key="album.id"
        class="category-item"
        :class="{ active: albumStore.currentAlbumId === album.id }"
        @click="selectAlbum(album.id)"
      >
        <text>{{ album.name }}</text>
      </view>
    </scroll-view>
    
    <!-- 照片网格 -->
    <scroll-view 
      class="photo-grid" 
      scroll-y
      @scrolltolower="loadMore"
    >
      <view class="grid">
        <view 
          v-for="(photo, index) in photoList" 
          :key="photo.id"
          class="photo-item"
          :style="{ backgroundColor: getRandomColor(index) }"
          @click="previewPhoto(photo, index)"
        >
          <image 
            v-if="photo.originalUrl"
            :src="photo.originalUrl"
            mode="aspectFill"
          />
          <text v-else class="photo-placeholder">{{ getEmoji(index) }}</text>
        </view>
      </view>
      
      <!-- 照片统计 -->
      <view class="photo-count">
        <text>共 {{ albumStore.totalPhotos }} 张照片</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useAlbumStore } from '@/stores/album'
import type { Photo } from '@/types'

const userStore = useUserStore()
const albumStore = useAlbumStore()

// 照片列表
const photoList = ref<Photo[]>([])

// 表情列表
const emojis = ['🌅', '🍰', '🏖️', '🎁', '🌸', '🎄', '🌈', '💕', '📷', '🎉', '🌺', '🌙']

// 颜色列表
const colors = [
  'linear-gradient(135deg, #FF9A8B 0%, #FFB4A8 100%)',
  'linear-gradient(135deg, #F4D03F 0%, #F7DC6F 100%)',
  'linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)',
  'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)',
  'linear-gradient(135deg, #FD79A8 0%, #E84393 100%)',
  'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)'
]

onLoad(() => {
  albumStore.fetchAlbums()
  loadPhotos()
})

/**
 * 获取表情
 */
const getEmoji = (index: number): string => {
  return emojis[index % emojis.length]
}

/**
 * 获取随机颜色
 */
const getRandomColor = (index: number): string => {
  return colors[index % colors.length]
}

/**
 * 选择相册
 */
const selectAlbum = (albumId: number) => {
  albumStore.fetchPhotos(albumId)
  loadPhotos()
}

/**
 * 加载照片
 */
const loadPhotos = async () => {
  try {
    if (albumStore.currentAlbumId) {
      await albumStore.fetchPhotos(albumStore.currentAlbumId)
    } else {
      await albumStore.fetchAllPhotos()
    }
    photoList.value = albumStore.photos
  } catch (error) {
    console.error('加载照片失败:', error)
  }
}

/**
 * 加载更多
 */
const loadMore = () => {
  // TODO: 分页加载
}

/**
 * 添加照片
 */
const handleAdd = () => {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseFromAlbum()
      } else if (res.tapIndex === 1) {
        takePhoto()
      }
    }
  })
}

/**
 * 从相册选择
 */
const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      // 上传照片
      uploadPhotos(res.tempFilePaths)
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
      uploadPhotos(res.tempFilePaths)
    }
  })
}

/**
 * 上传照片
 */
const uploadPhotos = async (filePaths: string[]) => {
  uni.showLoading({ title: '上传中...' })
  
  try {
    for (const path of filePaths) {
      await albumStore.uploadPhoto(path, albumStore.currentAlbumId || undefined)
    }
    
    uni.hideLoading()
    uni.showToast({ title: '上传成功', icon: 'success' })
    
    // 刷新列表
    loadPhotos()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}

/**
 * 预览照片
 */
const previewPhoto = (photo: Photo, index: number) => {
  const urls = photoList.value.map(p => p.originalUrl || '').filter(Boolean)
  
  uni.previewImage({
    urls: urls.length > 0 ? urls : [],
    current: index
  })
}
</script>

<style lang="scss" scoped>
.album-page {
  min-height: 100vh;
  background: $bg-cream;
}

.status-bar {
  height: $status-bar-height;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.btn-add {
  width: 44px;
  height: 44px;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
}

.add-icon {
  font-size: 28px;
  color: $text-white;
  font-weight: $font-light;
}

.category-list {
  padding: 0 24px 16px;
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 8px 20px;
  background: $bg-white;
  border-radius: 9999px;
  margin-right: 12px;
  font-size: $font-sm;
  color: $text-secondary;
  
  &.active {
    background: $primary;
    color: $text-white;
  }
  
  &:last-child {
    margin-right: 0;
  }
}

.photo-grid {
  height: calc(100vh - $status-bar-height - 76px - 60px - $tabbar-height);
  padding: 0 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.photo-placeholder {
  font-size: 32px;
}

.photo-count {
  text-align: center;
  padding: 24px;
  font-size: $font-sm;
  color: $text-muted;
}
</style>
