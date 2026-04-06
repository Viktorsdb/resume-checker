import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { getAnalysisResult } from '../../services/analysis'
import { useAnalysisStore } from '../../store/analysis'
import './index.scss'

// 分析步骤文案
const STEPS = [
  { text: '正在解析简历内容...', duration: 3000 },
  { text: '正在提取岗位关键词...', duration: 4000 },
  { text: '正在匹配技能与经验...', duration: 5000 },
  { text: '正在评估匹配度...', duration: 4000 },
  { text: '正在生成优化建议...', duration: 4000 },
  { text: '即将完成...', duration: 3000 },
]

// 分析中等待页
export default function AnalyzingPage() {
  const router = useRouter()
  const analysisId = router.params.id || ''
  const { setCurrentAnalysis } = useAnalysisStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const pollingRef = useRef<any>(null)

  // 步骤动画
  useEffect(() => {
    let stepTimer: any
    let progressTimer: any

    // 进度条动画
    progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95)) // 最多到 95%，等真正完成再到 100%
    }, 300)

    // 步骤文案切换
    let step = 0
    const advanceStep = () => {
      step++
      if (step < STEPS.length) {
        setCurrentStep(step)
        stepTimer = setTimeout(advanceStep, STEPS[step].duration)
      }
    }
    stepTimer = setTimeout(advanceStep, STEPS[0].duration)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
    }
  }, [])

  // 轮询分析结果
  useEffect(() => {
    if (!analysisId) return

    const poll = async () => {
      try {
        const result = await getAnalysisResult(analysisId)

        if (result.status === 'done') {
          // 分析完成
          setProgress(100)
          setCurrentAnalysis(result)

          // 短暂延迟后跳转结果页
          setTimeout(() => {
            Taro.redirectTo({
              url: `/pages/result/index?id=${analysisId}`,
            })
          }, 500)
          return
        }

        if (result.status === 'failed') {
          Taro.showToast({ title: '分析失败，请重试', icon: 'none' })
          setTimeout(() => Taro.navigateBack(), 1500)
          return
        }

        // 继续轮询
        pollingRef.current = setTimeout(poll, 2000)
      } catch (err) {
        // 网络错误，继续重试
        pollingRef.current = setTimeout(poll, 3000)
      }
    }

    // 首次延迟 3 秒再开始轮询（给 AI 处理时间）
    pollingRef.current = setTimeout(poll, 3000)

    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current)
    }
  }, [analysisId])

  return (
    <View className='analyzing-page'>
      {/* 动画区域 */}
      <View className='animation-area'>
        <View className='pulse-ring'>
          <View className='pulse-ring-inner' />
          <Text className='pulse-icon'>🔍</Text>
        </View>
      </View>

      {/* 进度条 */}
      <View className='progress-bar'>
        <View className='progress-fill' style={{ width: `${progress}%` }} />
      </View>
      <Text className='progress-text'>{progress}%</Text>

      {/* 当前步骤文案 */}
      <Text className='step-text'>{STEPS[currentStep]?.text}</Text>

      {/* 提示 */}
      <Text className='hint'>AI 正在全面分析你的简历，请稍候...</Text>
    </View>
  )
}
