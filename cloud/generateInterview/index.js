// 生成模拟面试题
const cloud = require('wx-server-sdk')
const { analyzeWithAI } = require('../analyzeResume/ai')
const { buildInterviewPrompt } = require('../analyzeResume/prompts')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { analysisId } = event

  if (!analysisId) {
    return { error: '缺少 analysisId' }
  }

  // 验证付费状态（全套服务才包含面试题）
  const orderRes = await db.collection('orders').where({
    _openid: OPENID,
    analysisId,
    status: 'paid',
    productType: 'full',
  }).get()

  if (!orderRes.data.length) {
    return { error: '请先购买全套优化服务' }
  }

  const analysisRes = await db.collection('analyses').doc(analysisId).get()
  const analysis = analysisRes.data

  if (!analysis || analysis._openid !== OPENID) {
    return { error: '未找到分析记录' }
  }

  // 如果已经生成过，直接返回
  if (analysis.interviewQuestions) {
    return { questions: analysis.interviewQuestions }
  }

  try {
    const prompt = buildInterviewPrompt(
      analysis.jobDescription,
      analysis.resumeText || ''
    )
    const result = await analyzeWithAI(prompt)

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { error: 'AI 返回格式异常，请重试' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    await db.collection('analyses').doc(analysisId).update({
      data: {
        interviewQuestions: parsed.questions || [],
      }
    })

    return { questions: parsed.questions || [] }
  } catch (err) {
    console.error('生成面试题失败:', err)
    return { error: '生成失败，请重试' }
  }
}
