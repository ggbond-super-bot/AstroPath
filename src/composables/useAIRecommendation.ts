import { computed } from 'vue'
import { schoolsData, getAllSchoolsWithMatch } from '@/utils/recommendationEngine'
import { useGlobalRecommendationState } from './useGlobalRecommendationState'
import { useAIStream } from './useAIStream'
import type { UserPreference, AIRecommendation, SchoolAnalysis, AIRecommendationResponse, AIAnalysisResponse } from '@/types/recommendation'
import type { AssessmentForm, ResearchItem, InternshipItem, CompetitionItem } from '@/types/index'

type PriorityKey = 'ranking' | 'major' | 'career' | 'location' | 'cost'
type SchoolWithMatch = ReturnType<typeof getAllSchoolsWithMatch>[0]

export type RecommendationStep = 'idle' | 'analyzing' | 'matching' | 'generating' | 'completed' | 'error'

export const stepLabels: Record<RecommendationStep, string> = {
  idle: '准备开始',
  analyzing: '正在分析你的背景信息...',
  matching: '正在匹配适合你的院校...',
  generating: '正在生成推荐理由...',
  completed: '推荐完成！',
  error: '生成失败'
}

const REC_TASK_ID = 'school-rec-main'

export function useAIRecommendation() {
  const globalState = useGlobalRecommendationState()

  const recStream = useAIStream({
    taskId: REC_TASK_ID,
    enableThinking: true,
    autoRestore: false,
    autoRetry: false,
    onStream(_content, reasoning) {
      const displayContent = reasoning
        ? reasoning + (_content ? '\n\n---\n\n' + _content : '')
        : _content
      globalState.updateStreamingContent(displayContent || '', true)
    },
    onStateChange(state) {
      if (state === 'connecting' || state === 'thinking') {
        globalState.updateStep('analyzing', 25)
      } else if (state === 'streaming') {
        globalState.updateStep('generating', 75)
      }
    }
  })

  const analysisStreams = new Map<number, ReturnType<typeof useAIStream>>()

  const getAnalysisStream = (schoolId: number) => {
    if (!analysisStreams.has(schoolId)) {
      const stream = useAIStream({
        taskId: `analysis-${schoolId}`,
        enableThinking: true,
        autoRestore: false,
        autoRetry: false,
        onStream(_content, reasoning) {
          const displayContent = reasoning
            ? reasoning + (_content ? '\n\n---\n\n' + _content : '')
            : _content
          globalState.updateAnalysisStreamingContent(displayContent || '', true)
        }
      })
      analysisStreams.set(schoolId, stream)
    }
    return analysisStreams.get(schoolId)!
  }

  const buildUserProfile = (assessment: AssessmentForm) => {
    return {
      gpa: assessment.basic?.gpa || 3.0,
      university: assessment.basic?.university || 'regular',
      language: assessment.basic?.language || '未填写',
      averageScore: assessment.academic?.averageScore || 75,
      degree: assessment.academic?.degree || '本科',
      majors: assessment.academic?.majors?.join('、') || '未选择',
      researchCount: assessment.academic?.research?.length || 0,
      researchDetails: assessment.academic?.research || [],
      internshipCount: assessment.practice?.internships?.length || 0,
      internshipDetails: assessment.practice?.internships || [],
      competitionCount: assessment.practice?.competitions?.length || 0,
      competitionDetails: assessment.practice?.competitions || []
    }
  }

  const buildRecommendationPrompt = (assessment: AssessmentForm, preference: UserPreference): string => {
    const userProfile = buildUserProfile(assessment)

    const priorityMap: Record<PriorityKey, string> = {
      ranking: '学校排名',
      major: '专业实力',
      career: '就业前景',
      location: '地理位置',
      cost: '学费预算'
    }

    const prioritiesText = preference.priorities.map((p: PriorityKey) => priorityMap[p]).join('、')
    const excludedText = preference.excludedCountries.length > 0
      ? preference.excludedCountries.join('、')
      : '无'

    const schoolsList = schoolsData.map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country,
      ranking: s.ranking,
      major: s.major,
      tuition: s.tuition,
      acceptanceRate: s.acceptanceRate,
      admissionCriteria: {
        minGPA: s.admissionCriteria.minGPA,
        preferredGPA: s.admissionCriteria.preferredGPA,
        universityTier: s.admissionCriteria.universityTier,
        competitiveness: s.admissionCriteria.competitiveness,
        averageScoreMin: s.admissionCriteria.averageScoreMin,
        researchWeight: s.admissionCriteria.researchWeight
      }
    }))

    return `你是一位资深留学顾问，拥有15年申请指导经验。请基于用户真实背景，进行**客观、严谨**的学校推荐。

【核心原则】
1. 必须客观评估，宁可保守不可乐观
2. 录取概率预估要有依据，参考学校实际录取难度
3. 明确指出差距和风险，不要模糊处理
4. 如果背景较弱，要诚实告知并给出提升建议

【用户背景】
- GPA: ${userProfile.gpa}/4.0
- 院校背景: ${userProfile.university === '985' ? '985院校' : userProfile.university === '211' ? '211院校' : userProfile.university === 'overseas' ? '海外院校' : '普通本科'}
- 专业: ${userProfile.majors}
- 均分: ${userProfile.averageScore}/100
- 语言成绩: ${userProfile.language}
- 科研经历: ${userProfile.researchCount}项 ${userProfile.researchCount > 0 ? JSON.stringify(userProfile.researchDetails.map((r: ResearchItem) => r.name || r.title)) : ''}
- 实习经历: ${userProfile.internshipCount}项 ${userProfile.internshipCount > 0 ? JSON.stringify(userProfile.internshipDetails.map((i: InternshipItem) => i.company || i.name)) : ''}
- 竞赛获奖: ${userProfile.competitionCount}项 ${userProfile.competitionCount > 0 ? JSON.stringify(userProfile.competitionDetails.map((c: CompetitionItem) => c.name)) : ''}

【用户偏好】
- 最看重: ${prioritiesText}
- 避开国家/地区: ${excludedText}
- 特殊要求: ${preference.specialRequirements || '无'}

【学校数据库】（含录取标准）
${JSON.stringify(schoolsList, null, 2)}

【推荐规则 - 必须严格遵守】

**冲刺院校 (reach)**: 录取概率 15-35%
- 用户背景明显低于学校要求
- 或院校背景不在学校偏好范围内但其他条件优秀
- 每所必须说明主要差距和风险点
- 建议数量: 1-2所

**匹配院校 (match)**: 录取概率 40-65%
- 用户GPA达到学校minGPA
- 院校背景在学校偏好范围内或接近
- 整体背景与学校要求基本匹配
- 建议数量: 3-4所

**保底院校 (safe)**: 录取概率 75%+
- 用户GPA高于学校minGPA 0.2以上
- 院校背景符合学校偏好
- 整体背景明显优于学校要求
- 建议数量: 2-3所

【严格约束】
1. 如果用户GPA低于学校minGPA，只能作为"冲刺"推荐
2. 如果用户院校背景是"普通本科"，申请竞争程度"extreme"或"very_high"的学校，只能作为"冲刺"
3. 如果用户无科研经历，申请研究型强校（researchWeight > 0.4）需降档推荐
4. 每所推荐学校必须给出录取概率（百分比区间）
5. 每所推荐学校必须指出主要差距（gaps数组）
6. 避开用户明确排除的国家

请输出JSON格式：
{
  "recommendations": [
    {
      "schoolId": 1,
      "ranking": 1,
      "category": "reach" | "match" | "safe",
      "aiReason": "推荐理由（2-3句话，包含匹配分析）",
      "matchScore": 75,
      "admissionProbability": "25-35%",
      "gaps": ["GPA低于偏好要求0.3", "缺少科研经历"],
      "advantages": ["实习经历丰富", "专业对口"]
    }
  ],
  "summary": "整体推荐策略说明（50字以内）",
  "riskWarning": "主要风险提示（如背景较弱需提升的方面）",
  "suggestions": ["提升建议1", "提升建议2"]
}`
  }

  const buildAnalysisPrompt = (assessment: AssessmentForm, schoolId: number): string => {
    const school = schoolsData.find((s) => s.id === schoolId)
    if (!school) throw new Error('School not found')

    const userProfile = buildUserProfile(assessment)

    const universityTierText = userProfile.university === '985' ? '985院校' :
                               userProfile.university === '211' ? '211院校' :
                               userProfile.university === 'overseas' ? '海外院校' : '普通本科'

    const competitivenessText = {
      'extreme': '极高（如MIT、斯坦福等顶尖名校）',
      'very_high': '很高（如常春藤、牛剑等）',
      'high': '较高（如QS前50）',
      'moderate': '中等（如QS 50-100）',
      'moderate_low': '中低（如QS 100-200）'
    }[school.admissionCriteria.competitiveness] || school.admissionCriteria.competitiveness

    return `你是一位资深留学顾问，请对用户的申请进行**客观、严谨**的深度分析。

【核心原则】
1. 必须客观评估，宁可保守不可乐观
2. 录取概率要有具体依据，参考学校实际录取难度和录取率
3. 明确指出差距和风险，不要模糊处理
4. 给出切实可行的提升建议

【用户背景】
- GPA: ${userProfile.gpa}/4.0
- 院校背景: ${universityTierText}
- 专业: ${userProfile.majors}
- 均分: ${userProfile.averageScore}/100
- 语言成绩: ${userProfile.language}
- 科研经历: ${userProfile.researchCount}项 ${userProfile.researchCount > 0 ? JSON.stringify(userProfile.researchDetails.map((r: ResearchItem) => r.name || r.title)) : ''}
- 实习经历: ${userProfile.internshipCount}项 ${userProfile.internshipCount > 0 ? JSON.stringify(userProfile.internshipDetails.map((i: InternshipItem) => i.company || i.name)) : ''}
- 竞赛获奖: ${userProfile.competitionCount}项 ${userProfile.competitionCount > 0 ? JSON.stringify(userProfile.competitionDetails.map((c: CompetitionItem) => c.name)) : ''}

【学校信息】
- 名称: ${school.name}
- 国家: ${school.country}
- 排名: ${school.ranking}
- 录取率: ${school.acceptanceRate}
- 竞争程度: ${competitivenessText}

【学校录取标准】
- 最低GPA要求: ${school.admissionCriteria.minGPA}
- 偏好GPA: ${school.admissionCriteria.preferredGPA}
- 偏好院校背景: ${school.admissionCriteria.universityTier?.join('、') || '无特殊要求'}
- 均分要求: ${school.admissionCriteria.averageScoreMin || '无特殊要求'}分以上
- 科研权重: ${school.admissionCriteria.researchWeight ? (school.admissionCriteria.researchWeight * 100).toFixed(0) + '%' : '无特殊要求'}

【分析要求】

1. **差距分析**: 必须逐项对比用户背景与学校要求，明确指出差距
2. **录取概率**: 给出具体的百分比区间（如25-35%），并说明依据
3. **风险评估**: 列出主要风险点，不要回避问题
4. **提升建议**: 给出切实可行的改进方案

【概率评估参考标准】
- 75%+ : 保底，用户背景明显优于学校要求
- 50-70% : 匹配，用户背景基本符合学校要求
- 30-50% : 有一定机会，但存在明显短板
- 15-30% : 冲刺，用户背景明显低于学校要求
- 15%以下 : 非常困难，差距过大

请输出JSON格式：
{
  "matchPoints": ["匹配点1（具体说明）", "匹配点2（具体说明）"],
  "gaps": ["差距1（具体说明）", "差距2（具体说明）"],
  "risks": ["风险1（具体说明）", "风险2（具体说明）"],
  "suggestions": ["建议1（具体可行）", "建议2（具体可行）"],
  "admissionProbability": {
    "range": "25-35%",
    "level": "冲刺" | "匹配" | "保底",
    "reasoning": "概率评估依据（参考学校录取率、竞争程度、用户背景差距等）"
  },
  "keyFactors": {
    "strengths": ["优势因素1", "优势因素2"],
    "weaknesses": ["劣势因素1", "劣势因素2"],
    "critical": ["关键影响因素1", "关键影响因素2"]
  },
  "timeline": {
    "urgent": ["紧急需要完成的事项"],
    "shortTerm": ["1-3个月内可完成"],
    "longTerm": ["3个月以上需要持续努力"]
  }
}`
  }

  const generateRecommendations = async (
    assessment: AssessmentForm,
    preference: UserPreference,
    providerId: string,
    _onStream?: (content: string) => void
  ): Promise<{ recommendations: AIRecommendation[], summary: string }> => {
    globalState.startRecommendation(assessment, preference, providerId)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      globalState.updateStep('matching', 50)
      await new Promise(resolve => setTimeout(resolve, 300))

      const prompt = buildRecommendationPrompt(assessment, preference)

      const messages = [
        { role: 'user' as const, content: prompt }
      ]

      globalState.updateStep('generating', 75)

      const fullContent = await recStream.generateWithProvider(providerId, messages, {
        temperature: 0.7,
        enableThinking: true
      })

      globalState.updateStreamingContent(fullContent, false)

      const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                       fullContent.match(/\{[\s\S]*\}/)

      let parsed: AIRecommendationResponse

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        parsed = JSON.parse(jsonStr.trim())
      } else {
        throw new Error('无法解析AI响应')
      }

      const localMatches = getAllSchoolsWithMatch(assessment)
      const localMatchMap = new Map(localMatches.map((s: SchoolWithMatch) => [s.id, s.match || 50]))

      const recommendations: AIRecommendation[] = parsed.recommendations.map((rec: { schoolId: number; ranking: number; category: string; aiReason: string; matchScore: number }) => {
        const school = schoolsData.find((s) => s.id === rec.schoolId)
        const aiScore = Number(rec.matchScore)
        const matchScore = (aiScore > 0 ? aiScore : localMatchMap.get(rec.schoolId) || 50)
        return {
          schoolId: rec.schoolId,
          schoolName: school?.name || '未知学校',
          aiReason: rec.aiReason,
          matchScore,
          ranking: rec.ranking,
          category: (rec.category as 'core' | 'alternative') || 'core'
        }
      })

      globalState.completeRecommendation(recommendations, parsed.summary)

      return {
        recommendations,
        summary: parsed.summary
      }
    } catch (err) {
      console.error('[AI Recommendation] Failed, using fallback algorithm:', err)
      const errorMsg = err instanceof Error ? err.message : '生成推荐失败'
      globalState.setError(errorMsg)

      const fallback = generateFallbackRecommendations(assessment, {
        priorities: ['ranking'],
        excludedCountries: [],
        specialRequirements: ''
      })
      return {
        ...fallback,
        summary: fallback.summary + '（基于本地匹配算法，AI推荐暂不可用）'
      }
    }
  }

  const generateAnalysis = async (
    assessment: AssessmentForm,
    schoolId: number,
    providerId: string,
    _onStream?: (content: string) => void
  ): Promise<SchoolAnalysis> => {
    globalState.startAnalysis(schoolId, assessment, providerId)

    try {
      const prompt = buildAnalysisPrompt(assessment, schoolId)

      const messages = [
        { role: 'user' as const, content: prompt }
      ]

      const stream = getAnalysisStream(schoolId)
      const fullContent = await stream.generateWithProvider(providerId, messages, {
        temperature: 0.7,
        enableThinking: true
      })

      globalState.updateAnalysisStreamingContent(fullContent, false)

      const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                       fullContent.match(/\{[\s\S]*\}/)

      let parsed: AIAnalysisResponse

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        parsed = JSON.parse(jsonStr.trim())
      } else {
        throw new Error('无法解析AI响应')
      }

      const analysis: SchoolAnalysis = {
        schoolId,
        matchPoints: parsed.matchPoints || [],
        risks: parsed.risks || [],
        suggestions: parsed.suggestions || [],
        admissionProbability: parsed.admissionProbability || '未知'
      }

      globalState.completeAnalysis(analysis)
      return analysis
    } catch (err) {
      console.error('Generate analysis error:', err)
      const errorMsg = err instanceof Error ? err.message : '生成分析失败'
      globalState.setAnalysisError(errorMsg)

      return generateFallbackAnalysis(assessment, schoolId)
    }
  }

  const buildPersonalizedReason = (school: SchoolWithMatch, assessment: AssessmentForm): string => {
    const criteria = school.admissionCriteria
    if (!criteria) return `${school.name}在${school.major}领域实力突出，综合匹配度${school.match}%，值得重点考虑。`

    const userGPA = assessment.basic?.gpa || 3.0
    const userUni = assessment.basic?.university || 'regular'

    const prefGap = (criteria.preferredGPA - userGPA).toFixed(1)
    const uniMatches = criteria.universityTier.includes(userUni)
    const rateNum = criteria.acceptanceRateNum * 100

    const parts: string[] = []

    const sellingPoints: Record<string, string[]> = {
      '麻省理工学院': ['全球理工科最高殿堂', '科研资源世界顶级', '校友网络覆盖科技巨头'],
      '帝国理工学院': ['工程与自然科学欧洲顶尖', '伦敦核心区位优势', '产业合作紧密'],
      '牛津大学': ['英语世界最古老学府', '学院制教育体系独特', '人脉资源遍布全球'],
      '哈佛大学': ['常春藤盟校标杆', '商科/法学全美顶尖', '校友影响力无与伦比'],
      '剑桥大学': ['诺贝尔奖得主摇篮', '导师制教学体验', '学术氛围浓厚'],
      '斯坦福大学': ['硅谷核心位置', '创业生态全球最佳', '科技行业就业优势显著'],
      '苏黎世联邦理工学院': ['爱因斯坦母校', '欧洲大陆最强理工', '学费极低性价比极高'],
      '新加坡国立大学': ['亚洲综合排名领先', '国际化程度极高', '东南亚就业门户'],
      '伦敦大学学院': ['伦敦大学联盟旗舰', '多学科交叉研究强', '地理位置优越'],
      '加州理工学院': ['师生比极低精英教育', '前沿科学研究圣地', '小而精的学术社区']
    }

    const sellingPointList = sellingPoints[school.name] || [
      `${school.major}专业实力强劲`,
      `${school.ranking.replace('QS #', 'QS排名')}位居前列`,
      school.description.slice(0, 20) + (school.description.length > 20 ? '...' : '')
    ]
    parts.push(sellingPointList[Math.floor(Math.random() * sellingPointList.length)])

    if (userGPA >= criteria.preferredGPA) {
      parts.push(`你的GPA ${userGPA} 已超过该校偏好值 ${criteria.preferredGPA}，学术背景有竞争力`)
    } else if (userGPA >= criteria.minGPA) {
      parts.push(`GPA ${userGPA} 达到最低要求(${criteria.minGPA})，但距离偏好值还差 ${prefGap}`)
    } else {
      parts.push(`GPA ${userGPA} 略低于最低要求 ${criteria.minGPA}，需在文书中重点弥补`)
    }

    if (!uniMatches && (criteria.competitiveness === 'extreme' || criteria.competitiveness === 'very_high')) {
      const tierMap: Record<string, string> = { '985': '985院校', '211': '211院校', 'regular': '普通本科', 'overseas': '海外院校' }
      parts.push(`${tierMap[userUni] || userUni}背景申请该校属于冲刺，需靠其他亮点补足`)
    } else if (uniMatches) {
      parts.push('院校背景符合该校偏好范围')
    }

    if (rateNum < 5) {
      parts.push(`录取率仅${school.acceptanceRate}，属全球最难录取梯队`)
    } else if (rateNum < 15) {
      parts.push(`录取率约${school.acceptanceRate}，竞争非常激烈`)
    } else if (rateNum < 35) {
      parts.push(`录取率${school.acceptanceRate}，有一定竞争但可尝试`)
    } else {
      parts.push(`录取率${school.acceptanceRate}，相对友好`)
    }

    const tuitionNum = parseInt(school.tuition.replace(/[^0-9]/g, ''))
    if (tuitionNum > 50000) {
      parts.push(`年学费约${school.tuition}，需提前规划资金`)
    } else if (tuitionNum < 5000) {
      parts.push(`学费仅${school.tuition}，性价比极高`)
    }

    const categoryAdvice: Record<string, string> = {
      reach: `建议作为冲刺目标，重点打磨文书和推荐信`,
      safe: `可作为稳妥选择，录取概率较高`,
      match: `与背景契合度较高，建议重点申请`
    }
    parts.push(categoryAdvice[school.category] || '')

    const filtered = parts.filter(Boolean)
    const selected = filtered.slice(0, 3 + Math.floor(Math.random() * 2))

    return selected.join('。') + '。'
  }

  const generateFallbackRecommendations = (assessment: AssessmentForm, _preference: UserPreference): { recommendations: AIRecommendation[], summary: string } => {
    const schoolsWithMatch = getAllSchoolsWithMatch(assessment)

    const filtered = schoolsWithMatch.filter((s: SchoolWithMatch) => s.match && s.match > 50)

    const sorted = filtered.sort((a: SchoolWithMatch, b: SchoolWithMatch) => (b.match || 0) - (a.match || 0)).slice(0, 8)

    const recommendations: AIRecommendation[] = sorted.map((school: SchoolWithMatch, index: number) => ({
      schoolId: school.id ?? 0,
      schoolName: school.name,
      aiReason: buildPersonalizedReason(school, assessment),
      matchScore: school.match || 50,
      ranking: index + 1,
      category: index < 5 ? 'core' : 'alternative'
    }))

    const topSchool = sorted[0]
    const summary = topSchool
      ? `优先推荐${topSchool.name}（${topSchool.country}，匹配度${topSchool.match}%），共筛选${sorted.length}所适配院校`
      : '基于你的背景智能匹配推荐'

    return { recommendations, summary }
  }

  const generateFallbackAnalysis = (assessment: AssessmentForm, schoolId: number): SchoolAnalysis => {
    const school = schoolsData.find((s) => s.id === schoolId)
    if (!school) {
      return {
        schoolId,
        matchPoints: ['学校信息加载中...'],
        risks: ['请稍后重试'],
        suggestions: ['尝试刷新页面'],
        admissionProbability: '未知'
      }
    }

    const userGPA = assessment.basic?.gpa || 3.0
    const gpaMatch = userGPA >= school.admissionCriteria.minGPA

    return {
      schoolId,
      matchPoints: [
        gpaMatch ? `你的GPA ${userGPA} 达到该校最低要求 ${school.admissionCriteria.minGPA}` : '建议提升GPA以增强竞争力',
        `该校${school.major}专业实力较强`,
        `${school.country}的留学环境适合你的发展`
      ],
      risks: [
        `录取率仅${school.acceptanceRate}，竞争激烈`,
        school.admissionCriteria.competitiveness === 'extreme' ? '顶尖名校，申请难度极高' : '需要充分准备申请材料'
      ],
      suggestions: [
        '重点突出你的科研和实践经历',
        '准备高质量的推荐信',
        '精心打磨申请文书',
        '提前准备语言成绩'
      ],
      admissionProbability: school.match && school.match > 80 ? '较高' :
                           school.match && school.match > 60 ? '中等' : '较低'
    }
  }

  const loading = computed(() => globalState.state.loading || recStream.isLoading.value)
  const error = computed(() => globalState.state.error)
  const currentStep = computed(() => globalState.state.currentStep)
  const stepProgress = computed(() => globalState.state.stepProgress)
  const streamingContent = computed(() => globalState.state.streamingContent)
  const isStreaming = computed(() => globalState.state.isStreaming || recStream.isStreaming.value)

  const analysisLoading = computed(() => globalState.state.schoolAnalysis.loading)
  const analysisStreamingContent = computed(() => globalState.state.schoolAnalysis.streamingContent)
  const isAnalysisStreaming = computed(() => globalState.state.schoolAnalysis.isStreaming)
  const currentAnalysisResult = computed(() => globalState.state.schoolAnalysis.analysis)

  return {
    loading,
    error,
    currentStep,
    stepProgress,
    streamingContent,
    isStreaming,
    generateRecommendations,
    generateAnalysis,
    analysisLoading,
    analysisStreamingContent,
    isAnalysisStreaming,
    currentAnalysisResult,
    globalState,
    stopRecommendation: () => recStream.stop(),
    retryRecommendation: () => recStream.retry(),
    stopAnalysis: (schoolId: number) => getAnalysisStream(schoolId).stop(),
    recStream
  }
}
