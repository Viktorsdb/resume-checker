import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function IndexPage() {
  const handleStart = () => {
    Taro.navigateTo({ url: '/pages/check/index' })
  }

  return (
    <View className='index-page'>
      {/* Hero */}
      <View className='hero'>
        <View className='hero-badge'>AI 驱动</View>
        <Text className='hero-title'>简历改造</Text>
        <Text className='hero-subtitle'>
          对标岗位 JD 精准优化简历{'\n'}帮你拿到面试机会
        </Text>
      </View>

      {/* 核心流程 */}
      <View className='steps card'>
        <View className='step'>
          <View className='step-num'>1</View>
          <View className='step-content'>
            <Text className='step-title'>粘贴岗位 + 简历</Text>
            <Text className='step-desc'>支持 OCR 拍照识别</Text>
          </View>
        </View>
        <View className='step-line' />
        <View className='step'>
          <View className='step-num'>2</View>
          <View className='step-content'>
            <Text className='step-title'>AI 诊断评分</Text>
            <Text className='step-desc'>6 维度精准分析匹配度</Text>
          </View>
        </View>
        <View className='step-line' />
        <View className='step'>
          <View className='step-num'>3</View>
          <View className='step-content'>
            <Text className='step-title'>一键改造简历</Text>
            <Text className='step-desc'>智能改写，量化成果</Text>
          </View>
        </View>
      </View>

      {/* 数据 */}
      <View className='stats'>
        <View className='stat-item'>
          <Text className='stat-value'>30s</Text>
          <Text className='stat-label'>极速分析</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-value'>6维</Text>
          <Text className='stat-label'>全面评估</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-value'>免费</Text>
          <Text className='stat-label'>基础诊断</Text>
        </View>
      </View>

      {/* CTA */}
      <View className='cta'>
        <View className='btn-primary' onClick={handleStart}>
          开始改造简历
        </View>
        <Text className='cta-hint'>每日 3 次免费诊断</Text>
      </View>
    </View>
  )
}
