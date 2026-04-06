const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const res = await db.collection('resumes').where({ _openid: OPENID }).orderBy('updatedAt', 'desc').limit(1).get()

  if (res.data.length === 0) {
    return null
  }

  const resume = res.data[0]
  return {
    resumeId: resume._id,
    content: resume.content,
    text: resume.content,
  }
}
