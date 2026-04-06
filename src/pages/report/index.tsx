import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getFullReport } from '../../services/analysis'
import { DIMENSIONS } from '../../lib/constants'
import type { FullReport } from '../../types/analysis'
import './index.scss'

export default function ReportPage() {
  const router = useRouter()
  const analysisId = router.params.id || ''
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!analysisId) return

    getFullReport(analysisId)
      .then((res) => {
        setReport(res)
      })
      .catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [analysisId])

  if (loading) {
    return (
      <View className='report-page'>
        <Text className='loading-text'>加载报告中...</Text>
      </View>
    )
  }

  if (!report) {
    return (
      <View className='report-page'>
        <Text className='loading-text'>未找到报告</Text>
      </View>
    )
  }

  const fullReport = report.fullReport as FullReport | null

  return (
    <View className='report-page'>
      {/* 分数概览 */}
      <View className='report-header card'>
        <Text className='report-title'>
          {report.jobTitle || '未识别岗位'} - 诊断报告
        </Text>
        <View className='score-badge' style={{ backgroundColor: report.score >= 70 ? '#22c55e' : report.score >= 50 ? '#f59e0b' : '#ef4444' }}>
          <Text className='score-text'>{report.score}分</Text>
        </View>
      </View>

      {/* 维度详情 */}
      <View className='section card'>
        <Text className='section-title'>维度评分</Text>
        {Object.entries(report.dimensions || {}).map(([key, value]) => (
          <View className='dim-row' key={key}>
            <Text className='dim-name'>{DIMENSIONS[key as keyof typeof DIMENSIONS]}</Text>
            <View className='dim-bar-bg'>
              <View
                className='dim-bar-fill'
                style={{
                  width: `${value}%`,
                  backgroundColor: (value as number) >= 70 ? '#22c55e' : (value as number) >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </View>
            <Text className='dim-val'>{value as number}</Text>
          </View>
        ))}
      </View>

      {/* 问题列表 */}
      {fullReport?.problems && fullReport.problems.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>问题诊断</Text>
          {fullReport.problems.map((problem, idx) => (
            <View className={`problem-item severity-${problem.severity}`} key={idx}>
              <View className='problem-header'>
                <Text className='severity-badge'>
                  {problem.severity === 'critical' ? '🔴' : problem.severity === 'warning' ? '🟡' : '🟢'}
                </Text>
                <Text className='problem-title'>{problem.title}</Text>
              </View>
              <Text className='problem-desc'>{problem.description}</Text>
              <Text className='problem-suggestion'>💡 {problem.suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 关键词分析 */}
      {fullReport?.keywords && (
        <View className='section card'>
          <Text className='section-title'>关键词分析</Text>

          {fullReport.keywords.missing?.length > 0 && (
            <View className='keyword-group'>
              <Text className='keyword-label'>❌ 缺失关键词</Text>
              <View className='keyword-tags'>
                {fullReport.keywords.missing.map((kw, i) => (
                  <Text className='keyword-tag missing' key={i}>{kw}</Text>
                ))}
              </View>
            </View>
          )}

          {fullReport.keywords.matched?.length > 0 && (
            <View className='keyword-group'>
              <Text className='keyword-label'>✅ 已匹配</Text>
              <View className='keyword-tags'>
                {fullReport.keywords.matched.map((kw, i) => (
                  <Text className='keyword-tag matched' key={i}>{kw}</Text>
                ))}
              </View>
            </View>
          )}

          {fullReport.keywords.suggested?.length > 0 && (
            <View className='keyword-group'>
              <Text className='keyword-label'>💡 建议添加</Text>
              <View className='keyword-tags'>
                {fullReport.keywords.suggested.map((kw, i) => (
                  <Text className='keyword-tag suggested' key={i}>{kw}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* 总结 */}
      {fullReport?.summary && (
        <View className='section card'>
          <Text className='section-title'>分析总结</Text>
          <Text className='summary-text'>{fullReport.summary}</Text>
        </View>
      )}

      {/* 底部操作 */}
      <View className='report-actions'>
        <View
          className='action-btn primary'
          onClick={() => Taro.navigateTo({ url: `/pages/rewrite/index?id=${analysisId}` })}
        >
          <Text>AI 优化简历</Text>
        </View>
        <View
          className='action-btn secondary'
          onClick={() => Taro.navigateBack()}
        >
          <Text>返回</Text>
        </View>
      </View>
    </View>
  )
}
