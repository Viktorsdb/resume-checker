// AI 调用封装：混元优先，Claude Haiku 兜底
const https = require('https')

const AI_TIMEOUT = 10000 // 10 秒超时

// 调用腾讯混元 AI（通过微信云开发 AI 插件）
async function callHunyuan(prompt) {
  const cloud = require('wx-server-sdk')

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Hunyuan timeout')), AI_TIMEOUT)

    cloud.openapi.ai.chatCompletion({
      model: 'hunyuan-lite',
      messages: [
        { role: 'system', content: '你是一个专业的 HR 和简历优化专家。请严格按照要求的 JSON 格式返回结果。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }).then(res => {
      clearTimeout(timer)
      const content = res.choices?.[0]?.message?.content || ''
      resolve({ text: content, _model: 'hunyuan' })
    }).catch(err => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// 调用 Claude Haiku（兜底）
function callClaude(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Claude timeout')), 30000)

    const body = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: '你是一个专业的 HR 和简历优化专家。请严格按照要求的 JSON 格式返回结果。',
      temperature: 0.3,
    })

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        clearTimeout(timer)
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'Claude API error'))
            return
          }
          const content = parsed.content?.[0]?.text || ''
          resolve({ text: content, _model: 'claude-haiku' })
        } catch (e) {
          reject(new Error('Claude response parse error'))
        }
      })
    })

    req.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    req.write(body)
    req.end()
  })
}

// 主入口：混元优先，失败/超时自动切换 Claude
async function analyzeWithAI(prompt) {
  // 先尝试混元
  try {
    const result = await callHunyuan(prompt)
    if (result.text && result.text.length > 50) {
      return result.text
    }
    throw new Error('Hunyuan response too short')
  } catch (hunyuanErr) {
    console.warn('混元调用失败，切换 Claude:', hunyuanErr.message)
  }

  // 兜底：Claude Haiku
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('无可用的 AI 服务（混元失败，Claude 未配置）')
  }

  try {
    const result = await callClaude(prompt, apiKey)
    result._model = 'claude-haiku'
    return result.text
  } catch (claudeErr) {
    console.error('Claude 调用也失败:', claudeErr.message)
    throw new Error('AI 服务暂时不可用，请稍后重试')
  }
}

module.exports = { analyzeWithAI }
