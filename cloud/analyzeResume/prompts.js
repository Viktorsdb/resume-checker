// 简历分析 Prompt 模板
// 这是产品质量的核心，决定分析结果的好坏

function buildAnalysisPrompt(jobDescription, resumeText) {
  return `你是一位拥有 10 年经验的资深 HR 和简历优化专家。

请分析以下简历与目标岗位的匹配度，给出专业评估。

## 目标岗位 JD：
${jobDescription}

## 候选人简历：
${resumeText}

## 要求
请从以下 6 个维度评分（每个维度 0-100 分），并给出整体匹配分数和改进建议。

### 评分维度：
1. **relevance（岗位相关性）**：简历内容与 JD 要求的匹配程度
2. **experience（工作经验）**：工作年限、行业经验、项目经历是否符合
3. **skills（技能匹配）**：硬技能和软技能是否覆盖 JD 中的要求
4. **education（教育背景）**：学历、专业是否符合岗位要求
5. **expression（表达质量）**：简历的语言表达、用词是否专业到位
6. **structure（结构规范）**：简历排版、结构是否规范易读

### 评分标准：
- 90-100：优秀，完全匹配
- 70-89：良好，大部分匹配
- 50-69：一般，有明显差距
- 30-49：较差，需要大幅修改
- 0-29：不匹配

请严格按照以下 JSON 格式返回，不要添加任何其他文字：

\`\`\`json
{
  "jobTitle": "从 JD 中提取的岗位名称",
  "score": 75,
  "dimensions": {
    "relevance": 80,
    "experience": 70,
    "skills": 75,
    "education": 85,
    "expression": 60,
    "structure": 70
  },
  "freeSuggestion": "一段 200 字以内的核心发现和最重要的改进建议，这是免费用户能看到的唯一建议",
  "problems": [
    {
      "severity": "critical",
      "category": "skills",
      "title": "缺少关键技术词",
      "description": "JD 要求的 XX 技能在简历中完全没有提及",
      "suggestion": "在技能清单和项目经历中补充 XX 相关经验"
    },
    {
      "severity": "warning",
      "category": "experience",
      "title": "工作经历缺少量化数据",
      "description": "...",
      "suggestion": "..."
    },
    {
      "severity": "good",
      "category": "relevance",
      "title": "项目经历高度匹配",
      "description": "...",
      "suggestion": "继续保持，可以进一步突出..."
    }
  ],
  "keywords": {
    "missing": ["JD 中要求但简历中缺少的关键词"],
    "matched": ["简历中已匹配的关键词"],
    "suggested": ["建议添加的关键词"]
  },
  "summary": "一段 300 字以内的完整分析总结，包含主要发现和改进方向"
}
\`\`\`

注意：
- score 是综合加权分数，不是各维度的简单平均
- problems 至少包含 3 条，按 severity 排序（critical > warning > good）
- freeSuggestion 要有具体的建议，不能是空话
- 所有文字使用中文`
}

function buildRewritePrompt(jobDescription, resumeText, problems) {
  const problemsSummary = problems
    ? problems.map(p => `- [${p.severity}] ${p.title}: ${p.description}`).join('\n')
    : '无具体问题列表'

  return `你是一位资深简历优化专家，请根据以下信息重写优化简历。

## 目标岗位 JD：
${jobDescription}

## 原始简历：
${resumeText}

## 已发现的问题：
${problemsSummary}

## 优化要求：
1. 保持原始简历的真实信息，不编造经历
2. 优化语言表达，使用更专业的措辞
3. 补充 JD 中要求的关键词（前提是候选人确实有相关经验）
4. 量化工作成果（如果原文有模糊描述）
5. 调整结构使其更规范
6. 突出与目标岗位最相关的经验

请严格按照以下 JSON 格式返回：

\`\`\`json
{
  "rewrittenResume": "优化后的完整简历文本",
  "changes": [
    {
      "section": "修改的部分",
      "before": "修改前",
      "after": "修改后",
      "reason": "修改原因"
    }
  ],
  "improvementScore": 15,
  "tips": ["额外建议1", "额外建议2"]
}
\`\`\`

注意：
- rewrittenResume 是完整的简历文本，可以直接使用
- changes 列出主要修改点（至少 3 个）
- improvementScore 是预估的分数提升（0-30）`
}

function buildInterviewPrompt(jobDescription, resumeText) {
  return `你是一位资深面试官，请根据以下岗位和简历，生成可能的面试问题。

## 目标岗位 JD：
${jobDescription}

## 候选人简历：
${resumeText}

## 要求：
生成 10 个面试问题，包含以下类型：
1. 3 个技术/专业问题（基于 JD 要求的技能）
2. 3 个行为面试问题（STAR 法则）
3. 2 个项目深挖问题（基于简历中的项目经历）
4. 2 个综合/压力问题

请严格按照以下 JSON 格式返回：

\`\`\`json
{
  "questions": [
    {
      "type": "technical",
      "question": "面试问题",
      "intent": "考察意图",
      "tips": "回答建议（100字以内）",
      "sampleAnswer": "参考答案（200字以内）"
    }
  ]
}
\`\`\`

注意：
- 问题要具体，结合 JD 和简历内容
- tips 给出回答方向和要点
- sampleAnswer 提供一个参考，但要提醒候选人结合自身经历调整`
}

module.exports = { buildAnalysisPrompt, buildRewritePrompt, buildInterviewPrompt }
