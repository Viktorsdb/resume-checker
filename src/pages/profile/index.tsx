import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getSavedResume } from '../../services/analysis'
import './index.scss'

export default function ProfilePage() {
  const [hasSavedResume, setHasSavedResume] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    getSavedResume()
      .then((res: any) => {
        if (res && res.text) {
          setHasSavedResume(true)
        }
      })
      .catch(() => {})
  }, [])

  const menuItems = [
    {
      icon: '📋',
      label: '我的简历',
      desc: hasSavedResume ? '已保存' : '未保存',
      onClick: () => {
        if (hasSavedResume) {
          Taro.showModal({
            title: '我的简历',
            content: '已保存的简历会在下次体检时自动填充',
            showCancel: false,
          })
        } else {
          Taro.showToast({ title: '去体检时会自动保存', icon: 'none' })
        }
      },
    },
    {
      icon: '📊',
      label: '分析记录',
      desc: '',
      onClick: () => Taro.switchTab({ url: '/pages/history/index' }),
    },
    {
      icon: '💬',
      label: '意见反馈',
      desc: '',
      onClick: () => {
        Taro.showModal({
          title: '意见反馈',
          content: '请发送反馈至微信客服',
          showCancel: false,
        })
      },
    },
    {
      icon: 'ℹ️',
      label: '关于我们',
      desc: 'v1.0.0',
      onClick: () => {
        Taro.showModal({
          title: '简历体检',
          content: 'AI 驱动的简历优化工具\n让每份简历都能通过筛选',
          showCancel: false,
        })
      },
    },
  ]

  return (
    <View className='profile-page'>
      {/* 用户头部 */}
      <View className='profile-header card'>
        <View className='avatar-placeholder'>
          <Text className='avatar-text'>👤</Text>
        </View>
        <View className='user-info'>
          <Text className='user-name'>微信用户</Text>
          <Text className='user-desc'>AI 简历体检 · 让求职更顺利</Text>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='stats-row'>
        <View className='stat-item card'>
          <Text className='stat-num'>-</Text>
          <Text className='stat-label'>体检次数</Text>
        </View>
        <View className='stat-item card'>
          <Text className='stat-num'>-</Text>
          <Text className='stat-label'>平均分数</Text>
        </View>
        <View className='stat-item card'>
          <Text className='stat-num'>-</Text>
          <Text className='stat-label'>最高分数</Text>
        </View>
      </View>

      {/* 菜单列表 */}
      <View className='menu-list card'>
        {menuItems.map((item, idx) => (
          <View className='menu-item' key={idx} onClick={item.onClick}>
            <Text className='menu-icon'>{item.icon}</Text>
            <Text className='menu-label'>{item.label}</Text>
            <View className='menu-right'>
              {item.desc && <Text className='menu-desc'>{item.desc}</Text>}
              <Text className='menu-arrow'>›</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
