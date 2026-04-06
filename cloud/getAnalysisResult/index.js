// 获取分析结果
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { analysisId } = event

  if (!analysisId) {
    return { error: '缺少 analysisId' }
  }

  const res = await db.collection('analyses').doc(analysisId).get()
  const analysis = res.data

  if (!analysis || analysis._openid !== OPENID) {
    return { error: '未找到分析记录' }
  }

  // 免费用户只返回基础信息
  return {
    _id: analysis._id,
    jobTitle: analysis.jobTitle,
    score: analysis.score,
    dimensions: analysis.dimensions,
    freeSuggestion: analysis.freeSuggestion,
    aiModel: analysis.aiModel,
    status: analysis.status,
    createdAt: analysis.createdAt,
  }
}
