// Vercel Serverless Function - 健康检查
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'panyaoxingqiu-api',
    version: '1.0.0'
  });
}
