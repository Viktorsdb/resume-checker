// 创建微信支付订单
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const PRICING = {
  report: { amount: 590, label: '诊断报告' },
  rewrite: { amount: 1990, label: '简历优化' },
  full: { amount: 3990, label: '全套服务' },
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { analysisId, productType } = event

  if (!analysisId || !productType) {
    return { error: '参数缺失' }
  }

  const pricing = PRICING[productType]
  if (!pricing) {
    return { error: '无效的产品类型' }
  }

  // 检查是否已经购买过
  const existingOrder = await db.collection('orders').where({
    _openid: OPENID,
    analysisId,
    productType,
    status: 'paid',
  }).get()

  if (existingOrder.data.length > 0) {
    return { error: '您已购买过该服务', alreadyPaid: true }
  }

  // 创建订单记录
  const orderRes = await db.collection('orders').add({
    data: {
      _openid: OPENID,
      analysisId,
      productType,
      amount: pricing.amount,
      status: 'pending',
      createdAt: db.serverDate(),
    }
  })

  // 调用微信支付统一下单
  try {
    const payResult = await cloud.cloudPay.unifiedOrder({
      body: `简历体检 - ${pricing.label}`,
      outTradeNo: orderRes._id,
      spbillCreateIp: '127.0.0.1',
      subMchId: process.env.MCH_ID || '',
      totalFee: pricing.amount,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'paymentCallback',
    })

    return {
      ...payResult.payment,
      orderId: orderRes._id,
    }
  } catch (err) {
    console.error('创建支付订单失败:', err)
    // 标记订单失败
    await db.collection('orders').doc(orderRes._id).update({
      data: { status: 'failed' }
    })
    return { error: '创建支付失败，请重试' }
  }
}
