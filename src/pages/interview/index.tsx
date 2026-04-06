import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { generateInterview } from '../../services/analysis'
import './index.scss'

interface Question {
  type: string
  question: string
  intent: string
  tips: string
  sampleAnswer: string
}

const TYPE_LABELS: Record<string, string> = {
  technical: '技术/专业',
  behavioral: '行为面试',
  project: '项目深挖',
  general: '综合/压力',
}

export default function InterviewPage() {
  const router = useRouter()
  const analysisId = router.params.id || ''
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!analysisId) return

    generateInterview(analysisId)
      .then((res: any) => {
        setQuestions(res.questions || [])
      })
      .catch(() => {
        Taro.showToast({ title: '生成失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [analysisId])

  const toggleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx)
  }

  if (loading) {
    return (
      <View className='interview-page'>
        <View className='loading-section'>
          <View className='loading-spinner' />
          <Text className='loading-text'>正在生成面试题...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='interview-page'>
      <View className='page-header'>
        <Text className='page-title'>模拟面试题</Text>
        <Text className='page-sub'>共 {questions.length} 道题，点击展开查看建议</Text>
      </View>

      {questions.map((q, idx) => (
        <View
          className={`question-card card ${expandedIdx === idx ? 'expanded' : ''}`}
          key={idx}
          onClick={() => toggleExpand(idx)}
        >
          <View className='question-header'>
            <Text className='question-num'>Q{idx + 1}</Text>
            <Text className='question-type'>{TYPE_LABELS[q.type] || q.type}</Text>
          </View>
          <Text className='question-text'>{q.question}</Text>

          {expandedIdx === idx && (
            <View className='question-detail'>
              <View className='detail-block'>
                <Text className='detail-label'>🎯 考察意图</Text>
                <Text className='detail-text'>{q.intent}</Text>
              </View>
              <View className='detail-block'>
                <Text className='detail-label'>💡 回答建议</Text>
                <Text className='detail-text'>{q.tips}</Text>
              </View>
              <View className='detail-block'>
                <Text className='detail-label'>📝 参考答案</Text>
                <Text className='detail-text'>{q.sampleAnswer}</Text>
              </View>
            </View>
          )}

          <Text className='expand-hint'>
            {expandedIdx === idx ? '收起 ▲' : '展开查看 ▼'}
          </Text>
        </View>
      ))}
    </View>
  )
}
