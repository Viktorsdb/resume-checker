const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  const skip = (page - 1) * pageSize

  // 获取总数
  const countRes = await db.collection('analyses').where({ _openid: OPENID }).count()

  // 获取列表（只返回摘要字段）
  const listRes = await db.collection('analyses')
    .where({ _openid: OPENID })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .field({
      jobTitle: true,
      score: true,
      status: true,
      createdAt: true,
    })
    .get()

  return {
    list: listRes.data,
    total: countRes.total,
  }
}
