const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { content, source = 'paste' } = event

  if (!content || content.trim().length < 20) {
    return { error: '简历内容太短' }
  }

  // 查找是否已有保存的简历
  const existing = await db.collection('resumes').where({ _openid: OPENID }).get()

  if (existing.data.length > 0) {
    // 更新
    await db.collection('resumes').doc(existing.data[0]._id).update({
      data: {
        content: content.trim(),
        source,
        updatedAt: db.serverDate(),
      }
    })
    return { resumeId: existing.data[0]._id }
  }

  // 新建
  const res = await db.collection('resumes').add({
    data: {
      _openid: OPENID,
      content: content.trim(),
      source,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    }
  })

  return { resumeId: res._id }
}
