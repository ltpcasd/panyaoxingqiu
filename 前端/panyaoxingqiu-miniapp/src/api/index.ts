/**
 * API 接口统一导出
 */
// 认证相关
export * from './auth'
import authApi from './auth'

// 用户相关
export * from './user'
import userApi from './user'

// 配对相关  
export {
  createPairCode,
  joinByPairCode,
  getCoupleInfo,
  updateAnniversary,
  updateCoupleAvatar,
  updateBackgroundImage,
  checkCoupleStatus,
  getCachedCoupleInfo,
  getTogetherDays
} from './couple'
import coupleApi from './couple'

// 时光轴相关
export * from './timeline'
import timelineApi from './timeline'

// 相册相关
export * from './album'
import albumApi from './album'

// 默契考验相关
export * from './quiz'
import quizApi from './quiz'

// 任务相关
export * from './task'
import taskApi from './task'

// 信箱相关
export * from './message'
import messageApi from './message'

// 上传相关
export * from './upload'
import uploadApi from './upload'

// 导出所有 API 模块
export {
  authApi,
  userApi,
  coupleApi,
  timelineApi,
  albumApi,
  quizApi,
  taskApi,
  messageApi,
  uploadApi
}

// 默认导出
export default {
  auth: authApi,
  user: userApi,
  couple: coupleApi,
  timeline: timelineApi,
  album: albumApi,
  quiz: quizApi,
  task: taskApi,
  message: messageApi,
  upload: uploadApi
}
