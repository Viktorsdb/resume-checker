import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { generateRewrite } from '../../services/analysis'
import './index.scss'

interface RewriteChange {
  section: string
  before: string
  after: string
  reason: string
}

interface RewriteResult {
  rewrittenResume: string
  changes: RewriteChange[]
  improvementScore: number
  tips: string[]
}

export default function RewritePage() {
  const router = useRouter()
  const analysisId = router.params.id || ''
  const [result, setResult] = useState<RewriteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!analysisId) return

    generateRewrite(analysisId)
      .then((res: any) => {
        setResult(res.rewrittenResume || res)
      })
      .catch(() => {
        Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [analysisId])

  const handleCopy = () => {
    if (!result?.rewrittenResume) return
    Taro.setClipboardData({
      data: result.rewrittenResume,
      success: () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
    })
  }

  if (loading) {
    return (
      <View className='rewrite-page'>
        <View className='loading-section'>
          <View className='loading-spinner' />
          <Text className='loading-text'>AI 正在优化你的简历...</Text>
          <Text className='loading-sub'>这可能需要 15-30 秒</Text>
        </View>
      </View>
    )
  }

  if (!result) {
    return (
      <View className='rewrite-page'>
        <Text className='loading-text'>生成失败，请返回重试</Text>
      </View>
    )
  }

  return (
    <View className='rewrite-page'>
      {/* 提升分数 */}
      {result.improvementScore > 0 && (
        <View className='improvement card'>
          <Text className='improvement-label'>预估分数提升</Text>
          <Text className='improvement-score'>+{result.improvementScore}分</Text>
        </View>
      )}

      {/* 优化后的简历 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>优化后的简历</Text>
          <View className='copy-btn' onClick={handleCopy}>
            <Text>{copied ? '已复制 ✓' : '复制全文'}</Text>
          </View>
        </View>
        <Text className='resume-text'>{result.rewrittenResume}</Text>
      </View>

      {/* 修改对比 */}
      {result.changes && result.changes.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>修改说明</Text>
          {result.changes.map((change, idx) => (
            <View className='change-item' key={idx}>
              <Text className='change-section'>{change.section}</Text>
              <View className='change-diff'>
                <View className='diff-before'>
                  <Text className='diff-label'>修改前</Text>
                  <Text className='diff-text'>{change.before}</Text>
                </View>
                <View className='diff-after'>
                  <Text className='diff-label'>修改后</Text>
                  <Text className='diff-text'>{change.after}</Text>
                </View>
              </View>
              <Text className='change-reason'>💡 {change.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 额外建议 */}
      {result.tips && result.tips.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>额外建议</Text>
          {result.tips.map((tip, idx) => (
            <Text className='tip-item' key={idx}>• {tip}</Text>
          ))}
        </View>
      )}

      {/* 底部操作 */}
      <View className='bottom-actions'>
        <View className='action-btn' onClick={handleCopy}>
          <Text>{copied ? '已复制 ✓' : '复制优化简历'}</Text>
        </View>
      </View>
    </View>
  )
}
