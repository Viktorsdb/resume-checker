// 简历分析主云函数
// 接收 JD + 简历 → 调用 AI 分析 → 写入数据库 → 返回 analysisId
const cloud = require('wx-server-sdk')
const { analyzeWithAI } = require('./ai')
const { buildAnalysisPrompt } = require('./prompts')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { jobDescription, resumeText, jdSource = 'paste', resumeId } = event

  // 参数校验
  if (!jobDescription || jobDescription.trim().length < 10) {
    return { error: '岗位描述太短，请输入完整的 JD' }
  }
  if (!resumeText || resumeText.trim().length < 20) {
    return { error: '简历内容太短，请输入完整的简历' }
  }

  // 检查免费额度
  const userRes = await db.collection('users').where({ _openid: OPENID }).get()
  let user = userRes.data[0]

  if (!user) {
    // 新用户，创建记录
    const addRes = await db.collection('users').add({
      data: {
        _openid: OPENID,
        freeQuota: 3,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      }
    })
    user = { _id: addRes._id, freeQuota: 3 }
  }

  if (user.freeQuota <= 0) {
    return { error: '免费额度已用完，请购买付费服务继续使用' }
  }

  // 创建分析记录（状态：分析中）
  const analysisRes = await db.collection('analyses').add({
    data: {
      _openid: OPENID,
      resumeId: resumeId || '',
      jobTitle: '',
      jobDescription: jobDescription.trim(),
      jdSource,
      score: 0,
      dimensions: {
        relevance: 0,
        experience: 0,
        skills: 0,
        education: 0,
        expression: 0,
        structure: 0,
      },
      freeSuggestion: '',
      fullReport: null,
      rewrittenResume: null,
      interviewQuestions: null,
      aiModel: 'hunyuan',
      status: 'analyzing',
      createdAt: db.serverDate(),
    }
  })

  const analysisId = analysisRes._id

  // 异步调用 AI 分析（不等待，让前端轮询）
  try {
    const prompt = buildAnalysisPrompt(jobDescription.trim(), resumeText.trim())
    const result = await analyzeWithAI(prompt)

    // 解析 AI 返回的 JSON
    let parsed
    try {
      // 尝试从返回文本中提取 JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI 返回格式异常')
      }
    } catch (parseErr) {
      // JSON 解析失败
      await db.collection('analyses').doc(analysisId).update({
        data: { status: 'failed' }
      })
      return { analysisId, error: 'AI 返回格式异常，请重试' }
    }

    // 更新分析结果
    await db.collection('analyses').doc(analysisId).update({
      data: {
        jobTitle: parsed.jobTitle || '未识别',
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        dimensions: {
          relevance: parsed.dimensions?.relevance || 0,
          experience: parsed.dimensions?.experience || 0,
          skills: parsed.dimensions?.skills || 0,
          education: parsed.dimensions?.education || 0,
          expression: parsed.dimensions?.expression || 0,
          structure: parsed.dimensions?.structure || 0,
        },
        freeSuggestion: parsed.freeSuggestion || '暂无建议',
        fullReport: {
          problems: parsed.problems || [],
          keywords: parsed.keywords || { missing: [], matched: [], suggested: [] },
          summary: parsed.summary || '',
        },
        resumeText: resumeText.trim(),
        status: 'done',
      }
    })

    // 扣减免费额度
    await db.collection('users').doc(user._id).update({
      data: {
        freeQuota: db.command.inc(-1),
        updatedAt: db.serverDate(),
      }
    })

  } catch (err) {
    console.error('AI 分析失败:', err)
    await db.collection('analyses').doc(analysisId).update({
      data: { status: 'failed' }
    })
  }

  return { analysisId }
}
