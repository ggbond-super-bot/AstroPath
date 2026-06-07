import { computed, nextTick, onMounted, onUnmounted, onActivated, onDeactivated, reactive, ref, watch, type ComputedRef } from 'vue'
import { sendMessageToAI, AIError } from '@/utils/ai-api'
import { useGlobalAIState, type AIStreamState, type ActiveStreamInfo, type ChatMessage, type AIStreamOptions } from './useGlobalAIState'
import { DEFAULT_PROVIDER } from './useAIConfig'

export interface StreamMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>
}

export interface GenerateOptions extends AIStreamOptions {
  temperature?: number
  max_tokens?: number
  stream?: boolean
  thinking?: boolean
}

export interface UseAIStreamOptions {
  taskId: string
  enableThinking?: boolean
  collapseReasoningOnContent?: boolean
  autoRestore?: boolean
  autoRetry?: boolean
  priority?: number
  autoScroll?: boolean
  scrollContainer?: () => HTMLElement | null
  onComplete?: (content: string, reasoning: string) => void
  onError?: (error: string) => void
  onStream?: (content: string, reasoning: string) => void
  onStateChange?: (state: AIStreamState) => void
  onQueueChange?: (position: number) => void
}

export interface AIStreamResult {
  state: ComputedRef<AIStreamState>
  content: ComputedRef<string>
  reasoning: ComputedRef<string>
  error: ComputedRef<string | null>
  showReasoning: ComputedRef<boolean>
  isStreaming: ComputedRef<boolean>
  isThinking: ComputedRef<boolean>
  isConnecting: ComputedRef<boolean>
  isQueued: ComputedRef<boolean>
  isCompleted: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  hasContent: ComputedRef<boolean>
  hasReasoning: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isPaused: ComputedRef<boolean>
  waitingPhase: ComputedRef<'connecting' | 'processing' | 'ready'>
  queuePosition: ComputedRef<number>
  canRetry: ComputedRef<boolean>
  retryCount: ComputedRef<number>
  userScrolledUp: ReturnType<typeof ref<boolean>>
  generate: (messages: StreamMessage[], options?: GenerateOptions) => Promise<string>
  generateWithProvider: (providerId: string, messages: StreamMessage[], options?: GenerateOptions) => Promise<string>
  stop: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  retry: () => Promise<string>
  toggleReasoning: () => void
  restore: () => boolean
  setShowReasoning: (show: boolean) => void
  scrollToBottom: (force?: boolean) => void
  handleUserScroll: () => void
}

export function useAIStream(options: UseAIStreamOptions): AIStreamResult {
  const {
    taskId,
    enableThinking,
    autoRestore = true,
    autoRetry = false,
    priority = 0,
    autoScroll = true,
    scrollContainer,
    onComplete,
    onError,
    onStream,
    onStateChange,
    onQueueChange
  } = options

  const globalState = useGlobalAIState()

  const actualEnableThinking = enableThinking ?? globalState.getConfig().defaultEnableThinking

  let abortController: AbortController | null = null
  let lastMessages: StreamMessage[] = []
  let lastProviderId: string | null = null
  let lastOptions: GenerateOptions = {} as GenerateOptions

  const userScrolledUp = ref(false)
  let userScrollLocked = false
  let lastUserScrollTime = 0
  let scrollRafId: number | null = null
  let rafScrollId: number | null = null
  const SCROLL_COOLDOWN = 150
  const IDLE_TIMEOUT = 120000

  const pausedRef = ref<boolean>(false)
  let pauseResolve: (() => void) | null = null
  let pauseReject: ((reason?: Error) => void) | null = null

  const task = computed(() => globalState._getRawTask(taskId))

  const state = computed<AIStreamState>(() => task.value?.state || 'idle')
  const contentRef = ref<string>('')
  const reasoningRef = ref<string>('')
  const errorRef = ref<string | null>(null)
  const showReasoningRef = ref<boolean>(true)
  const queuePositionRef = ref<number>(0)
  const retryCountRef = ref<number>(0)
  const maxRetriesRef = ref<number>(0)

  watch(
    () => globalState._getRawTask(taskId)?.content,
    (newContent) => {
      if (newContent !== undefined) {
        contentRef.value = newContent
      }
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.reasoning,
    (newReasoning) => {
      if (newReasoning !== undefined) {
        reasoningRef.value = newReasoning
      }
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.error,
    (newError) => {
      errorRef.value = newError || null
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.state,
    () => {},
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.showReasoning,
    (newVal) => {
      showReasoningRef.value = newVal ?? true
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.queuePosition,
    (newVal) => {
      queuePositionRef.value = newVal || 0
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.retryCount,
    (newVal) => {
      retryCountRef.value = newVal || 0
    },
    { immediate: true }
  )
  
  watch(
    () => globalState._getRawTask(taskId)?.maxRetries,
    (newVal) => {
      maxRetriesRef.value = newVal || globalState.getConfig().retryAttempts
    },
    { immediate: true }
  )

  const content = computed<string>(() => {
    return contentRef.value ?? ''
  })
  const reasoning = computed<string>(() => reasoningRef.value ?? '')
  const error = computed<string | null>(() => errorRef.value)
  const showReasoning = computed<boolean>(() => showReasoningRef.value)
  const queuePosition = computed<number>(() => queuePositionRef.value)
  const retryCount = computed<number>(() => retryCountRef.value)
  const maxRetries = computed<number>(() => maxRetriesRef.value)

  const isStreaming = computed(() => state.value === 'streaming')
  const isThinking = computed(() => state.value === 'thinking')
  const isConnecting = computed(() => state.value === 'connecting')
  const isQueued = computed(() => state.value === 'queued')
  const isCompleted = computed(() => state.value === 'completed')
  const hasError = computed(() => state.value === 'error')
  const hasContent = computed(() => content.value.length > 0)
  const hasReasoning = computed(() => reasoning.value.length > 0)
  const isLoading = computed(() => isConnecting.value || isStreaming.value || isThinking.value || isQueued.value)

  const waitingPhase = computed<'connecting' | 'processing' | 'ready'>(() => {
    if (hasContent.value || hasReasoning.value) return 'ready'
    if (isThinking.value || isStreaming.value) return 'processing'
    if (isConnecting.value || isQueued.value) return 'connecting'
    return 'ready'
  })
  const canRetry = computed(() => {
    if (!hasError.value) return false
    return globalState.canRetry(taskId)
  })

  watch(queuePosition, (newPos) => {
    onQueueChange?.(newPos)
  })

  const getDefaultProvider = (): string => {
    const providers = JSON.parse(localStorage.getItem('ai_providers') || '[]')
    return providers.length > 0 ? providers[0].id : DEFAULT_PROVIDER.id
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const generate = async (messages: StreamMessage[], requestOptions?: GenerateOptions): Promise<string> => {
    const providerId = getDefaultProvider()
    return generateWithProvider(providerId, messages, requestOptions)
  }

  const generateWithProvider = async (
    providerId: string,
    messages: StreamMessage[],
    requestOptions?: GenerateOptions
  ): Promise<string> => {
    lastMessages = messages
    lastProviderId = providerId
    lastOptions = requestOptions ?? ({} as GenerateOptions)

    globalState.initTask(taskId, {
      providerId,
      messages: messages as ChatMessage[],
      options: requestOptions ?? {},
      priority
    })

    registerAsActive()

    const canStart = globalState.enqueueTask(taskId)
    if (!canStart) {
      onStateChange?.('queued')
      return new Promise((resolve, reject) => {
        const unwatch = watch(state, async (newState) => {
          if (newState === 'thinking' || newState === 'streaming') {
            unwatch()
            try {
              const result = await executeGeneration(providerId, messages, requestOptions)
              resolve(result)
            } catch (err) {
              reject(err)
            }
          } else if (newState === 'error') {
            unwatch()
            reject(new Error(error.value || '任务失败'))
          }
        })
      })
    }

    return executeGeneration(providerId, messages, requestOptions)
  }

  const executeGeneration = async (
    providerId: string,
    messages: StreamMessage[],
    requestOptions?: GenerateOptions
  ): Promise<string> => {
    const runtimeConfig = globalState.getConfig()

    const defaultOpts: Record<string, unknown> = {
      temperature: runtimeConfig.defaultTemperature,
      stream: true,
      enableThinking: actualEnableThinking
    }

    if (runtimeConfig.defaultMaxTokens && runtimeConfig.defaultMaxTokens > 0) {
      defaultOpts['maxTokens'] = runtimeConfig.defaultMaxTokens
    }

    const finalOptions = {
      ...defaultOpts,
      ...(requestOptions ?? {}),
      requestTimeout: actualEnableThinking ? runtimeConfig.timeout * 2 : runtimeConfig.timeout
    }

    abortController = new AbortController()

    let fullContent = ''
    let fullReasoning = ''

    try {
      globalState.startConnecting(taskId)
      onStateChange?.('connecting')
      globalState.startThinking(taskId)
      onStateChange?.('thinking')

      const stream = await sendMessageToAI(
        providerId,
        messages,
        finalOptions,
        abortController.signal
      )

      let idleTimer: ReturnType<typeof setTimeout> | null = null
      const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          if (abortController) {
            abortController.abort()
            abortController = null
          }
        }, IDLE_TIMEOUT)
      }

      resetIdleTimer()

      for await (const chunk of stream as AsyncIterable<{ type: string; content: string }>) {
        if (!globalState.isTaskActive(taskId)) break

        await waitForResume()
        if (!globalState.isTaskActive(taskId)) break

        if (chunk.type === 'reasoning' && chunk.content) {
          fullReasoning += chunk.content
          globalState.appendReasoning(taskId, chunk.content)
          onStream?.(fullContent, fullReasoning)
          scrollToBottom()
          resetIdleTimer()
        } else if (chunk.type === 'content' && chunk.content) {
          if (isThinking.value) {
            globalState.startStreaming(taskId)
            onStateChange?.('streaming')
          }
          fullContent += chunk.content
          globalState.appendContent(taskId, chunk.content, true)
          onStream?.(fullContent, fullReasoning)
          scrollToBottom()
          resetIdleTimer()
        }
      }

      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }

      globalState.completeTask(taskId)
      cleanupWatchers()
      globalState.clearActiveStream()
      globalState._unregisterStreamActions(taskId)
      onStateChange?.('completed')
      onComplete?.(fullContent, fullReasoning)

      return fullContent
    } catch (err) {
      const isAbortError = err instanceof DOMException && err.name === 'AbortError'
        || (err instanceof Error && (
            err.name === 'AbortError'
            || err.message.includes('aborted')
            || err.message.includes('AbortError')
          ))

      if (isAbortError) {
        cleanupWatchers()
        globalState.clearActiveStream()
        globalState._unregisterStreamActions(taskId)
        onStateChange?.('completed')
        onComplete?.(fullContent, fullReasoning)
        return fullContent
      }

      const errorMsg = err instanceof AIError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : '请求失败'
      
      globalState.errorTask(taskId, errorMsg)
      onStateChange?.('error')
      onError?.(errorMsg)

      if (autoRetry && globalState.canRetry(taskId)) {
        const delay = globalState.getConfig().retryDelay * Math.pow(2, retryCount.value)
        await sleep(delay)
        return executeGeneration(providerId, messages, requestOptions)
      }

      throw err
    } finally {
      abortController = null
    }
  }

  const activeWatchers: Array<() => void> = []

  const registerAsActive = () => {
    const info = reactive<ActiveStreamInfo>({
      taskId,
      isLoading: isLoading.value,
      isQueued: isQueued.value,
      isThinking: isThinking.value,
      isStreaming: isStreaming.value,
      isConnecting: isConnecting.value,
      hasError: hasError.value,
      queuePosition: queuePosition.value,
      canRetry: canRetry.value,
      retryCount: retryCount.value,
      maxRetries: maxRetries.value,
      waitingPhase: waitingPhase.value
    })

    const unwatchers = [
      watch(isLoading, v => { info.isLoading = v }),
      watch(isQueued, v => { info.isQueued = v }),
      watch(isThinking, v => { info.isThinking = v }),
      watch(isStreaming, v => { info.isStreaming = v }),
      watch(isConnecting, v => { info.isConnecting = v }),
      watch(hasError, v => { info.hasError = v }),
      watch(queuePosition, v => { info.queuePosition = v }),
      watch(canRetry, v => { info.canRetry = v }),
      watch(retryCount, v => { info.retryCount = v }),
      watch(maxRetries, v => { info.maxRetries = v }),
      watch(waitingPhase, v => { info.waitingPhase = v })
    ]

    activeWatchers.forEach(w => w())
    activeWatchers.length = 0
    activeWatchers.push(...unwatchers)

    globalState.setActiveStream(info)
    globalState._registerStreamActions(taskId, stop, retry)
  }

  const cleanupWatchers = () => {
    activeWatchers.forEach(w => w())
    activeWatchers.length = 0
    if (scrollRafId) { cancelAnimationFrame(scrollRafId); scrollRafId = null }
    if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null }
  }

  const stop = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    if (pauseReject) { pauseReject(new Error('stopped')); pauseResolve = null; pauseReject = null }
    pausedRef.value = false
    cleanupWatchers()
    globalState.clearActiveStream()
    globalState._unregisterStreamActions(taskId)
  }

  const pause = () => {
    if (pausedRef.value) return
    pausedRef.value = true
  }

  const resume = () => {
    if (!pausedRef.value) return
    pausedRef.value = false
    if (pauseResolve) { pauseResolve(); pauseResolve = null; pauseReject = null }
  }

  const waitForResume = (): Promise<void> => {
    if (!pausedRef.value) return Promise.resolve()
    return new Promise((resolve, reject) => {
      pauseResolve = resolve
      pauseReject = reject
    })
  }

  const reset = () => {
    stop()
    userScrollLocked = false
    globalState.resetTask(taskId)
  }

  const retry = async (): Promise<string> => {
    if (!lastProviderId || !lastMessages.length) {
      throw new Error('没有可重试的任务')
    }

    const existingTask = globalState.getTask(taskId)
    if (existingTask) {
      globalState.updateTask(taskId, { state: 'idle', error: null, retryCount: existingTask.retryCount })
    } else {
      globalState.resetTask(taskId)
    }
    return generateWithProvider(lastProviderId, lastMessages, lastOptions)
  }

  const toggleReasoning = () => {
    const currentShow = task.value?.showReasoning ?? true
    globalState.updateTask(taskId, { showReasoning: !currentShow })
  }

  const setShowReasoning = (show: boolean) => {
    globalState.updateTask(taskId, { showReasoning: show })
  }

  const doScroll = () => {
    const container = scrollContainer?.()
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  const scrollToBottom = (force: boolean = false) => {
    if (!autoScroll) return

    if (force) {
      if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null }
      doScroll()
      return
    }

    if (userScrollLocked) return
    if (Date.now() - lastUserScrollTime < SCROLL_COOLDOWN) return
    if (rafScrollId) return

    rafScrollId = requestAnimationFrame(() => {
      rafScrollId = null
      doScroll()
    })
  }

  const handleUserScroll = () => {
    const container = scrollContainer?.()
    if (!container) return

    lastUserScrollTime = Date.now()

    if (scrollRafId) return
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null

      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const isAtBottom = distanceFromBottom < 60

      if (!isAtBottom && distanceFromBottom > 80) {
        userScrollLocked = true
        userScrolledUp.value = true
      } else if (isAtBottom) {
        userScrollLocked = false
        userScrolledUp.value = false
      }
    })
  }

  const restore = (): boolean => {
    const existingTask = globalState.getTask(taskId)
    if (existingTask) {
      // If task is still actively streaming/thinking, the stream is running in the
      // background (kept alive by <keep-alive>). Just bind to it — don't mark as error.
      if (existingTask.state === 'thinking' || existingTask.state === 'streaming' || existingTask.state === 'connecting') {
        return true
      }
      return existingTask.state === 'completed' || existingTask.state === 'error'
    }
    return false
  }

  if (autoRestore) {
    onMounted(() => {
      restore()
    })
  }

  // onDeactivated: called when <keep-alive> deactivates this component (navigation away).
  // Do NOT abort the stream — let it continue in the background.
  onDeactivated(() => {
    if (scrollRafId) { cancelAnimationFrame(scrollRafId); scrollRafId = null }
    if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null }
  })

  // onActivated: called when <keep-alive> reactivates this component (navigation back).
  // Scroll to bottom to show any content that accumulated while away.
  onActivated(() => {
    userScrollLocked = false
    userScrolledUp.value = false
    nextTick(() => scrollToBottom(true))
  })

  // onUnmounted: only fires on TRUE destruction (not navigation with <keep-alive>).
  // Abort the fetch stream since the component is being permanently removed.
  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
    if (scrollRafId) { cancelAnimationFrame(scrollRafId); scrollRafId = null }
    if (rafScrollId) { cancelAnimationFrame(rafScrollId); rafScrollId = null }
  })

  return {
    state,
    content,
    reasoning,
    error,
    showReasoning,
    isStreaming,
    isThinking,
    isConnecting,
    isQueued,
    isCompleted,
    hasError,
    hasContent,
    hasReasoning,
    isLoading,
    isPaused: computed(() => pausedRef.value),
    waitingPhase,
    queuePosition,
    canRetry,
    retryCount,
    userScrolledUp,
    generate,
    generateWithProvider,
    stop,
    pause,
    resume,
    reset,
    retry,
    toggleReasoning,
    restore,
    setShowReasoning,
    scrollToBottom,
    handleUserScroll
  }
}

export function useAIStreamOnce(
  taskId: string,
  options?: Omit<UseAIStreamOptions, 'taskId'>
): AIStreamResult {
  return useAIStream({
    taskId,
    ...options
  })
}
