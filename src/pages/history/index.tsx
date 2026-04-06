import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { getHistory } from '../../services/analysis'
import { getScoreLevel } from '../../lib/constants'
import './index.scss'

interface HistoryItem {
  _id: string
  jobTitle: string
  score: number
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const [list, setList] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    setLoading(true)
    getHistory()
      .then((res: any) => {
        setList(res.list || res || [])
      })
      .catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  })

  const goToResult = (id: string) => {
    Taro.navigateTo({ url: `/pages/result/index?id=${id}` })
  }

  if (loading) {
    return (
      <View className='history-page'>
        <Text className='empty-text'>加载中...</Text>
      </View>
    )
  }

  if (list.length === 0) {
    return (
      <View className='history-page'>
        <View className='empty-state'>
          <Text className='empty-icon'>📋</Text>
          <Text className='empty-text'>还没有分析记录</Text>
          <View
            className='empty-btn'
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text>去体检简历</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='history-page'>
      <View className='page-header'>
        <Text className='page-title'>分析记录</Text>
        <Text className='page-sub'>共 {list.length} 条</Text>
      </View>

      {list.map((item) => {
        const level = getScoreLevel(item.score)
        return (
          <View
            className='history-card card'
            key={item._id}
            onClick={() => goToResult(item._id)}
          >
            <View className='card-left'>
              <Text className='card-title'>{item.jobTitle || '未知岗位'}</Text>
              <Text className='card-time'>
                {new Date(item.createdAt).toLocaleDateString('zh-CN')}
              </Text>
            </View>
            <View className='card-right'>
              <Text className='card-score' style={{ color: level.color }}>{item.score}分</Text>
              <Text className='card-arrow'>›</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
