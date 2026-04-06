import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

// 首页 - 产品介绍 + 开始体检入口
export default function IndexPage() {
  // 跳转到输入页
  const handleStart = () => {
    Taro.navigateTo({ url: '/pages/check/index' })
  }

  return (
    <View className='index-page'>
      {/* 主视觉区 */}
      <View className='hero'>
        <View className='hero-icon'>📋</View>
        <Text className='hero-title'>简历体检</Text>
        <Text className='hero-subtitle'>
          AI 帮你分析简历与岗位的匹配度{'\n'}
          精准优化，提升面试邀约率
        </Text>
      </View>

      {/* 功能亮点 */}
      <View className='features'>
        <View className='feature-item'>
          <Text className='feature-icon'>🎯</Text>
          <View className='feature-text'>
            <Text className='feature-title'>JD 精准匹配</Text>
            <Text className='feature-desc'>对比岗位要求，找出关键词差距</Text>
          </View>
        </View>

        <View className='feature-item'>
          <Text className='feature-icon'>📊</Text>
          <View className='feature-text'>
            <Text className='feature-title'>6 维度评分</Text>
            <Text className='feature-desc'>匹配度、经验、技能、学历、表达、结构</Text>
          </View>
        </View>

        <View className='feature-item'>
          <Text className='feature-icon'>✨</Text>
          <View className='feature-text'>
            <Text className='feature-title'>AI 一键优化</Text>
            <Text className='feature-desc'>智能重写简历，量化你的成果</Text>
          </View>
        </View>

        <View className='feature-item'>
          <Text className='feature-icon'>💬</Text>
          <View className='feature-text'>
            <Text className='feature-title'>模拟面试</Text>
            <Text className='feature-desc'>根据岗位生成针对性面试题</Text>
          </View>
        </View>
      </View>

      {/* 数据展示 */}
      <View className='stats'>
        <View className='stat-item'>
          <Text className='stat-number'>30秒</Text>
          <Text className='stat-label'>极速分析</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-number'>6维</Text>
          <Text className='stat-label'>全面评估</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-number'>免费</Text>
          <Text className='stat-label'>基础体检</Text>
        </View>
      </View>

      {/* 开始按钮 */}
      <View className='cta'>
        <View className='btn-primary' onClick={handleStart}>
          开始体检
        </View>
        <Text className='cta-hint'>每日 3 次免费体检机会</Text>
      </View>
    </View>
  )
}
