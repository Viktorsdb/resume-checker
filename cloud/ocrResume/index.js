// OCR 识别简历图片
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { fileID } = event

  if (!fileID) {
    return { error: '缺少文件 ID' }
  }

  try {
    // 下载图片
    const fileRes = await cloud.downloadFile({ fileID })
    const buffer = fileRes.fileContent

    // 调用微信 OCR 接口
    const ocrResult = await cloud.openapi.ocr.printedText({
      imgBuffer: buffer,
    })

    if (!ocrResult.items || ocrResult.items.length === 0) {
      return { error: '未识别到文字，请确保图片清晰' }
    }

    // 拼接识别文字
    const text = ocrResult.items.map(item => item.text).join('\n')

    return { text }
  } catch (err) {
    console.error('OCR 失败:', err)

    // 尝试通用文字识别
    if (err.errCode === -1) {
      return { error: '图片格式不支持，请使用 JPG 或 PNG' }
    }

    return { error: 'OCR 识别失败，请重试或手动输入' }
  }
}
