import { callCloud } from './cloud'
import type { Analysis, ProductType } from '../types/analysis'

// 提交简历分析
export async function submitAnalysis(params: {
  jobDescription: string
  resumeText: string
  jdSource: 'paste' | 'ocr'
  resumeId?: string
}): Promise<{ analysisId: string }> {
  return callCloud('analyzeResume', params)
}

// 获取分析结果（轮询用）
export async function getAnalysisResult(analysisId: string): Promise<Analysis> {
  return callCloud('getAnalysisResult', { analysisId })
}

// 获取完整报告（需付费）
export async function getFullReport(analysisId: string): Promise<Analysis> {
  return callCloud('getFullReport', { analysisId })
}

// 触发 AI 重写（需付费）
export async function generateRewrite(analysisId: string): Promise<{ rewrittenResume: string }> {
  return callCloud('generateRewrite', { analysisId })
}

// 生成模拟面试题（需付费）
export async function generateInterview(analysisId: string): Promise<{ questions: any[] }> {
  return callCloud('generateInterview', { analysisId })
}

// 创建支付订单
export async function createPayment(analysisId: string, productType: ProductType): Promise<any> {
  return callCloud('createPayment', { analysisId, productType })
}

// OCR 识别图片中的 JD
export async function ocrImage(filePath: string): Promise<{ text: string }> {
  // 先上传图片到云存储
  const uploadRes = await wx.cloud.uploadFile({
    cloudPath: `ocr/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
    filePath,
  })

  // 调用 OCR 云函数
  const result = await callCloud<{ text: string }>('ocrResume', {
    fileId: uploadRes.fileID,
  })

  return result
}

// 保存简历到云端
export async function saveResume(content: string, source: 'paste' | 'ocr'): Promise<{ resumeId: string }> {
  return callCloud('saveResume', { content, source })
}

// 获取已保存的简历
export async function getSavedResume(): Promise<{ resumeId: string; content: string } | null> {
  return callCloud('getSavedResume', {})
}

// 获取历史记录
export async function getHistory(page: number = 1, pageSize: number = 20): Promise<{
  list: Analysis[]
  total: number
}> {
  return callCloud('getHistory', { page, pageSize })
}
