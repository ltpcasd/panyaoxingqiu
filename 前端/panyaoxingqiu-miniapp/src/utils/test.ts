/**
 * 联调测试脚本
 * 
 * 在微信开发者工具控制台中执行此脚本进行接口测试
 */

// 测试配置
const API_BASE = 'http://localhost:3000/api/v1'

// 测试工具函数
function log(message: string, data?: unknown) {
  console.log(`[联调测试] ${message}`, data || '')
}

function logError(message: string, error: unknown) {
  console.error(`[联调测试错误] ${message}`, error)
}

// 测试结果
interface TestResult {
  name: string
  success: boolean
  message: string
  data?: unknown
}

const testResults: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<unknown>) {
  try {
    const result = await testFn()
    testResults.push({ name, success: true, message: '测试通过', data: result })
    log(`✅ ${name} - 通过`)
    return result
  } catch (error) {
    testResults.push({ name, success: false, message: String(error) })
    logError(`❌ ${name} - 失败`, error)
    throw error
  }
}

// ==================== 测试用例 ====================

/**
 * 测试服务器连接
 */
async function testServerConnection() {
  return runTest('服务器连接', async () => {
    const res = await uni.request({
      url: `${API_BASE}/health`,
      method: 'GET'
    })
    if (res.statusCode !== 200) {
      throw new Error(`服务器响应异常: ${res.statusCode}`)
    }
    return res.data
  })
}

/**
 * 测试微信登录
 */
async function testWxLogin() {
  return runTest('微信登录', async () => {
    // 获取微信登录凭证
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })
    
    // 调用后端登录接口
    const res = await uni.request({
      url: `${API_BASE}/auth/login`,
      method: 'POST',
      data: {
        code: loginRes.code
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`登录失败: ${res.statusCode}`)
    }
    
    // 保存 token
    const data = res.data as { token: string }
    if (data.token) {
      uni.setStorageSync('token', data.token)
    }
    
    return data
  })
}

/**
 * 测试获取用户信息
 */
async function testGetUserInfo() {
  return runTest('获取用户信息', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/user/info`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取用户信息失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取配对信息
 */
async function testGetCoupleInfo() {
  return runTest('获取配对信息', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/couple/info`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取配对信息失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取时光轴
 */
async function testGetTimeline() {
  return runTest('获取时光轴', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/timeline`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取时光轴失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取相册
 */
async function testGetAlbums() {
  return runTest('获取相册', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/album`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取相册失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取任务
 */
async function testGetTasks() {
  return runTest('获取任务', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/task`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取任务失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取默契考验
 */
async function testGetQuiz() {
  return runTest('获取默契考验', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/quiz/daily`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取默契考验失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

/**
 * 测试获取信箱
 */
async function testGetMessages() {
  return runTest('获取信箱', async () => {
    const token = uni.getStorageSync('token')
    const res = await uni.request({
      url: `${API_BASE}/message`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.statusCode !== 200) {
      throw new Error(`获取信箱失败: ${res.statusCode}`)
    }
    
    return res.data
  })
}

// ==================== 运行所有测试 ====================

async function runAllTests() {
  log('开始联调测试...')
  log(`API 地址: ${API_BASE}`)
  log('======================')
  
  try {
    // 测试服务器连接
    await testServerConnection()
    
    // 测试登录
    await testWxLogin()
    
    // 测试其他接口
    await testGetUserInfo()
    await testGetCoupleInfo()
    await testGetTimeline()
    await testGetAlbums()
    await testGetTasks()
    await testGetQuiz()
    await testGetMessages()
    
    log('======================')
    log('测试完成!')
    
    // 输出测试报告
    const passed = testResults.filter(r => r.success).length
    const failed = testResults.filter(r => !r.success).length
    log(`通过: ${passed}, 失败: ${failed}`)
    
    return testResults
  } catch (error) {
    logError('测试中断', error)
    return testResults
  }
}

// 导出测试函数
export {
  runAllTests,
  testServerConnection,
  testWxLogin,
  testGetUserInfo,
  testGetCoupleInfo,
  testGetTimeline,
  testGetAlbums,
  testGetTasks,
  testGetQuiz,
  testGetMessages
}
