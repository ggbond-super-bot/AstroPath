/**
 * AI API 调用工具模块
 * 支持多provider切换：OpenAI、Anthropic、国内供应商、其他
 */

import { DEFAULT_PROVIDER } from '@/composables/useAIConfig'

const _debug = import.meta.env.DEV ? (...args) => console.log('[AI API]', ...args) : () => {}

const IS_DEV = import.meta.env.DEV

function resolveApiUrl(provider) {
  if (!provider.baseUrl) return '/ai-proxy/chat/completions'
  if (IS_DEV && provider.baseUrl.startsWith('http')) {
    try {
      const url = new URL(provider.baseUrl)
      return `/ai-proxy/chat/completions`
    } catch {
      return `${provider.baseUrl}/chat/completions`
    }
  }
  return `${provider.baseUrl}/chat/completions`
}

const EMPTY_USER_GUIDANCE_PROMPT = `【⚠️ 重要：用户尚未填写背景信息】

用户还没有在系统中填写个人背景信息（GPA、院校、语言成绩等），所以你目前无法提供个性化的选校建议或评估。

【你应该这样做】
1. 友好地告知用户你目前还没有他们的背景信息
2. 引导用户先去「留学评估」页面填写基本信息（这是系统功能，填写后你会自动获得数据）
3. 如果用户想直接聊，可以在对话中主动收集关键信息：GPA、本科院校（985/211/双非）、语言成绩（雅思/托福）、意向国家和专业
4. 不要说"我无法查看您的简历"这类话——你本来就没有这个能力，这会让用户困惑
5. 保持友好、专业的语气，像一个真正的顾问在接待新客户`

// 自定义错误类
export class AIError extends Error {
  constructor(type, message, details = null) {
    super(message)
    this.name = 'AIError'
    this.type = type // 'network' | 'auth' | 'config' | 'unsupported' | 'api'
    this.details = details
  }
}

// 获取所有已配置的provider
export function getProviders() {
  const saved = localStorage.getItem('ai_providers')
  return saved ? JSON.parse(saved) : [DEFAULT_PROVIDER]
}

// 根据ID获取provider配置
export function getProviderById(id) {
  const providers = getProviders()
  return providers.find(p => p.id === id)
}

// 发送消息到AI API
export async function sendMessageToAI(providerId, messages, options = {}, externalSignal) {
  const provider = getProviderById(providerId)

  if (!provider) {
    throw new AIError('config', 'AI服务提供商未找到，请检查配置')
  }

  if (!provider.apiKey || !provider.baseUrl) {
    throw new AIError('config', 'AI服务配置不完整，请完善API Key和Base URL')
  }

  // 检查provider类型支持
  const supportedTypes = ['openai', 'anthropic', 'domestic', 'other']
  if (!supportedTypes.includes(provider.type)) {
    throw new AIError('unsupported', `暂不支持该AI服务商类型: ${provider.type}，请选择其他提供商或配置为"其他"类型`)
  }

  // 构建请求体（根据provider类型）
  const requestBody = buildRequestBody(provider, messages, options)

  try {
    // 发送请求 - 思考模式需要更长的超时时间
    const controller = new AbortController()
    const timeout = options.requestTimeout || (options.enableThinking ? 120000 : 60000)
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    // 如果提供了外部 signal，监听它
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => {
        controller.abort()
        clearTimeout(timeoutId)
      })
    }

    const apiUrl = resolveApiUrl(provider)
    _debug('[AI API] Requesting:', apiUrl, '| model:', provider.model, '| provider:', provider.name)
    _debug('[AI API] Full URL will be proxied to:', provider.baseUrl, '/chat/completions')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()

      // 根据状态码区分错误类型
      if (response.status === 401 || response.status === 403) {
        throw new AIError('auth', `API认证失败 (${response.status})，请检查您的API Key是否正确`, errorText)
      } else if (response.status >= 500) {
        throw new AIError('api', `AI服务端错误 (${response.status})，请稍后重试或更换服务商`, errorText)
      } else {
        throw new AIError('api', `请求失败: ${response.status} - ${errorText}`)
      }
    }

    // 处理流式或非流式响应
    if (options.stream) {
      const contentType = response.headers.get('content-type') || ''
      _debug('[AI API] Response content-type:', contentType)
      
      // 检查是否是流式响应
      if (contentType.includes('text/event-stream') || contentType.includes('application/stream+json')) {
        return handleStreamResponse(response)
      } else {
        // API 可能不支持流式输出，返回的是普通 JSON
        _debug('[AI API] API did not return stream format, falling back to normal response')
        return handleNonStreamAsStream(response)
      }
    } else {
      return handleNormalResponse(response)
    }
  } catch (error) {
    _debug('[AI API] Request failed:', error.name, error.message)

    if (error.name === 'AbortError') {
      throw new AIError('network', '请求超时，请检查网络连接或稍后重试')
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new AIError('network', '网络连接失败，请检查您的网络设置')
    } else if (error instanceof AIError) {
      throw error // 重新抛出已分类的AI错误
    } else {
      throw new AIError('api', `请求异常: ${error.message}`)
    }
  }
}

// 构建请求体
function buildRequestBody(provider, messages, options) {
  _debug('[AI API] buildRequestBody options:', options)
  
  const baseBody = {
    model: provider.model || 'gpt-3.5-turbo',
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    temperature: options.temperature || 0.7,
    stream: options.stream || false
  }

  // 思考模式特殊处理
  if (options.enableThinking) {
    if (provider.type === 'anthropic') {
      // (anthropic 类型在下面单独处理)
    }
    else if (provider.type === 'domestic' || provider.type === 'other') {
      baseBody.enable_thinking = true
    } else {
      baseBody.enable_thinking = true
    }

    if (provider.type === 'deepseek' || provider.model?.toLowerCase().includes('deepseek')) {
      baseBody.max_thinking_tokens = 8000
    }

    if (!baseBody.max_tokens) {
      baseBody.max_tokens = 8192
    }
  } else {
    // 不启用思考模式时，对支持思考的模型显式禁用
    if (provider.type === 'domestic' || provider.type === 'other') {
      baseBody.thinking = {
        type: 'disabled'
      }
    } else if (provider.type !== 'anthropic') {
      baseBody.do_sample = true
    }
  }
  
  // 设置 max_tokens（如果提供了且大于0）
  if (options.maxTokens && options.maxTokens > 0) {
    baseBody.max_tokens = options.maxTokens
  }

  if (provider.type === 'anthropic') {
    const anthropicBody = {
      model: provider.model || 'claude-3-opus-20240229',
      messages: messages.filter(m => m.role !== 'system').map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      system: messages.find(m => m.role === 'system')?.content || '',
      stream: options.stream || false
    }
    if (options.enableThinking) {
      anthropicBody.thinking = { type: 'enabled', budget_tokens: 16000 }
    } else {
      anthropicBody.thinking = { type: 'disabled' }
    }
    return anthropicBody
  }

  _debug('[AI API] Final request body:', JSON.stringify(baseBody, null, 2))
  _debug('[AI API] enableThinking:', options.enableThinking, 'has thinking field:', !!baseBody.thinking)
  return baseBody
}

// 处理普通响应
async function handleNormalResponse(response) {
  const data = await response.json()
  return {
    success: true,
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage
  }
}

// 将非流式响应转换为流式输出（模拟打字效果）
async function* handleNonStreamAsStream(response) {
  const data = await response.json()
  const fullContent = data.choices?.[0]?.message?.content || ''
  
  _debug('[AI API] Converting non-stream response to stream, content length:', fullContent.length)
  
  if (!fullContent) {
    return
  }
  
  // 按字符或词组分割，模拟流式输出
  // 使用词组分割会更自然
  const chunks = splitIntoChunks(fullContent)
  
  for (let i = 0; i < chunks.length; i++) {
    // 添加小延迟，模拟打字效果
    await new Promise(resolve => setTimeout(resolve, 15))
    yield { type: 'content', content: chunks[i] }
  }
}

// 将文本分割成适合流式输出的块
function splitIntoChunks(text) {
  const chunks = []
  let currentChunk = ''
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    currentChunk += char
    
    // 在标点符号、空格或换行处分隔
    const shouldSplit = 
      char === '。' || 
      char === '，' || 
      char === '、' || 
      char === '；' || 
      char === '：' || 
      char === '！' || 
      char === '？' || 
      char === '.' || 
      char === ',' || 
      char === ' ' || 
      char === '\n' ||
      currentChunk.length >= 5
    
    if (shouldSplit && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = ''
    }
  }
  
  // 添加剩余内容
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

// 处理流式响应
async function* handleStreamResponse(response) {
  _debug('[AI API] Starting stream response handling')
  _debug('[AI API] Response headers:', Object.fromEntries(response.headers.entries()))
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let chunkCount = 0
  let isInsideThinkTag = false
  let thinkBuffer = ''

  while (true) {
    const { done, value } = await reader.read()
    _debug('[AI API] Read chunk:', { done, valueLength: value?.length })
    
    if (done) {
      _debug('[AI API] Stream done, total chunks:', chunkCount)
      break
    }

    const decodedValue = decoder.decode(value, { stream: true })
    _debug('[AI API] Decoded value:', decodedValue.substring(0, 200))
    
    buffer += decodedValue
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      _debug('[AI API] Processing line:', trimmedLine.substring(0, 100))
      
      // 尝试多种格式解析
      let data = null
      
      // 格式1: 标准 SSE 格式 "data: {...}"
      if (trimmedLine.startsWith('data: ')) {
        data = trimmedLine.slice(6)
      }
      // 格式2: 无空格的 SSE 格式 "data:{...}"
      else if (trimmedLine.startsWith('data:')) {
        data = trimmedLine.slice(5).trim()
      }
      // 格式3: 直接是 JSON 对象
      else if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
        data = trimmedLine
      }
      
      if (data) {
        if (data === '[DONE]') {
          _debug('[AI API] Received [DONE] signal')
          return
        }

        try {
          const parsed = JSON.parse(data)
                    _debug('[AI API] Parsed data:', parsed)

          // 处理推理内容 - 支持多种字段名
          const delta = parsed.choices?.[0]?.delta
          const reasoningContent =
            delta?.reasoning_content ||
            delta?.thinking ||
            delta?.reasoning ||
            delta?.thought

          if (reasoningContent) {
            chunkCount++
            _debug('[AI API] Yielding reasoning chunk #', chunkCount, ':', reasoningContent)
            yield { type: 'reasoning', content: reasoningContent }
          }

          // 处理正常内容
          const content =
            parsed.choices?.[0]?.delta?.content ||  // OpenAI 流式格式
            parsed.choices?.[0]?.message?.content || // OpenAI 非流式格式
            parsed.delta?.text ||                     // 某些 API 格式
            parsed.text ||                            // 简单文本格式
            parsed.content                            // 其他格式

          if (content) {
            // 如果已经有独立的 reasoning_content，则不再解析 content 中的 think 标签
            // 避免重复显示思考内容
            if (reasoningContent) {
              // 只返回 content，不解析 think 标签
              chunkCount++
              _debug('[AI API] Yielding content chunk #', chunkCount, ':', content.substring(0, 50))
              yield { type: 'content', content: content }
            } else {
              // 没有独立的 reasoning_content，需要解析 content 中的 think 标签
              const processedChunks = processContentWithThinkTags(content, isInsideThinkTag, thinkBuffer)
              isInsideThinkTag = processedChunks.isInsideThinkTag
              thinkBuffer = processedChunks.thinkBuffer

              for (const chunk of processedChunks.chunks) {
                chunkCount++
                _debug('[AI API] Yielding', chunk.type, 'chunk #', chunkCount, ':', chunk.content.substring(0, 50))
                yield chunk
              }
            }
          }
        } catch (e) {
          console.warn('[AI API] Failed to parse SSE data:', data, e)
        }
      }
    }
  }
  
  // 处理剩余的 buffer
  if (buffer.trim()) {
    let data = null
    if (buffer.startsWith('data: ')) {
      data = buffer.slice(6)
    } else if (buffer.startsWith('data:')) {
      data = buffer.slice(5).trim()
    } else if (buffer.startsWith('{')) {
      data = buffer
    }
    
    if (data && data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data)

        // 处理推理内容 - 支持多种字段名
        const reasoningContent =
          parsed.choices?.[0]?.delta?.reasoning_content ||
          parsed.choices?.[0]?.delta?.thinking ||
          parsed.choices?.[0]?.delta?.reasoning ||
          parsed.choices?.[0]?.delta?.thought ||
          parsed.choices?.[0]?.message?.reasoning_content ||
          parsed.choices?.[0]?.message?.thinking ||
          parsed.thinking ||
          parsed.reasoning ||
          parsed.thought

        if (reasoningContent) {
          yield { type: 'reasoning', content: reasoningContent }
        }

        // 处理正常内容
        const content =
          parsed.choices?.[0]?.delta?.content ||
          parsed.choices?.[0]?.message?.content ||
          parsed.delta?.text ||
          parsed.text ||
          parsed.content

        if (content) {
          // 如果已经有独立的 reasoning_content，则不再解析 content 中的 think 标签
          if (reasoningContent) {
            yield { type: 'content', content: content }
          } else {
            const processedChunks = processContentWithThinkTags(content, isInsideThinkTag, thinkBuffer)
            for (const chunk of processedChunks.chunks) {
              yield chunk
            }
            // 更新状态
            isInsideThinkTag = processedChunks.isInsideThinkTag
            thinkBuffer = processedChunks.thinkBuffer
          }
        }
      } catch (e) {
        console.warn('[AI API] Failed to parse remaining buffer:', buffer, e)
      }
    }
  }
  
  // 流结束时，如果仍然在 think 标签内部，输出剩余的内容
  if (isInsideThinkTag && thinkBuffer.trim()) {
    yield { type: 'reasoning', content: thinkBuffer }
  }
}

function processContentWithThinkTags(content, isInsideThinkTag, thinkBuffer) {
  const chunks = []
  // 将新内容追加到缓冲区
  let currentBuffer = thinkBuffer + content

  _debug('[AI API] processContentWithThinkTags - input:', content.substring(0, 100))
  _debug('[AI API] processContentWithThinkTags - buffer length:', currentBuffer.length)
  _debug('[AI API] processContentWithThinkTags - isInsideThinkTag:', isInsideThinkTag)

  // 使用更简单可靠的算法：循环处理直到没有更多标签
  let remainingBuffer = currentBuffer
  let loopCount = 0
  const MAX_LOOPS = 100 // 防止无限循环

  while (remainingBuffer.length > 0 && loopCount < MAX_LOOPS) {
    loopCount++

    if (!isInsideThinkTag) {
      // 在 think 标签外部，寻找开始标签
      const thinkStartIdx = remainingBuffer.indexOf('<think>')

      if (thinkStartIdx === -1) {
        // 没有找到开始标签，检查是否是部分标签（如 '<th', '<thin' 等）
        // 如果缓冲区以 '<' 或 '<t' 或 '<th' 等开头，可能是标签的一部分，需要保留到下一个 chunk
        const partialTagMatch = remainingBuffer.match(/<t?h?i?n?k?$/)
        if (partialTagMatch && remainingBuffer.length < 10) {
          // 可能是部分标签，保留到下一个 chunk
          thinkBuffer = remainingBuffer
          remainingBuffer = ''
          break
        }
        // 没有找到开始标签，剩余内容都是普通内容
        if (remainingBuffer.trim()) {
          chunks.push({ type: 'content', content: remainingBuffer })
        }
        remainingBuffer = ''
        thinkBuffer = ''
        break
      } else {
        // 找到开始标签，先输出标签前的普通内容
        if (thinkStartIdx > 0) {
          const textContent = remainingBuffer.slice(0, thinkStartIdx)
          if (textContent.trim()) {
            chunks.push({ type: 'content', content: textContent })
          }
        }
        // 进入 think 标签内部，截断缓冲区
        isInsideThinkTag = true
        remainingBuffer = remainingBuffer.slice(thinkStartIdx + '<think>'.length)
      }
    } else {
      // 在 think 标签内部，寻找结束标签
      const thinkEndIdx = remainingBuffer.indexOf('</think>')

      if (thinkEndIdx === -1) {
        // 检查尾部是否像 </think> 标签的前缀
        const TAG_PREFIXES = ['<', '</', '</t', '</th', '</thi', '</thin', '</think', '</think>']
        const tailLooksLikeTag = TAG_PREFIXES.some(prefix => remainingBuffer.endsWith(prefix))

        if (tailLooksLikeTag && remainingBuffer.length <= 8) {
          // 尾部像标签前缀且长度较短，保留到下一个 chunk 等待完整标签
          const matchedPrefix = TAG_PREFIXES.find(p => remainingBuffer.endsWith(p))
          const matchLen = matchedPrefix ? matchedPrefix.length : 0
          const outputContent = remainingBuffer.slice(0, -matchLen)
          if (outputContent.trim()) {
            chunks.push({ type: 'reasoning', content: outputContent })
          }
          thinkBuffer = remainingBuffer.slice(-matchLen)
          remainingBuffer = ''
          break
        }
        // 尾部不像标签 → 全部立即输出，不保留缓冲区
        if (remainingBuffer.trim()) {
          chunks.push({ type: 'reasoning', content: remainingBuffer })
        }
        thinkBuffer = ''
        remainingBuffer = ''
        break
      } else {
        // 找到结束标签，输出 think 内容
        const reasoningContent = remainingBuffer.slice(0, thinkEndIdx)
        if (reasoningContent.trim()) {
          chunks.push({ type: 'reasoning', content: reasoningContent })
        }
        // 退出 think 标签，截断缓冲区
        isInsideThinkTag = false
        thinkBuffer = ''
        remainingBuffer = remainingBuffer.slice(thinkEndIdx + '</think>'.length)
      }
    }
  }

  _debug('[AI API] processContentWithThinkTags - output chunks:', chunks.length, 'types:', chunks.map(c => c.type))
  _debug('[AI API] processContentWithThinkTags - remaining thinkBuffer:', thinkBuffer.length)
  _debug('[AI API] processContentWithThinkTags - final isInsideThinkTag:', isInsideThinkTag)

  return { chunks, isInsideThinkTag, thinkBuffer }
}

// 测试provider连接
export async function testProviderConnection(providerId) {
  const provider = getProviderById(providerId)

  if (!provider) {
    return { success: false, error: 'Provider未找到', errorType: 'config' }
  }

  if (!provider.apiKey || !provider.baseUrl) {
    return { success: false, error: '配置不完整', errorType: 'config' }
  }

  try {
    const testMessages = [
      { role: 'user', content: 'Hello, this is a test connection.' }
    ]

    const response = await sendMessageToAI(providerId, testMessages, {
      maxTokens: 10
    })

    return { success: true, response }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      errorType: error instanceof AIError ? error.type : 'unknown'
    }
  }
}

// 为不同智能体构建系统提示词
export function buildSystemPrompt(agentId, userData = null, enableThinking = false) {
  const prompts = {
    consultant: `你是一位专业的留学顾问，帮助用户解答关于出国留学的整体规划问题。
你的回答应该专业、全面、实用，涵盖选校、申请、时间规划等方面。`,
    essay: `你是一位文书导师，专注于帮助用户改进和润色留学申请文书。
你的建议应该具体、可操作，关注个人陈述、简历、推荐信的写作技巧。`,
    selection: `你是一位选校专家，根据用户的背景和目标提供选校建议。
你需要考虑用户的GPA、语言成绩、科研和实践经历，给出冲刺、适中和保底三个档次的学校推荐。`,
    visa: `你是一位签证申请助手，帮助用户了解签证申请流程和注意事项。
你需要针对不同国家（美国、英国、澳洲、加拿大等）提供具体的签证指导。`
  }

  let basePrompt = prompts[agentId] || '你是一个有用的助手。'

  // 思考模式下，思考内容直接输出到 content 中，需要用特定格式包裹以便前端分离显示
  if (enableThinking) {
    basePrompt += `

【重要 - 输出格式要求】
在回答用户问题之前，请先进行思考分析。将你的思考过程用 <think> 和 </think> 标签包裹，例如：
<think>
1. 用户的问题是...
2. 我需要考虑...
3. 建议方案是...
</think>

然后给出你的正式回答。思考过程会实时显示给用户，正式回答应该简洁专业。`
  }

  if (userData) {
    const userInfo = formatUserInfoForPrompt(userData)
    if (userInfo) {
      basePrompt = `【用户背景信息】
${userInfo}

【助手角色】
${basePrompt}

【重要】请根据上述用户背景信息，提供个性化的建议和回答。如果用户的问题涉及选校、申请策略等，请结合他们的GPA、院校背景、语言成绩等具体情况进行推荐。`
    }
  } else {
    basePrompt = `${EMPTY_USER_GUIDANCE_PROMPT}

${basePrompt}`
  }

  return basePrompt
}

function formatUserInfoForPrompt(userData) {
  if (!userData || !userData.basic) return null

  const basic = userData.basic
  const academic = userData.academic || {}
  const practice = userData.practice || {}

  const universityMap = {
    '985': '985院校',
    '211': '211院校',
    'overseas': '海外院校',
    'regular': '普通本科'
  }

  const parts = []

  if (basic.name) parts.push(`姓名：${basic.name}`)
  if (basic.university) parts.push(`在读院校：${universityMap[basic.university] || basic.university}`)
  if (basic.gpa) parts.push(`GPA：${typeof basic.gpa === 'number' ? basic.gpa.toFixed(1) : basic.gpa}/4.0`)
  if (basic.language) parts.push(`语言成绩：${basic.language}`)
  if (academic.degree) parts.push(`学历层次：${academic.degree}`)
  if (academic.majors && academic.majors.length > 0) parts.push(`专业方向：${academic.majors.join('、')}`)
  if (academic.averageScore) parts.push(`均分：${academic.averageScore}/100`)

  if (academic.research && academic.research.length > 0) {
    const researchList = academic.research.map(r => `${r.name}（${r.role}，${r.duration}）`).join('、')
    parts.push(`科研经历：${researchList}`)
  }

  if (practice.internships && practice.internships.length > 0) {
    const internshipList = practice.internships.map(i => `${i.company}（${i.position}）`).join('、')
    parts.push(`实习经历：${internshipList}`)
  }

  if (practice.competitions && practice.competitions.length > 0) {
    const compList = practice.competitions.map(c => `${c.name}（${c.level}-${c.award}）`).join('、')
    parts.push(`竞赛获奖：${compList}`)
  }

  return parts.length > 0 ? parts.join('\n') : null
}

// 生成评估报告提示词 - AI驱动的客观评估
export function buildAssessmentPrompt(formData, scores) {
  const researchDetails = formData.academic.research.length > 0 
    ? formData.academic.research.map(r => `${r.name}（${r.role}，${r.duration}）`).join('、')
    : '无'
  const internshipDetails = formData.practice.internships.length > 0
    ? formData.practice.internships.map(i => `${i.company}（${i.position}）`).join('、')
    : '无'
  const competitionDetails = formData.practice.competitions.length > 0
    ? formData.practice.competitions.map(c => `${c.name}（${c.level}-${c.award}）`).join('、')
    : '无'

  const universityTierText = formData.basic.university === '985' ? '985院校' : 
                             formData.basic.university === '211' ? '211院校' : 
                             formData.basic.university === 'overseas' ? '海外院校' : '普通本科'

  return `你是一位资深的留学申请顾问，拥有15年申请评估经验。请基于用户真实背景，生成一份**客观、严谨、真实**的竞争力评估报告。

【核心原则 - 必须严格遵守】
1. **客观评估**：宁可保守不可乐观，不要给用户不切实际的期望
2. **明确差距**：必须指出用户背景与目标院校的真实差距
3. **风险提示**：诚实告知申请风险，不要回避问题
4. **切实建议**：给出具体可行的提升方案，而非泛泛而谈

【重要】请直接输出最终的评估报告，不要输出你的思考过程、分析步骤或任何中间推理内容。直接以"# 留学申请竞争力评估报告"开头，输出完整的报告内容。

【重要】在整个报告中，请使用"您"来称呼用户，不要使用"该学生"、"该用户"等第三方称呼。

## 用户背景信息

**基础信息：**
- 姓名：${formData.basic.name || '未填写'}
- 年龄：${formData.basic.age}岁
- 在读院校：${universityTierText}
- GPA：${formData.basic.gpa.toFixed(1)}/4.0
- 语言成绩：${formData.basic.language || '未填写'}

**学术背景：**
- 学历层次：${formData.academic.degree}
- 专业方向：${formData.academic.majors.length > 0 ? formData.academic.majors.join('、') : '未选择'}
- 均分：${formData.academic.averageScore}/100

**科研经历：** ${researchDetails}

**实习经历：** ${internshipDetails}

**竞赛获奖：** ${competitionDetails}

**志愿服务：** ${formData.practice.volunteers.length > 0 ? formData.practice.volunteers.map(v => `${v.organization}（${v.role}）`).join('、') : '无'}

## 系统初步评分（仅供参考）

- 学术能力：${scores.academic.toFixed(1)}/5.0
- 语言能力：${scores.language.toFixed(1)}/5.0
- 科研经历：${scores.research.toFixed(1)}/5.0
- 实践背景：${scores.practice.toFixed(1)}/5.0
- 综合评分：${scores.overall.toFixed(1)}/5.0

---

请生成一份详细的评估报告，包含以下内容（使用Markdown格式）：

### 1. 综合竞争力评价
用2-3句话概括您的整体竞争力水平，**必须指出**您最突出的优势和**需要改进的方面**。如果背景较弱，要诚实说明。

### 2. 各维度详细分析

**学术背景分析：**
- 院校背景和GPA的竞争力评估（需对比目标院校要求）
- **明确指出**与目标院校的学术要求差距
- 如果GPA较低，需说明对申请的影响

**语言能力分析：**
- 当前语言成绩的竞争力
- 是否需要重考或提升的建议
- **明确指出**语言成绩是否达标

**科研经历分析：**
- 科研经历的含金量评估
- 如果科研经历不足，需说明对研究型项目申请的影响
- 如何在申请中突出科研亮点

**实践背景分析：**
- 实习、竞赛、志愿服务的综合评价
- 这些经历对申请的加分作用
- 如果实践经历不足，需诚实说明

### 3. 改进建议
列出3-5条**具体、可操作**的改进建议，帮助您在申请前提升竞争力。
- 每条建议需说明**为什么重要**和**如何执行**
- 如果背景较弱，需给出**紧急提升方案**

### 4. 选校方向建议
根据您的背景，**客观**推荐申请方向：

**冲刺院校**（录取概率15-35%）：
- 说明为什么是冲刺（主要差距是什么）
- 建议1-2所类型

**匹配院校**（录取概率40-65%）：
- 说明为什么是匹配（符合哪些条件）
- 建议3-4所类型

**保底院校**（录取概率75%+）：
- 说明为什么是保底（优势在哪里）
- 建议2-3所类型

【严格约束】
- 如果GPA低于3.5，不建议推荐QS前30作为匹配院校
- 如果无科研经历，不建议推荐研究型强校作为匹配院校
- 如果院校背景是普通本科，申请顶尖名校需明确标注为冲刺
- 每类院校必须给出录取概率区间和差距分析

### 5. 风险提示与应对
- 列出申请过程中可能面临的主要风险
- 针对每个风险给出应对策略

注意：
- 分析要客观真实，避免过度乐观
- 如果背景较弱，要诚实告知并给出切实可行的提升路径
- 录取概率预估要有依据，参考学校实际录取难度`
}
