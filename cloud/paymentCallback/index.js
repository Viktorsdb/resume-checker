// 微信支付回调
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { outTradeNo, resultCode, returnCode } = event

  if (returnCode !== 'SUCCESS' || resultCode !== 'SUCCESS') {
    // 支付失败
    if (outTradeNo) {
      await db.collection('orders').doc(outTradeNo).update({
        data: {
          status: 'failed',
          updatedAt: db.serverDate(),
        }
      })
    }
    return { errcode: 0, errmsg: 'OK' }
  }

  // 支付成功，更新订单状态
  try {
    await db.collection('orders').doc(outTradeNo).update({
      data: {
        status: 'paid',
        paidAt: db.serverDate(),
        updatedAt: db.serverDate(),
      }
    })

    // 获取订单详情，触发对应服务
    const orderRes = await db.collection('orders').doc(outTradeNo).get()
    const order = orderRes.data

    if (order.productType === 'report' || order.productType === 'rewrite' || order.productType === 'full') {
      // 获取分析结果，把 fullReport 写入（如果还没有的话）
      const analysisRes = await db.collection('analyses').doc(order.analysisId).get()
      const analysis = analysisRes.data

      if (!analysis.fullReport) {
        // 标记需要生成完整报告
        await db.collection('analyses').doc(order.analysisId).update({
          data: { reportUnlocked: true }
        })
      }
    }
  } catch (err) {
    console.error('支付回调处理失败:', err)
  }

  // 必须返回这个格式，微信才会认为回调处理成功
  return { errcode: 0, errmsg: 'OK' }
}
