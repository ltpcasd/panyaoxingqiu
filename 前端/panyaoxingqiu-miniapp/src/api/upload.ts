/**
 * 上传相关 API
 */
import { API_BASE_URL, UPLOAD_CONFIG, STORAGE_KEYS } from '@/config'
import type { UploadResult } from '@/types'

// 上传类型
export type UploadType = 'avatar' | 'couple-avatar' | 'background' | 'timeline' | 'album' | 'letter'

// 上传配置
interface UploadOptions {
  type: UploadType
  albumId?: number
  onProgress?: (progress: number) => void
}

// 上传响应
interface UploadResponse {
  code: number
  data: UploadResult
  message: string
}

// UniApp 上传响应类型
interface UniUploadSuccessCallbackResult {
  statusCode: number
  data: string
}

interface UniUploadFailCallbackError {
  errMsg: string
}

interface UniProgressUpdateResult {
  progress: number
  totalBytesSent: number
  totalBytesExpectedToSend: number
}

interface UniChooseImageSuccessCallbackResult {
  tempFilePaths: string[]
  tempFiles: { path: string; size: number }[]
}

interface UniChooseVideoSuccessCallbackResult {
  tempFilePath: string
  duration: number
  size: number
  height: number
  width: number
}

interface UniRequestSuccessCallbackResult {
  statusCode: number
  data: unknown
}

/**
 * 获取存储的 Token
 */
function getToken(): string {
  return uni.getStorageSync(STORAGE_KEYS.TOKEN) || ''
}

/**
 * 上传单个文件
 * @param filePath 文件路径
 * @param options 上传配置
 */
export function uploadFile(filePath: string, options: UploadOptions): Promise<UploadResult> {
  const { type, albumId, onProgress } = options

  return new Promise((resolve, reject) => {
    const token = getToken()
    const uploadTask = uni.uploadFile({
      url: `${API_BASE_URL}/upload`,
      filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      formData: {
        type,
        ...(albumId ? { albumId: String(albumId) } : {})
      },
      success: (res: UniUploadSuccessCallbackResult) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data) as UploadResponse
            if (data.code === 0 || data.code === 200) {
              resolve(data.data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch {
            reject(new Error('响应解析失败'))
          }
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (err: UniUploadFailCallbackError) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })

    // 监听上传进度
    if (onProgress) {
      uploadTask.onProgressUpdate((res: UniProgressUpdateResult) => {
        onProgress(res.progress)
      })
    }
  })
}

/**
 * 上传多张图片
 * @param fileList 文件路径数组
 * @param options 上传配置
 */
export async function uploadMultiple(fileList: string[], options: UploadOptions): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (const path of fileList) {
    try {
      const result = await uploadFile(path, options)
      results.push(result)
    } catch (error) {
      console.error('上传失败:', path, error)
    }
  }
  
  return results
}

/**
 * 选择并上传图片
 * @param options 上传配置
 * @param count 选择数量
 */
export async function chooseAndUpload(options: UploadOptions, count: number = 1): Promise<UploadResult[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: Math.min(count, UPLOAD_CONFIG.maxCount),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res: UniChooseImageSuccessCallbackResult) => {
        try {
          const results = await uploadMultiple(res.tempFilePaths, options)
          resolve(results)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err: UniUploadFailCallbackError) => {
        reject(new Error(err.errMsg || '选择图片失败'))
      }
    })
  })
}

/**
 * 选择并上传视频
 * @param options 上传配置
 */
export async function chooseAndUploadVideo(options: UploadOptions): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: async (res: UniChooseVideoSuccessCallbackResult) => {
        try {
          const result = await uploadFile(res.tempFilePath, { ...options, type: 'video' as UploadType })
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err: UniUploadFailCallbackError) => {
        reject(new Error(err.errMsg || '选择视频失败'))
      }
    })
  })
}

/**
 * 上传头像
 * @param filePath 文件路径
 */
export async function uploadAvatar(filePath: string): Promise<UploadResult> {
  return uploadFile(filePath, { type: 'avatar' })
}

/**
 * 上传双人头像
 * @param filePath 文件路径
 */
export async function uploadCoupleAvatar(filePath: string): Promise<UploadResult> {
  return uploadFile(filePath, { type: 'couple-avatar' })
}

/**
 * 上传背景图
 * @param filePath 文件路径
 */
export async function uploadBackground(filePath: string): Promise<UploadResult> {
  return uploadFile(filePath, { type: 'background' })
}

/**
 * 上传时光轴图片
 * @param fileList 文件路径数组
 */
export async function uploadTimelineImages(fileList: string[]): Promise<UploadResult[]> {
  return uploadMultiple(fileList, { type: 'timeline' })
}

/**
 * 上传相册照片
 * @param fileList 文件路径数组
 * @param albumId 相册ID
 */
export async function uploadAlbumPhotos(fileList: string[], albumId?: number): Promise<UploadResult[]> {
  return uploadMultiple(fileList, { type: 'album', albumId })
}

/**
 * 获取上传签名（用于直传OSS）
 */
export async function getUploadSignature(type: UploadType): Promise<{
  signature: string
  policy: string
  host: string
  dir: string
  expire: number
}> {
  const token = getToken()
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}/upload/signature`,
      method: 'POST',
      data: { type },
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res: UniRequestSuccessCallbackResult) => {
        if (res.statusCode === 200) {
          resolve(res.data as { signature: string; policy: string; host: string; dir: string; expire: number })
        } else {
          reject(new Error('获取签名失败'))
        }
      },
      fail: () => {
        reject(new Error('网络请求失败'))
      }
    })
  })
}

export default {
  uploadFile,
  uploadMultiple,
  chooseAndUpload,
  chooseAndUploadVideo,
  uploadAvatar,
  uploadCoupleAvatar,
  uploadBackground,
  uploadTimelineImages,
  uploadAlbumPhotos,
  getUploadSignature
}
