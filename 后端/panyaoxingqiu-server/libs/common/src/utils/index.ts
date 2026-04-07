import * as crypto from 'crypto';

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * 生成配对码 (4位数字)
 */
export function generatePairCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * 计算在一起的天数
 */
export function calculateTogetherDays(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 解密微信加密数据
 */
export function decryptWechatData(
  encryptedData: string,
  iv: string,
  sessionKey: string,
): Record<string, any> {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(sessionKey, 'base64'),
    Buffer.from(iv, 'base64'),
  );
  decipher.setAutoPadding(true);

  let decoded = decipher.update(encryptedData, 'base64', 'utf8');
  decoded += decipher.final('utf8');

  return JSON.parse(decoded);
}

/**
 * 生成JWT Token
 */
export function generateToken(payload: Record<string, any>, secret: string, expiresIn = '7d'): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * 验证JWT Token
 */
export function verifyToken(token: string, secret: string): Record<string, any> {
  const jwt = require('jsonwebtoken');
  return jwt.verify(token, secret);
}

/**
 * 计算等级
 */
export function calculateLevel(score: number): { level: number; title: string } {
  const levels = [
    { min: 0, max: 99, level: 1, title: '初识' },
    { min: 100, max: 299, level: 2, title: '相识' },
    { min: 300, max: 599, level: 3, title: '熟悉' },
    { min: 600, max: 999, level: 4, title: '暧昧' },
    { min: 1000, max: 1499, level: 5, title: '表白' },
    { min: 1500, max: 2099, level: 6, title: '牵手' },
    { min: 2100, max: 2799, level: 7, title: '相恋' },
    { min: 2800, max: 3599, level: 8, title: '热恋' },
    { min: 3600, max: 4499, level: 9, title: '默契' },
    { min: 4500, max: 5499, level: 10, title: '依赖' },
    { min: 5500, max: 6599, level: 11, title: '承诺' },
    { min: 6600, max: 7799, level: 12, title: '甜蜜恋人' },
    { min: 7800, max: 9099, level: 13, title: '灵魂伴侣' },
    { min: 9100, max: 10499, level: 14, title: '命中注定' },
    { min: 10500, max: Infinity, level: 15, title: '永恒之爱' },
  ];

  const levelInfo = levels.find((l) => score >= l.min && score <= l.max) || levels[0];
  return { level: levelInfo.level, title: levelInfo.title };
}

/**
 * 获取下一级所需分数
 */
export function getNextLevelScore(currentLevel: number): number {
  const levelScores = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  return levelScores[currentLevel] || levelScores[levelScores.length - 1];
}
