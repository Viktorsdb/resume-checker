import { View, Text, Canvas } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getAnalysisResult, createPayment } from '../../services/analysis'
import { useAnalysisStore } from '../../store/analysis'
import { DIMENSIONS, PRICING, getScoreLevel } from '../../lib/constants'
import type { Analysis, ProductType } from '../../types/analysis'
import './index.scss'

// 免费结果页 — 转化的关键页面
export default function ResultPage() {
  const router = useRouter()
  const analysisId = router.params.id || ''
  const { currentAnalysis, setCurrentAnalysis } = useAnalysisStore()
  const [analysis, setAnalysis] = useState<Analysis | null>(currentAnalysis)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [payLoading, setPayLoading] = useState<ProductType | null>(null)

  // 加载分析结果
  useEffect(() => {
    if (analysis) {
      animateScore(analysis.score)
      return
    }

    if (analysisId) {
      getAnalysisResult(analysisId).then((result) => {
        setAnalysis(result)
        setCurrentAnalysis(result)
        animateScore(result.score)
      })
    }
  }, [analysisId])

  // 分数动画
  function animateScore(target: number) {
    let current = 0
    const step = Math.ceil(target / 30)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setAnimatedScore(current)
      if (current >= target) clearInterval(timer)
    }, 30)
  }

  // 发起支付
  async function handlePay(productType: ProductType) {
    if (!analysisId || payLoading) return

    setPayLoading(productType)
    try {
      const payment = await createPayment(analysisId, productType)

      // 调起微信支付
      await Taro.requestPayment({
        timeStamp: payment.timeStamp,
        nonceStr: payment.nonceStr,
        package: payment.package,
        signType: payment.signType || 'MD5',
        paySign: payment.paySign,
      })

      // 支付成功，跳转到对应页面
      if (productType === 'report') {
        Taro.navigateTo({ url: `/pages/report/index?id=${analysisId}` })
      } else if (productType === 'rewrite') {
        Taro.navigateTo({ url: `/pages/rewrite/index?id=${analysisId}` })
      } else {
        Taro.navigateTo({ url: `/pages/rewrite/index?id=${analysisId}&withInterview=1` })
      }
    } catch (err: any) {
      if (err.errMsg?.includes('cancel')) {
        // 用户取消支付
        return
      }
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPayLoading(null)
    }
  }

  if (!analysis) {
    return (
      <View className='result-page'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  const scoreLevel = getScoreLevel(analysis.score)

  return (
    <View className='result-page'>
      {/* 分数展示 */}
      <View className='score-section'>
        <View className='score-ring' style={{ borderColor: scoreLevel.color }}>
          <Text className='score-number' style={{ color: scoreLevel.color }}>
            {animatedScore}
          </Text>
          <Text className='score-total'>/100</Text>
        </View>
        <Text className='score-label'>
          {scoreLevel.emoji} 匹配度：{scoreLevel.label}
        </Text>
        <Text className='score-job'>
          目标岗位：{analysis.jobTitle || '未识别'}
        </Text>
      </View>

      {/* 6 维度评分 */}
      <View className='dimensions-section card'>
        <Text className='card-title'>6 维度评估</Text>
        <View className='dim-list'>
          {Object.entries(analysis.dimensions).map(([key, value]) => (
            <View className='dim-item' key={key}>
              <Text className='dim-label'>
                {DIMENSIONS[key as keyof typeof DIMENSIONS]}
              </Text>
              <View className='dim-bar'>
                <View
                  className='dim-bar-fill'
                  style={{
                    width: `${value}%`,
                    backgroundColor: value >= 70 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </View>
              <Text className='dim-score'>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 免费建议（1 条） */}
      <View className='suggestion-section card'>
        <Text className='card-title'>🔍 核心发现</Text>
        <Text className='suggestion-text'>{analysis.freeSuggestion}</Text>
      </View>

      {/* 付费解锁区域（毛玻璃遮挡效果） */}
      <View className='paywall-section'>
        <View className='blurred-preview card'>
          <Text className='card-title'>📋 完整诊断报告</Text>
          <View className='blurred-content'>
            <Text className='blurred-line'>🔴 致命问题：你的简历缺少 4 个关键词...</Text>
            <Text className='blurred-line'>🟡 需注意：工作经历描述缺少量化数据...</Text>
            <Text className='blurred-line'>🟢 亮点：你的项目经历和岗位高度匹配...</Text>
          </View>
          <View className='blur-overlay'>
            <Text className='unlock-hint'>解锁查看完整报告</Text>
          </View>
        </View>

        {/* 付费选项 */}
        <View className='pricing-cards'>
          {/* ¥5.9 报告 */}
          <View className='price-card' onClick={() => handlePay('report')}>
            <View className='price-header'>
              <Text className='price-name'>{PRICING.report.label}</Text>
              <Text className='price-amount'>
                ¥{(PRICING.report.amount / 100).toFixed(1)}
              </Text>
            </View>
            <Text className='price-desc'>{PRICING.report.description}</Text>
            <View className={`price-btn ${payLoading === 'report' ? 'loading' : ''}`}>
              {payLoading === 'report' ? '处理中...' : '解锁报告'}
            </View>
          </View>

          {/* ¥19.9 重写 */}
          <View className='price-card popular' onClick={() => handlePay('rewrite')}>
            <View className='popular-tag'>热门</View>
            <View className='price-header'>
              <Text className='price-name'>{PRICING.rewrite.label}</Text>
              <Text className='price-amount'>
                ¥{(PRICING.rewrite.amount / 100).toFixed(1)}
              </Text>
            </View>
            <Text className='price-desc'>{PRICING.rewrite.description}</Text>
            <View className={`price-btn ${payLoading === 'rewrite' ? 'loading' : ''}`}>
              {payLoading === 'rewrite' ? '处理中...' : '立即优化'}
            </View>
          </View>

          {/* ¥39.9 全套 */}
          <View className='price-card' onClick={() => handlePay('full')}>
            <View className='price-header'>
              <Text className='price-name'>{PRICING.full.label}</Text>
              <Text className='price-amount'>
                ¥{(PRICING.full.amount / 100).toFixed(1)}
              </Text>
            </View>
            <Text className='price-desc'>{PRICING.full.description}</Text>
            <View className={`price-btn ${payLoading === 'full' ? 'loading' : ''}`}>
              {payLoading === 'full' ? '处理中...' : '全套优化'}
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作 */}
      <View className='bottom-actions'>
        <View className='action-btn' onClick={() => Taro.navigateTo({ url: '/pages/check/index' })}>
          再测一个岗位
        </View>
      </View>
    </View>
  )
}
