import { create } from 'zustand'
import type { Analysis } from '../types/analysis'

// 分析状态管理
interface AnalysisState {
  // 当前分析
  currentAnalysis: Analysis | null
  setCurrentAnalysis: (analysis: Analysis | null) => void

  // JD 输入
  jobDescription: string
  setJobDescription: (jd: string) => void

  // 简历输入
  resumeText: string
  setResumeText: (text: string) => void

  // 已保存简历
  savedResumeId: string | null
  savedResumeContent: string | null
  setSavedResume: (id: string | null, content: string | null) => void

  // 使用已保存简历
  useSavedResume: boolean
  setUseSavedResume: (use: boolean) => void

  // 重置输入
  resetInput: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  jobDescription: '',
  setJobDescription: (jd) => set({ jobDescription: jd }),

  resumeText: '',
  setResumeText: (text) => set({ resumeText: text }),

  savedResumeId: null,
  savedResumeContent: null,
  setSavedResume: (id, content) => set({ savedResumeId: id, savedResumeContent: content }),

  useSavedResume: false,
  setUseSavedResume: (use) => set({ useSavedResume: use }),

  resetInput: () => set({
    jobDescription: '',
    resumeText: '',
    useSavedResume: false,
  }),
}))
