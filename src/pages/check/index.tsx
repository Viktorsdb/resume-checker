import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useAnalysisStore } from '../../store/analysis'
import { submitAnalysis, getSavedResume, ocrImage, saveResume } from '../../services/analysis'
import { MAX_JD_LENGTH, MAX_RESUME_LENGTH } from '../../lib/constants'
import './index.scss'

// 输入页 - 粘贴 JD + 简历
export default function CheckPage() {
  const {
    jobDescription, setJobDescription,
    resumeText, setResumeText,
    savedResumeId, savedResumeContent,
    setSavedResume,
    useSavedResume, setUseSavedResume,
  } = useAnalysisStore()

  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  // 页面加载时检查是否有已保存的简历
  useEffect(() => {
    loadSavedResume()
  }, [])

  // 加载已保存简历
  async function loadSavedResume() {
    try {
      const saved = await getSavedResume()
      if (saved) {
        setSavedResume(saved.resumeId, saved.content)
        setUseSavedResume(true)
      }
    } catch (err) {
      // 没有保存的简历，忽略
    }
  }

  // JD 截图 OCR 识别
  async function handleOcrJD() {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
      })

      setOcrLoading(true)
      const result = await ocrImage(res.tempFilePaths[0])

      if (!result.text || result.text.trim().length < 20) {
        Taro.showToast({ title: '未识别到岗位信息，请重新截图', icon: 'none' })
        return
      }

      // 截断到最大长度
      const text = result.text.slice(0, MAX_JD_LENGTH)
      setJobDescription(text)

      if (text.length < result.text.length) {
        Taro.showToast({ title: 'JD 内容过长，已截取前 3000 字', icon: 'none' })
      }
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) return // 用户取消
      Taro.showToast({ title: '识别失败，请手动粘贴', icon: 'none' })
    } finally {
      setOcrLoading(false)
    }
  }

  // 提交分析
  async function handleSubmit() {
    const jd = jobDescription.trim()
    const resume = useSavedResume ? savedResumeContent : resumeText.trim()

    if (!jd) {
      Taro.showToast({ title: '请输入岗位描述', icon: 'none' })
      return
    }
    if (!resume) {
      Taro.showToast({ title: '请输入简历内容', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 如果是新简历，先保存
      if (!useSavedResume && resumeText.trim()) {
        const saveResult = await saveResume(resumeText.trim(), 'paste')
        setSavedResume(saveResult.resumeId, resumeText.trim())
      }

      // 提交分析
      const { analysisId } = await submitAnalysis({
        jobDescription: jd,
        resumeText: resume!,
        jdSource: 'paste',
        resumeId: savedResumeId || undefined,
      })

      // 跳转到分析中页面
      Taro.redirectTo({
        url: `/pages/analyzing/index?id=${analysisId}`,
      })
    } catch (err: any) {
      Taro.showToast({
        title: err.message || '提交失败，请重试',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='check-page'>
      {/* JD 输入区 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>岗位描述 (JD)</Text>
          <View className='ocr-btn' onClick={handleOcrJD}>
            {ocrLoading ? '识别中...' : '📷 截图识别'}
          </View>
        </View>
        <Textarea
          className='input-area'
          placeholder='粘贴目标岗位的职位描述，或点击右上角截图识别...'
          value={jobDescription}
          onInput={(e) => setJobDescription(e.detail.value)}
          maxlength={MAX_JD_LENGTH}
          autoHeight
        />
        <Text className='char-count'>
          {jobDescription.length}/{MAX_JD_LENGTH}
        </Text>
      </View>

      {/* 简历输入区 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>你的简历</Text>
        </View>

        {/* 已保存简历提示 */}
        {savedResumeContent && (
          <View className='saved-resume-bar'>
            <View className='saved-info'>
              <Text className='saved-label'>
                {useSavedResume ? '✅ 使用已保存的简历' : '📄 有已保存的简历'}
              </Text>
              <Text className='saved-preview'>
                {savedResumeContent.slice(0, 50)}...
              </Text>
            </View>
            <View
              className='toggle-btn'
              onClick={() => setUseSavedResume(!useSavedResume)}
            >
              {useSavedResume ? '重新输入' : '使用它'}
            </View>
          </View>
        )}

        {/* 简历文本输入（非使用已保存时显示） */}
        {!useSavedResume && (
          <>
            <Textarea
              className='input-area'
              placeholder='粘贴你的简历内容...'
              value={resumeText}
              onInput={(e) => setResumeText(e.detail.value)}
              maxlength={MAX_RESUME_LENGTH}
              autoHeight
            />
            <Text className='char-count'>
              {resumeText.length}/{MAX_RESUME_LENGTH}
            </Text>
          </>
        )}
      </View>

      {/* 提交按钮 */}
      <View className='submit-area'>
        <Button
          className={`btn-primary ${loading ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '提交中...' : '开始体检'}
        </Button>
      </View>
    </View>
  )
}
