// 产品定价（单位：分）
export const PRICING = {
  report: {
    amount: 590,
    label: '完整诊断报告',
    description: '所有问题 + 关键词差距 + 量化建议',
  },
  rewrite: {
    amount: 1990,
    label: 'AI 一键重写',
    description: '优化简历 + 重新评分对比',
  },
  full: {
    amount: 3990,
    label: '全套优化',
    description: '重写优化 + 模拟面试 10 题',
  },
} as const

// 评分维度
export const DIMENSIONS = {
  relevance: '岗位匹配',
  experience: '经验匹配',
  skills: '技能匹配',
  education: '学历匹配',
  expression: '表达质量',
  structure: '结构规范',
} as const

// 免费使用次数上限
export const FREE_QUOTA = 3

// AI 超时时间（毫秒）
export const AI_TIMEOUT = 10000

// 简历最大长度（字符）
export const MAX_RESUME_LENGTH = 5000

// JD 最大长度（字符）
export const MAX_JD_LENGTH = 3000

// 评分等级
export function getScoreLevel(score: number): {
  label: string
  color: string
  emoji: string
} {
  if (score >= 85) return { label: '优秀', color: '#22c55e', emoji: '🎉' }
  if (score >= 70) return { label: '良好', color: '#3b82f6', emoji: '👍' }
  if (score >= 50) return { label: '一般', color: '#f59e0b', emoji: '⚠️' }
  return { label: '需改进', color: '#ef4444', emoji: '🔴' }
}
