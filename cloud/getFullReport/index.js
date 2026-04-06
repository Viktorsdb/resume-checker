// 获取完整付费报告
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { analysisId } = event

  if (!analysisId) {
    return { error: '缺少 analysisId' }
  }

  // 检查是否已付费
  const orderRes = await db.collection('orders').where({
    _openid: OPENID,
    analysisId,
    status: 'paid',
    productType: db.command.in(['report', 'rewrite', 'full']),
  }).get()

  if (!orderRes.data.length) {
    return { error: '请先购买报告服务' }
  }

  const res = await db.collection('analyses').doc(analysisId).get()
  const analysis = res.data

  if (!analysis || analysis._openid !== OPENID) {
    return { error: '未找到分析记录' }
  }

  // 返回完整报告（包含 problems、keywords、summary）
  return {
    _id: analysis._id,
    jobTitle: analysis.jobTitle,
    score: analysis.score,
    dimensions: analysis.dimensions,
    freeSuggestion: analysis.freeSuggestion,
    fullReport: analysis.fullReport,
    aiModel: analysis.aiModel,
    status: analysis.status,
    createdAt: analysis.createdAt,
  }
}
