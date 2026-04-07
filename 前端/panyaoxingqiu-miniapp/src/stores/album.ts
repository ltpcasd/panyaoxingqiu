import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Album, Photo } from '@/types'
import * as albumApi from '@/api/album'
import * as uploadApi from '@/api/upload'

/**
 * 相册状态管理
 */
export const useAlbumStore = defineStore('album', () => {
  // ==================== State ====================
  
  /** 相册列表 */
  const albums = ref<Album[]>([])
  
  /** 当前相册照片 */
  const photos = ref<Photo[]>([])
  
  /** 当前选中的相册ID */
  const currentAlbumId = ref<number | null>(null)
  
  /** 是否加载中 */
  const loading = ref(false)

  // ==================== Getters ====================
  
  /** 当前相册 */
  const currentAlbum = computed(() => 
    albums.value.find(a => a.id === currentAlbumId.value)
  )
  
  /** 照片总数 */
  const totalPhotos = computed(() => 
    albums.value.reduce((sum, album) => sum + album.photoCount, 0)
  )

  // ==================== Actions ====================
  
  /**
   * 获取相册列表
   */
  const fetchAlbums = async () => {
    loading.value = true
    
    try {
      albums.value = await albumApi.getAlbums()
    } catch (error) {
      console.error('获取相册列表失败:', error)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取照片列表
   */
  const fetchPhotos = async (albumId: number) => {
    loading.value = true
    currentAlbumId.value = albumId
    
    try {
      photos.value = await albumApi.getPhotos(albumId)
    } catch (error) {
      console.error('获取照片列表失败:', error)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取所有照片
   */
  const fetchAllPhotos = async () => {
    loading.value = true
    
    try {
      photos.value = await albumApi.getAllPhotos()
    } catch (error) {
      console.error('获取照片列表失败:', error)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 上传照片
   */
  const uploadPhoto = async (filePath: string, albumId?: number): Promise<boolean> => {
    try {
      const result = await uploadApi.uploadFile(filePath, { 
        type: 'album',
        albumId 
      })
      
      // 添加到照片列表
      const newPhoto: Photo = {
        id: Date.now(),
        albumId: albumId || 0,
        coupleId: 0,
        uploaderId: 0,
        originalUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        width: result.width,
        height: result.height,
        size: result.size,
        createdAt: new Date().toISOString()
      }
      
      photos.value.unshift(newPhoto)
      
      // 更新相册照片数量
      if (albumId) {
        const album = albums.value.find(a => a.id === albumId)
        if (album) {
          album.photoCount++
        }
      }
      
      uni.showToast({ title: '上传成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('上传照片失败:', error)
      uni.showToast({ title: '上传失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 批量上传照片
   */
  const uploadPhotos = async (filePaths: string[], albumId?: number): Promise<boolean> => {
    try {
      const results = await uploadApi.uploadMultiple(filePaths, { 
        type: 'album',
        albumId 
      })
      
      // 刷新照片列表
      if (albumId) {
        await fetchPhotos(albumId)
      } else {
        await fetchAllPhotos()
      }
      
      uni.showToast({ title: `上传成功 ${results.length} 张`, icon: 'success' })
      return true
    } catch (error) {
      console.error('批量上传失败:', error)
      uni.showToast({ title: '上传失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 创建相册
   */
  const createAlbum = async (name: string): Promise<boolean> => {
    try {
      const newAlbum = await albumApi.createAlbum({ name })
      albums.value.push(newAlbum)
      
      uni.showToast({ title: '创建成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('创建相册失败:', error)
      uni.showToast({ title: '创建失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 更新相册
   */
  const updateAlbum = async (albumId: number, name: string): Promise<boolean> => {
    try {
      const updatedAlbum = await albumApi.updateAlbum(albumId, { name })
      const index = albums.value.findIndex(a => a.id === albumId)
      if (index > -1) {
        albums.value[index] = updatedAlbum
      }
      
      uni.showToast({ title: '更新成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('更新相册失败:', error)
      uni.showToast({ title: '更新失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 删除相册
   */
  const deleteAlbum = async (albumId: number): Promise<boolean> => {
    try {
      await albumApi.deleteAlbum(albumId)
      albums.value = albums.value.filter(a => a.id !== albumId)
      
      uni.showToast({ title: '删除成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('删除相册失败:', error)
      uni.showToast({ title: '删除失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 删除照片
   */
  const deletePhoto = async (photoId: number): Promise<boolean> => {
    try {
      await albumApi.deletePhoto(photoId)
      photos.value = photos.value.filter(p => p.id !== photoId)
      
      // 更新相册照片数量
      if (currentAlbumId.value) {
        const album = albums.value.find(a => a.id === currentAlbumId.value)
        if (album && album.photoCount > 0) {
          album.photoCount--
        }
      }
      
      uni.showToast({ title: '删除成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('删除照片失败:', error)
      uni.showToast({ title: '删除失败', icon: 'none' })
      return false
    }
  }
  
  /**
   * 设置相册封面
   */
  const setAlbumCover = async (albumId: number, photoId: number): Promise<boolean> => {
    try {
      const updatedAlbum = await albumApi.setAlbumCover(albumId, photoId)
      const index = albums.value.findIndex(a => a.id === albumId)
      if (index > -1) {
        albums.value[index] = updatedAlbum
      }
      
      uni.showToast({ title: '设置成功', icon: 'success' })
      return true
    } catch (error) {
      console.error('设置封面失败:', error)
      uni.showToast({ title: '设置失败', icon: 'none' })
      return false
    }
  }

  return {
    // State
    albums,
    photos,
    currentAlbumId,
    loading,
    
    // Getters
    currentAlbum,
    totalPhotos,
    
    // Actions
    fetchAlbums,
    fetchPhotos,
    fetchAllPhotos,
    uploadPhoto,
    uploadPhotos,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    deletePhoto,
    setAlbumCover
  }
})
