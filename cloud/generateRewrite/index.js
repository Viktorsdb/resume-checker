// 生成 AI 优化简历
const cloud = require('wx-server-sdk')
const { analyzeWithAI } = require('../analyzeResume/ai')
const { buildRewritePrompt } = require('../analyzeResume/prompts')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { analysisId } = event

  if (!analysisId) {
    return { error: '缺少 analysisId' }
  }

  // 验证付费状态
  const orderRes = await db.collection('orders').where({
    _openid: OPENID,
    analysisId,
    status: 'paid',
    productType: db.command.in(['rewrite', 'full']),
  }).get()

  if (!orderRes.data.length) {
    return { error: '请先购买简历优化服务' }
  }

  // 获取分析记录
  const analysisRes = await db.collection('analyses').doc(analysisId).get()
  const analysis = analysisRes.data

  if (!analysis || analysis._openid !== OPENID) {
    return { error: '未找到分析记录' }
  }

  // 如果已经生成过，直接返回
  if (analysis.rewrittenResume) {
    return { rewrittenResume: analysis.rewrittenResume }
  }

  try {
    const prompt = buildRewritePrompt(
      analysis.jobDescription,
      analysis.resumeText || '',
      analysis.fullReport?.problems || []
    )
    const result = await analyzeWithAI(prompt)

    // 解析 JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { error: 'AI 返回格式异常，请重试' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    // 保存结果
    await db.collection('analyses').doc(analysisId).update({
      data: {
        rewrittenResume: parsed,
      }
    })

    return { rewrittenResume: parsed }
  } catch (err) {
    console.error('生成优化简历失败:', err)
    return { error: '生成失败，请重试' }
  }
}
