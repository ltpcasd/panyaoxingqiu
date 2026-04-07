/**
 * 相册相关 API
 */
import { get, post, put, del } from '@/utils/request'
import type { Album, Photo } from '@/types'

// 创建相册参数
interface CreateAlbumParams {
  name: string
  description?: string
}

// 照片查询参数
interface PhotoQueryParams {
  page?: number
  pageSize?: number
}

/**
 * 获取相册列表
 */
export async function getAlbums(): Promise<Album[]> {
  return get<Album[]>('/album')
}

/**
 * 获取相册详情
 * @param albumId 相册ID
 */
export async function getAlbumDetail(albumId: number): Promise<Album> {
  return get<Album>(`/album/${albumId}`)
}

/**
 * 创建相册
 * @param data 相册数据
 */
export async function createAlbum(data: CreateAlbumParams): Promise<Album> {
  return post<Album>('/album', data as Record<string, unknown>)
}

/**
 * 更新相册
 * @param albumId 相册ID
 * @param data 相册数据
 */
export async function updateAlbum(albumId: number, data: Partial<CreateAlbumParams>): Promise<Album> {
  return put<Album>(`/album/${albumId}`, data as Record<string, unknown>)
}

/**
 * 删除相册
 * @param albumId 相册ID
 */
export async function deleteAlbum(albumId: number): Promise<void> {
  return del<void>(`/album/${albumId}`)
}

/**
 * 获取相册照片列表
 * @param albumId 相册ID
 * @param params 查询参数
 */
export async function getPhotos(albumId: number, params: PhotoQueryParams = {}): Promise<Photo[]> {
  return get<Photo[]>(`/album/${albumId}/photos`, params as Record<string, unknown>)
}

/**
 * 获取所有照片（时间线视图）
 * @param params 查询参数
 */
export async function getAllPhotos(params: PhotoQueryParams = {}): Promise<Photo[]> {
  return get<Photo[]>('/album/photos/all', params as Record<string, unknown>)
}

/**
 * 获取照片详情
 * @param photoId 照片ID
 */
export async function getPhotoDetail(photoId: number): Promise<Photo> {
  return get<Photo>(`/album/photo/${photoId}`)
}

/**
 * 删除照片
 * @param photoId 照片ID
 */
export async function deletePhoto(photoId: number): Promise<void> {
  return del<void>(`/album/photo/${photoId}`)
}

/**
 * 更新照片描述
 * @param photoId 照片ID
 * @param description 描述
 */
export async function updatePhotoDescription(photoId: number, description: string): Promise<Photo> {
  return put<Photo>(`/album/photo/${photoId}`, { description })
}

/**
 * 移动照片到其他相册
 * @param photoId 照片ID
 * @param targetAlbumId 目标相册ID
 */
export async function movePhoto(photoId: number, targetAlbumId: number): Promise<Photo> {
  return put<Photo>(`/album/photo/${photoId}/move`, { targetAlbumId })
}

/**
 * 设置相册封面
 * @param albumId 相册ID
 * @param photoId 照片ID
 */
export async function setAlbumCover(albumId: number, photoId: number): Promise<Album> {
  return put<Album>(`/album/${albumId}/cover`, { photoId })
}

/**
 * 获取相册统计
 */
export async function getAlbumStats(): Promise<{
  totalAlbums: number
  totalPhotos: number
  totalSize: number
}> {
  return get('/album/stats')
}

export default {
  getAlbums,
  getAlbumDetail,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPhotos,
  getAllPhotos,
  getPhotoDetail,
  deletePhoto,
  updatePhotoDescription,
  movePhoto,
  setAlbumCover,
  getAlbumStats
}
