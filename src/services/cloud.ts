import Taro from '@tarojs/taro'

// 初始化云开发（在 app.ts 中调用一次）
export function initCloud() {
  if (process.env.TARO_ENV === 'weapp') {
    Taro.cloud.init({
      // 上线前替换为真实云开发环境 ID
      env: 'cloud1-8g9hxzdd7226305f',
    })
  }
}

// 调用云函数的统一封装
export async function callCloud<T = any>(
  name: string,
  data: Record<string, any> = {}
): Promise<T> {
  try {
    const res = await Taro.cloud.callFunction({
      name,
      data,
    })
    const result = res.result as any

    // 云函数返回错误
    if (result?.error) {
      throw new Error(result.error)
    }

    return result as T
  } catch (err: any) {
    console.error(`云函数 ${name} 调用失败:`, err)

    // 网络错误友好提示
    if (err.errMsg?.includes('request:fail')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }

    throw err
  }
}
