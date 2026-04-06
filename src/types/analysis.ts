// 分析结果类型定义

// 6 个评分维度
export interface Dimensions {
  relevance: number   // 岗位匹配度
  experience: number  // 经验匹配
  skills: number      // 技能匹配
  education: number   // 学历匹配
  expression: number  // 表达质量
  structure: number   // 结构规范
}

// 问题条目
export interface Problem {
  category: string
  description: string
  severity: 'high' | 'medium' | 'low'
  suggestion: string    // 具体修改建议
  example?: string      // 修改示例
}

// 完整报告
export interface FullReport {
  problems: Problem[]
  missingKeywords: string[]    // 缺失的关键词
  existingKeywords: string[]   // 已匹配的关键词
  quantifySuggestions: string[] // 量化建议
  summary: string              // 总结
}

// 面试题
export interface InterviewQuestion {
  question: string
  intent: string             // 考察意图
  suggestedAnswer: string    // 参考答案
  difficulty: 'easy' | 'medium' | 'hard'
}

// 分析记录
export interface Analysis {
  _id: string
  _openid: string
  resumeId: string
  jobTitle: string
  jobDescription: string
  jdSource: 'paste' | 'ocr'
  score: number
  dimensions: Dimensions
  freeSuggestion: string
  fullReport: FullReport | null
  rewrittenResume: string | null
  interviewQuestions: InterviewQuestion[] | null
  aiModel: 'hunyuan' | 'claude'
  status: 'analyzing' | 'done' | 'failed'
  createdAt: string
}

// 订单产品类型
export type ProductType = 'report' | 'rewrite' | 'full'

// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// 订单
export interface Order {
  _id: string
  _openid: string
  analysisId: string
  productType: ProductType
  amount: number          // 金额（分）
  status: OrderStatus
  transactionId: string | null
  paidAt: string | null
  createdAt: string
}
