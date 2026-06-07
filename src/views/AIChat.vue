<template>
  <div class="ai-chat-page">
    <div
      class="sidebar"
      :class="{ 'is-collapsed': sidebarCollapsed }"
    >
      <div class="sidebar-top">
        <button
          class="sidebar-toggle"
          :title="sidebarCollapsed ? '展开侧栏' : '收起侧栏'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <el-icon :size="18">
            <component :is="sidebarCollapsed ? Expand : Fold" />
          </el-icon>
        </button>
        <button
          v-if="!sidebarCollapsed"
          class="new-chat-btn"
          @click="startNewChat"
        >
          <el-icon :size="16">
            <Plus />
          </el-icon>
          <span>新对话</span>
        </button>
        <button
          v-if="sidebarCollapsed"
          class="new-chat-icon-btn"
          title="新对话"
          @click="startNewChat"
        >
          <el-icon :size="18">
            <Plus />
          </el-icon>
        </button>
      </div>

      <div
        v-show="!sidebarCollapsed"
        class="sidebar-content"
      >
        <div
          v-if="todayConversations.length > 0"
          class="conversation-section"
        >
          <div class="section-label">
            今天
          </div>
          <button
            v-for="conv in todayConversations"
            :key="conv.id"
            class="conv-item"
            :class="{ 'is-active': currentConversationId === conv.id }"
            @click="loadConversation(conv)"
          >
            <span class="conv-text">{{ conv.title || '新对话' }}</span>
          </button>
        </div>

        <div
          v-if="olderConversations.length > 0"
          class="conversation-section"
        >
          <div class="section-label">
            更早
          </div>
          <button
            v-for="conv in olderConversations"
            :key="conv.id"
            class="conv-item"
            :class="{ 'is-active': currentConversationId === conv.id }"
            @click="loadConversation(conv)"
          >
            <span class="conv-text">{{ conv.title || '新对话' }}</span>
          </button>
        </div>

        <div
          v-if="filteredConversations.length === 0 && searchQuery"
          class="empty-hint"
        >
          未找到匹配
        </div>
      </div>

      <div class="sidebar-bottom">
        <div class="agent-section">
          <div
            v-if="!sidebarCollapsed"
            class="section-label"
          >
            智能体
          </div>
          <div
            class="agent-list"
            :class="{ 'is-collapsed': sidebarCollapsed }"
          >
            <el-tooltip
              v-for="agent in agents"
              :key="agent.id"
              :content="`${agent.name} — ${agent.role}`"
              placement="right"
              :show-after="300"
              :hide-after="200"
              effect="light"
              :offset="8"
              popper-class="agent-tooltip"
            >
              <button
                class="agent-row"
                :class="{ 'is-active': currentAgentId === agent.id }"
                @click="selectAgent(agent.id)"
              >
                <span
                  class="agent-icon-mini"
                  :style="{ color: agent.color, '--agent-accent': agent.accent }"
                  v-html="agent.iconSvg"
                />
                <span
                  v-if="!sidebarCollapsed"
                  class="agent-label"
                >{{ agent.name }}</span>
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="main-chat">
      <div class="chat-header">
        <div class="header-left">
          <div class="header-agent-info">
            <div
              class="header-icon"
              :style="{ color: currentAgent?.color, '--agent-accent': currentAgent?.accent }"
              v-html="currentAgent?.iconSvg"
            />
            <div class="header-text">
              <span class="header-name">{{ currentAgent?.name }}</span>
              <span class="header-role">{{ currentAgent?.role }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-tooltip
            content="返回上一页"
            placement="bottom"
            :show-after="300"
          >
            <button
              class="header-back-btn"
              @click="goBack"
            >
              <el-icon :size="14">
                <ArrowLeft />
              </el-icon>
              <span>返回</span>
            </button>
          </el-tooltip>
          <el-dropdown
            v-if="providers.length > 0"
            trigger="click"
            @command="(cmd) => selectedProvider = cmd"
          >
            <button class="model-selector">
              <span class="model-name">{{ currentProviderName }}</span>
              <el-icon :size="12">
                <ArrowDown />
              </el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="p in providers"
                  :key="p.id"
                  :command="p.id"
                  :class="{ 'is-active': selectedProvider === p.id }"
                >
                  <div class="model-option">
                    <span>{{ p.name }}</span><el-icon
                      v-if="selectedProvider === p.id"
                      :size="12"
                    >
                      <Check />
                    </el-icon>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div
        ref="messagesContainer"
        class="chat-messages"
        @scroll="handleUserScroll"
      >
        <div
          v-if="currentMessages.length === 0 && currentAgent"
          class="welcome-screen"
        >
          <div class="welcome-content">
            <div
              class="welcome-icon"
              :style="{ color: currentAgent?.color, '--agent-accent': currentAgent?.accent }"
              v-html="currentAgent?.iconSvg"
            />
            <h2 class="welcome-title">
              {{ currentAgent.name }}
            </h2>
            <p class="welcome-subtitle">
              {{ currentAgent.role }}
            </p>
            <p class="welcome-desc">
              {{ currentAgent.welcome }}
            </p>
            <div class="quick-prompts">
              <div class="prompts-list">
                <button
                  v-for="(prompt, idx) in currentAgent.quickPrompts"
                  :key="idx"
                  class="prompt-chip"
                  @click="useQuickPrompt(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <template v-else>
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            class="message-wrapper"
            :class="{ 'is-user': msg.role === 'user' }"
          >
            <div class="message">
              <div class="message-main">
                <div class="message-body">
                  <div
                    v-if="msg.timestamp"
                    class="message-time"
                  >
                    {{ formatMessageTime(msg.timestamp) }}
                  </div>
                  <div
                    v-if="msg.reasoning"
                    class="reasoning-block"
                    :class="{ 'is-thinking': msg.isThinking && !msg.content }"
                  >
                    <div
                      class="reasoning-header"
                      @click="msg.showReasoning = !msg.showReasoning"
                    >
                      <el-icon :size="12">
                        <Cpu />
                      </el-icon>
                      <span>{{ msg.isThinking && !msg.content ? '正在思考...' : '思考过程' }}</span>
                      <span
                        v-if="msg.isThinking && !msg.content"
                        class="thinking-badge"
                      >进行中</span>
                      <el-icon
                        :size="10"
                        class="reasoning-toggle"
                        :class="{ 'is-expanded': msg.showReasoning }"
                      >
                        <ArrowDown />
                      </el-icon>
                    </div>
                    <div
                      class="reasoning-body"
                      :class="{ 'show': msg.showReasoning }"
                    >
                      {{ msg.reasoning }}
                    </div>
                  </div>
                  <div
                    v-if="!msg.isThinking || !msg.reasoning"
                    class="message-content"
                  >
                    <div class="message-text">
                      <div
                        v-if="isGenerating && msg.role === 'assistant' && isLastMessage(msg) && !msg.content"
                        class="waiting-dots"
                      >
                        <span class="dot" /><span class="dot" /><span class="dot" />
                        <span class="waiting-label">{{ waitingText }}</span>
                      </div>
                      <template v-else>
                        <span v-html="renderMarkdown(msg.content)" />
                        <span
                          v-if="isGenerating && msg.role === 'assistant' && isLastMessage(msg)"
                          class="typing-cursor"
                        />
                      </template>
                    </div>
                  </div>

                  <div
                    v-if="msg.content && !isGenerating"
                    class="message-actions"
                  >
                    <div class="action-group-left">
                      <el-tooltip
                        content="复制"
                        placement="top"
                        :show-after="300"
                      >
                        <button
                          class="action-btn"
                          @click="copyMessage(msg)"
                        >
                          <el-icon :size="13">
                            <DocumentCopy />
                          </el-icon>
                        </button>
                      </el-tooltip>
                      <template v-if="msg.role === 'assistant' && msgActionsConfig.feedback">
                        <el-tooltip
                          content="有帮助"
                          placement="top"
                          :show-after="300"
                        >
                          <button
                            class="action-btn"
                            :class="{ 'is-active': msg.feedback === 'good' }"
                            @click="setFeedback(msg, 'good')"
                          >
                            <el-icon :size="13">
                              <Select />
                            </el-icon>
                          </button>
                        </el-tooltip>
                        <el-tooltip
                          content="无帮助"
                          placement="top"
                          :show-after="300"
                        >
                          <button
                            class="action-btn"
                            :class="{ 'is-active': msg.feedback === 'bad' }"
                            @click="setFeedback(msg, 'bad')"
                          >
                            <el-icon
                              :size="13"
                              style="transform: scaleY(-1)"
                            >
                              <Select />
                            </el-icon>
                          </button>
                        </el-tooltip>
                      </template>
                    </div>
                    <div
                      v-if="msg.role === 'assistant' && isLastMessage(msg)"
                      class="action-group-right"
                    >
                      <button
                        class="action-btn regenerate-btn"
                        @click="regenerateLastResponse()"
                      >
                        <el-icon :size="13">
                          <RefreshRight />
                        </el-icon>
                        <span>重新生成</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div
          v-if="isQueued"
          class="queue-notice"
        >
          <el-icon :size="14">
            <Clock />
          </el-icon>
          <span>请求排队中，前方还有 {{ queuePosition }} 个任务...</span>
        </div>

        <div
          v-if="lastError"
          class="error-banner"
        >
          <div class="error-content">
            <el-icon
              :size="16"
              class="error-icon"
            >
              <WarningFilled />
            </el-icon>
            <div class="error-info">
              <span class="error-title">{{ lastError.title }}</span>
              <span class="error-desc">{{ lastError.message }}</span>
            </div>
          </div>
          <div class="error-actions">
            <el-button
              v-if="canRetry"
              type="primary"
              size="small"
              @click="handleRetry"
            >
              重试 ({{ retryCount }}/{{ maxRetries }})
            </el-button>
            <el-button
              size="small"
              text
              @click="clearError"
            >
              忽略
            </el-button>
          </div>
        </div>
      </div>

      <div class="input-section">
        <div class="input-container">
          <textarea
            v-model="inputMessage"
            class="chat-textarea"
            placeholder="输入您的问题，按 Enter 发送..."
            :disabled="isLoading"
            rows="1"
            aria-label="AI对话输入框"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="input-toolbar">
            <div class="toolbar-left">
              <button
                class="toolbar-btn"
                :class="{ 'is-active': enableThinking }"
                :disabled="isLoading"
                @click="toggleThinking"
              >
                <el-icon :size="14">
                  <Cpu />
                </el-icon><span>深度思考</span>
              </button>
            </div>
            <div class="toolbar-right">
              <button
                v-if="!isLoading"
                class="send-btn"
                :class="{ 'is-active': inputMessage.trim() }"
                :disabled="!inputMessage.trim()"
                @click="sendMessage"
              >
                <el-icon :size="16">
                  <Promotion />
                </el-icon>
              </button>
              <button
                v-else-if="stopButtonVisible"
                class="send-btn is-stop"
                @click="stopGeneration"
              >
                <el-icon :size="16">
                  <VideoPause />
                </el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated, nextTick, watch, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, WarningFilled, Clock,
  Promotion, VideoPause,
  Cpu, ArrowDown, Check, Plus,
  School, DocumentCopy, OfficeBuilding, Stamp,
  Select, RefreshRight, Expand, Fold
} from '@element-plus/icons-vue'
import { buildSystemPrompt } from '@/utils/ai-api'
import { useAIStream } from '@/composables/useAIStream'
import { useActiveStream } from '@/composables/useActiveStream'
import { renderMarkdown } from '@/utils/markdown'
import { DEFAULT_PROVIDER } from '@/composables/useAIConfig'
import { useAssessmentState } from '@/composables/useAssessmentState'

const router = useRouter()
const assessmentState = useAssessmentState()
const {
  isLoading, isGenerating, isQueued, isThinking, isStreaming,
  hasError, queuePosition, canRetry, retryCount, maxRetries,
  waitingPhase, stopButtonVisible, msgActionsConfig, waitingText,
  stopGeneration: stopActiveGeneration, handleRetry: retryActiveStream
} = useActiveStream({ actions: { feedback: false } })

const agents = ref([
  {
    id: 'consultant', name: '留学顾问', role: '整体规划咨询',
    icon: markRaw(School),
    color: '#0F172A', accent: '#D97706',
    iconSvg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="a-ring-out" cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.12"/><circle class="a-ring-in" cx="20" cy="20" r="14.5" stroke="currentColor" stroke-width="1" fill="none" opacity="0.18"/><circle class="a-ring-core" cx="20" cy="20" r="9" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.25"/><line class="a-axis a-axis-v" x1="20" y1="5" x2="20" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line class="a-axis a-axis-h" x1="5" y1="20" x2="12" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="a-star" d="M20 13l1.2 2.4 2.6.4-1.9 1.8.4 2.6L20 19l-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" fill="currentColor" opacity="0.85"/><polygon class="a-needle" points="20,7 21.5,11.5 20,10 18.5,11.5" fill="#D97706"/><circle class="a-dot a-dot-n" cx="20" cy="5" r="1.2" fill="currentColor" opacity="0.5"/><circle class="a-dot a-dot-e" cx="35" cy="20" r="1.2" fill="currentColor" opacity="0.5"/><circle class="a-dot a-dot-s" cx="20" cy="35" r="1.2" fill="currentColor" opacity="0.5"/><circle class="a-dot a-dot-w" cx="5" cy="20" r="1.2" fill="currentColor" opacity="0.5"/><path class="a-arc" d="M9 31c3-3 6-2 9-5" stroke="currentColor" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.3"/></svg>`,
    welcome: '您好！我是您的留学顾问。我可以帮您制定整体的留学规划，包括背景提升、时间安排、申请策略等。请告诉我您的留学目标或任何困惑，我会为您提供专业建议。',
    quickPrompts: ['帮我制定留学时间规划', '我的背景能申请什么学校？', '需要准备哪些申请材料？']
  },
  {
    id: 'essay', name: '文书导师', role: '文书写作指导',
    icon: markRaw(DocumentCopy),
    color: '#D97706', accent: '#FBBF24',
    iconSvg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="a-ring-out" cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.12"/><circle class="a-ring-in" cx="20" cy="20" r="14.5" stroke="currentColor" stroke-width="1" fill="none" opacity="0.18"/><path class="a-quill-body" d="M13 32s2-7 5.5-12S26 10 30 7c1-.7 2.2-.3 2.5.8.3 1-.5 2.2-1.5 3-3 2.8-6 6-9 11-2.5 4-4.5 8.2-4.5 8.2H13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="currentColor" fill-opacity="0.1"/><path class="a-quill-tip" d="M29 8c.8-.8 2-1.2 2.8-.4.8.8.4 2-.4 2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="a-quill-stem" d="M17 23l6-8" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.35"/><circle class="a-ink-drop" cx="30.5" cy="7.5" r="2.2" fill="#D97706" opacity="0.9"/><circle class="a-ink-glow" cx="30.5" cy="7.5" r="3.5" fill="none" stroke="#D97706" stroke-width="0.6" opacity="0.4"/><path class="a-write-line a-write-1" d="M8 28h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/><path class="a-write-line a-write-2" d="M8 32h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/><circle class="a-sparkle a-sparkle-1" cx="10" cy="12" r="0.8" fill="#D97706" opacity="0.6"/><circle class="a-sparkle a-sparkle-2" cx="33" cy="25" r="0.8" fill="#D97706" opacity="0.4"/></svg>`,
    welcome: '您好！我是您的文书导师。我专注于帮助您撰写高质量的申请文书，包括个人陈述、简历、推荐信等。请告诉我您需要什么样的文书帮助，我会为您提供指导和建议。',
    quickPrompts: ['如何写好个人陈述？', '推荐信应该包含什么？', '帮我修改这段文书']
  },
  {
    id: 'selection', name: '选校专家', role: '院校选择建议',
    icon: markRaw(OfficeBuilding),
    color: '#059669', accent: '#34D399',
    iconSvg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="a-ring-out" cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.12"/><circle class="a-ring-in" cx="20" cy="20" r="14.5" stroke="currentColor" stroke-width="1" fill="none" opacity="0.18"/><circle class="a-target-ring a-target-r1" cx="20" cy="20" r="10" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.3"/><circle class="a-target-ring a-target-r2" cx="20" cy="20" r="6" stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.4"/><line class="a-crosshair a-ch-v" x1="20" y1="6" x2="20" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line class="a-crosshair a-ch-h" x1="6" y1="20" x2="13" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line class="a-crosshair a-ch-v2" x1="20" y1="27" x2="20" y2="34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><line class="a-crosshair a-ch-h2" x1="27" y1="20" x2="34" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><circle class="a-bullseye" cx="20" cy="20" r="2.5" fill="#059669" opacity="0.9"/><circle class="a-bullseye-core" cx="20" cy="20" r="1" fill="currentColor" opacity="0.9"/><line class="a-tick a-tick-1" x1="20" y1="7.5" x2="20" y2="9.5" stroke="currentColor" stroke-width="1" opacity="0.4"/><line class="a-tick a-tick-2" x1="20" y1="30.5" x2="20" y2="32.5" stroke="currentColor" stroke-width="1" opacity="0.4"/><line class="a-tick a-tick-3" x1="7.5" y1="20" x2="9.5" y2="20" stroke="currentColor" stroke-width="1" opacity="0.4"/><line class="a-tick a-tick-4" x1="30.5" y1="20" x2="32.5" y2="20" stroke="currentColor" stroke-width="1" opacity="0.4"/></svg>`,
    welcome: '您好！我是您的选校专家。我拥有丰富的院校数据库，可以根据您的背景和需求，为您推荐合适的学校和专业。',
    quickPrompts: ['根据我的背景推荐学校', '这所学校录取难度如何？', '比较这几所学校的优劣']
  },
  {
    id: 'visa', name: '签证助手', role: '签证申请指导',
    icon: markRaw(Stamp),
    color: '#0284C7', accent: '#38BDF8',
    iconSvg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="a-ring-out" cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.12"/><circle class="a-ring-in" cx="20" cy="20" r="14.5" stroke="currentColor" stroke-width="1" fill="none" opacity="0.18"/><path class="a-shield" d="M20 7L10 12v7c0 6 4.5 11.5 10 13.5 5.5-2 10-7.5 10-13.5v-7L20 7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="currentColor" fill-opacity="0.06"/><path class="a-check" d="M15 20l3 3 7-7" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path class="a-doc-line a-doc-1" d="M13 15h14" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" opacity="0.2"/><path class="a-doc-line a-doc-2" d="M13 26h14" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" opacity="0.2"/><circle class="a-seal" cx="28" cy="12" r="3" fill="none" stroke="#0284C7" stroke-width="0.8" opacity="0.5"/><path class="a-seal-star" d="M28 10l.4.8.9.1-.7.6.2.9-.8-.4-.8.4.2-.9.7-.6z" fill="#0284C7" opacity="0.6"/><circle class="a-lock-dot a-lock-1" cx="16" cy="20" r="0.8" fill="currentColor" opacity="0.3"/><circle class="a-lock-dot a-lock-2" cx="24" cy="20" r="0.8" fill="currentColor" opacity="0.3"/></svg>`,
    welcome: '您好！我是您的签证助手。我熟悉各国签证申请流程，可以为您解答关于签证材料、面签准备等方面的问题。',
    quickPrompts: ['签证需要准备哪些材料？', '面签常见问题有哪些？', '签证被拒怎么办？']
  }
])

const currentAgentId = ref('consultant')
const sidebarCollapsed = ref(false)
const currentAgent = computed(() => agents.value.find(a => a.id === currentAgentId.value) || agents.value[0])
const selectedProvider = ref(null)
const inputMessage = ref('')
const messagesContainer = ref(null)
const agentMessages = ref({})
const currentMessages = computed(() => agentMessages.value[currentAgentId.value] || [])
const getCurrentMessages = () => { if (!agentMessages.value[currentAgentId.value]) agentMessages.value[currentAgentId.value] = []; return agentMessages.value[currentAgentId.value] }
const currentConversationId = ref(null)
const lastError = ref(null)
const userData = ref(null)
const enableThinking = ref(true)
const searchQuery = ref('')
const agentStreams = ref({})
const getCurrentStream = () => agentStreams.value[currentAgentId.value]
const setCurrentStream = (stream) => { agentStreams.value[currentAgentId.value] = stream }
let isRestoringState = false
let isFreshEntry = true
const agentSessionMessages = ref({})

const { scrollToBottom, handleUserScroll: handleStreamScroll } = useAIStream({
  taskId: `chat-${currentAgentId.value}`,
  enableThinking: enableThinking.value,
  autoRestore: false, autoScroll: true,
  scrollContainer: () => messagesContainer.value,
  onStateChange: (state) => { if (state === 'error') lastError.value = { title: '请求失败', message: '请检查网络连接或重试' } },
  onQueueChange: (pos) => { /* queue position updated */ }
})

const loadUserData = () => {
  // Use global assessment state
  if (assessmentState.hasData.value) {
    userData.value = assessmentState.form.value
  } else {
    userData.value = null
  }
}

const goBack = () => router.back()

const saveCurrentState = () => {
  if (isRestoringState) return
  const msgs = agentMessages.value[currentAgentId.value] || []
  agentSessionMessages.value[currentAgentId.value] = {
    messages: JSON.parse(JSON.stringify(msgs)),
    currentConversationId: currentConversationId.value,
    savedAt: Date.now()
  }
}

const loadAgentSession = (agentId) => {
  const session = agentSessionMessages.value[agentId]
  if (session && session.messages && session.messages.length > 0) {
    isRestoringState = true
    if (!agentMessages.value[agentId]) agentMessages.value[agentId] = []
    agentMessages.value[agentId] = JSON.parse(JSON.stringify(session.messages))
    currentConversationId.value = session.currentConversationId || null
    isRestoringState = false
    nextTick(() => scrollToBottom(true))
    return true
  }
  return false
}

const clearCurrentState = () => {
  delete agentSessionMessages.value[currentAgentId.value]
}

const clearAllAgentSessions = () => {
  agentSessionMessages.value = {}
}

const conversations = ref([])
const filteredConversations = computed(() => {
  let result = conversations.value
  result = result.filter(c => c.agentId === currentAgentId.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => (c.title && c.title.toLowerCase().includes(q)) || getAgentName(c.agentId).toLowerCase().includes(q))
  }
  return result
})

const todayConversations = computed(() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return filteredConversations.value.filter(c => {
    const d = new Date(c.createdAt)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === t.getTime()
  })
})
const olderConversations = computed(() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return filteredConversations.value.filter(c => {
    const d = new Date(c.createdAt)
    d.setHours(0, 0, 0, 0)
    return d.getTime() < t.getTime()
  })
})

const providers = computed(() => { const s = localStorage.getItem('ai_providers'); return s ? JSON.parse(s) : [DEFAULT_PROVIDER] })
const currentProviderName = computed(() => { const p = providers.value.find(p => p.id === selectedProvider.value); return p ? p.name : '选择模型' })
const getAgentName = (id) => { const a = agents.value.find(a => a.id === id); return a ? a.name : 'AI助手' }

const loadProviders = () => { const s = localStorage.getItem('ai_providers'); if (s) { const p = JSON.parse(s); if (p.length > 0) selectedProvider.value = p[0].id } else { selectedProvider.value = DEFAULT_PROVIDER.id } }

const selectAgent = (id) => {
  if (currentAgentId.value === id) return
  if ((agentMessages.value[currentAgentId.value] || []).length > 0) {
    saveConversation()
    saveCurrentState()
  }
  currentAgentId.value = id
  if (isFreshEntry) {
    if (!agentMessages.value[id]) agentMessages.value[id] = []
    currentConversationId.value = null
    clearCurrentState()
    return
  }
  if (loadAgentSession(id)) {
    return
  }
  if (!agentMessages.value[id]) agentMessages.value[id] = []
  currentConversationId.value = null
}

const toggleThinking = () => { enableThinking.value = !enableThinking.value }
const useQuickPrompt = (prompt) => { inputMessage.value = prompt; sendMessage() }
const autoResize = (e) => { const t = e.target; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 200) + 'px' }
const resetTextareaHeight = () => {
  const textarea = document.querySelector('.chat-textarea')
  if (textarea) { textarea.style.height = 'auto'; textarea.style.height = '' }
}

const pollAndSync = (stream, aiIdx, msgs) => {
  let hasReasoningContent = false
  const pollInterval = setInterval(() => {
    if (stream.content.value) { msgs[aiIdx].content = stream.content.value; msgs[aiIdx].isThinking = false }
    if (enableThinking.value && stream.reasoning.value) {
      if (!hasReasoningContent && stream.reasoning.value.length > 50) { hasReasoningContent = true; msgs[aiIdx].showReasoning = true }
      msgs[aiIdx].reasoning = stream.reasoning.value
    }
    if (stream.content.value && stream.content.value.length > 100 && hasReasoningContent) msgs[aiIdx].showReasoning = false
    if (!stream.isStreaming.value && !stream.isThinking.value) clearInterval(pollInterval)
  }, 100)
  return pollInterval
}

const sendMessage = async () => {
  isFreshEntry = false
  if (!inputMessage.value.trim()) { ElMessage.warning('请输入消息'); return }

  const msgs = getCurrentMessages()
  const now = Date.now()
  const userMsg = { id: now, role: 'user', content: inputMessage.value, timestamp: now }
  msgs.push(userMsg); inputMessage.value = ''; resetTextareaHeight(); clearError(); scrollToBottom(true)

  const aiMsg = { id: now + 1, role: 'assistant', content: '', reasoning: '', showReasoning: false, isThinking: enableThinking.value, timestamp: now + 1 }
  msgs.push(aiMsg); const aiIdx = msgs.length - 1

  try {
    const systemPrompt = buildSystemPrompt(currentAgentId.value, userData.value, enableThinking.value)
    const apiMessages = [{ role: 'system', content: systemPrompt }, ...msgs.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.content }))]

    const stream = useAIStream({ taskId: `chat-${currentAgentId.value}-${now}-${Math.random().toString(36).slice(2, 9)}`, enableThinking: enableThinking.value, autoRestore: false, autoScroll: true, scrollContainer: () => messagesContainer.value })
    setCurrentStream(stream)
    const pollInterval = pollAndSync(stream, aiIdx, msgs)

    try { await stream.generateWithProvider(selectedProvider.value, apiMessages) } finally { clearInterval(pollInterval) }

    if (stream.content.value) msgs[aiIdx].content = stream.content.value
    if (enableThinking.value && stream.reasoning.value) msgs[aiIdx].reasoning = stream.reasoning.value
    msgs[aiIdx].showReasoning = false; msgs[aiIdx].isThinking = false
    saveCurrentState()
  } catch (error) {
    lastError.value = { title: '请求失败', message: error.message || '请检查网络连接或重试' }
    msgs[aiIdx].content = `抱歉，请求失败：${error.message}。`
    // Keep stream reference so retry can reuse it
    setCurrentStream(stream)
  } finally { setCurrentStream(null); saveCurrentState(); nextTick(() => scrollToBottom()) }
}

const isLastMessage = (msg) => { const l = getCurrentMessages(); return l.length > 0 && l[l.length - 1].id === msg.id }

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  if (isToday) {
    return `${hours}:${minutes}`
  } else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  }
}
const copyMessage = async (msg) => {
  try { await navigator.clipboard.writeText(msg.content); ElMessage.success('已复制到剪贴板') }
  catch (_) { const ta = document.createElement('textarea'); ta.value = msg.content; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); ElMessage.success('已复制到剪贴板') }
}
const setFeedback = (msg, type) => {
  if (msg.feedback === type) msg.feedback = null
  else { msg.feedback = type; ElMessage.success(type === 'good' ? '感谢您的反馈' : '我们会继续改进') }
  saveCurrentState()
}
let lastUserMessageForRegen = null
const regenerateLastResponse = async () => {
  const msgs = getCurrentMessages()
  const am = msgs.filter(m => m.role === 'assistant'); if (am.length === 0) return
  const ui = msgs.findLastIndex(m => m.role === 'user'); if (ui < 0) return
  lastUserMessageForRegen = msgs[ui].content; msgs.pop(); saveCurrentState(); inputMessage.value = lastUserMessageForRegen; await sendMessage()
}
const handleUserScroll = () => { if (!messagesContainer.value) return; const stream = getCurrentStream(); if (stream) stream.handleUserScroll(); else handleStreamScroll() }
const clearError = () => { lastError.value = null }
const startNewChat = () => { const msgs = getCurrentMessages(); if (msgs.length > 0) saveConversation(); msgs.length = 0; currentConversationId.value = null; clearCurrentState(); ElMessage.success('已开始新对话') }
const stopGeneration = () => { const stream = getCurrentStream(); if (stream) { stream.stop(); setCurrentStream(null) } stopActiveGeneration(); saveCurrentState() }
const handleRetry = async () => {
  clearError()
  const stream = getCurrentStream()
  if (!stream) return
  const msgs = getCurrentMessages()
  const aiIdx = msgs.length - 1
  // Clear error content and show generating state
  msgs[aiIdx].content = ''
  msgs[aiIdx].reasoning = ''
  msgs[aiIdx].showReasoning = false
  msgs[aiIdx].isThinking = enableThinking.value
  const pollInterval = pollAndSync(stream, aiIdx, msgs)
  try {
    await retryActiveStream()
  } finally {
    clearInterval(pollInterval)
    if (stream.content.value) msgs[aiIdx].content = stream.content.value
    if (enableThinking.value && stream.reasoning.value) msgs[aiIdx].reasoning = stream.reasoning.value
    msgs[aiIdx].showReasoning = false
    msgs[aiIdx].isThinking = false
    setCurrentStream(null)
    saveCurrentState()
  }
}

const saveConversation = () => {
  const msgs = getCurrentMessages()
  if (msgs.length > 0) {
    const ei = conversations.value.findIndex(c => c.id === currentConversationId.value)
    const conv = { id: currentConversationId.value || Date.now(), title: msgs[0].content.substring(0, 30) + '...', createdAt: currentConversationId.value ? getConversationById(currentConversationId.value)?.createdAt || Date.now() : Date.now(), agentId: currentAgentId.value, messages: JSON.parse(JSON.stringify(msgs)) }
    if (ei >= 0) conversations.value[ei] = conv; else conversations.value.unshift(conv)
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
  }
}
const getConversationById = (id) => conversations.value.find(c => c.id === id)
const loadConversation = (conv) => {
  // Save current agent's state before switching
  const currentMsgs = getCurrentMessages()
  if (currentMsgs.length > 0 && currentAgentId.value !== (conv.agentId || 'consultant')) {
    saveConversation()
    saveCurrentState()
  }
  const agentId = conv.agentId || 'consultant'
  if (!agentMessages.value[agentId]) agentMessages.value[agentId] = []
  agentMessages.value[agentId] = conv.messages || []
  currentAgentId.value = agentId
  currentConversationId.value = conv.id || null
  saveCurrentState()
}
const deleteConversation = (cid) => { if (confirm('删除此对话记录？')) { conversations.value = conversations.value.filter(c => c.id !== cid); localStorage.setItem('conversations', JSON.stringify(conversations.value)); if (currentConversationId.value === cid) { const msgs = getCurrentMessages(); msgs.length = 0; currentConversationId.value = null } } }

let saveTimeout = null
const autoSaveConversation = () => { if (saveTimeout) clearTimeout(saveTimeout); saveTimeout = setTimeout(() => { const msgs = getCurrentMessages(); if (msgs.length > 0) saveConversation() }, 2000) }

watch(currentMessages, (nv) => { if (isRestoringState) return; if (nv.length > 0) autoSaveConversation(); if (!isGenerating.value) saveCurrentState() }, { deep: true })
watch(currentAgentId, () => saveCurrentState())

onMounted(() => {
  loadProviders()
  loadUserData()
  const s = localStorage.getItem('conversations')
  if (s) {
    conversations.value = JSON.parse(s)
    conversations.value.forEach((c, i) => {
      if (!c.id) c.id = Date.now() + i
    })
  }
  if (isFreshEntry) {
    clearAllAgentSessions()
    const msgs = getCurrentMessages()
    msgs.length = 0
    currentConversationId.value = null
  } else {
    loadAgentSession(currentAgentId.value)
  }
})
// onDeactivated: called on navigation away (<keep-alive>).
// Save state but do NOT stop the stream — it continues in background.
onDeactivated(() => {
  const msgs = getCurrentMessages()
  if (msgs.length > 0) saveConversation()
  saveCurrentState()
})

// onActivated: called when navigating back (<keep-alive>).
// Scroll to bottom to show content that accumulated while away.
onActivated(() => {
  isFreshEntry = false
  nextTick(() => scrollToBottom(true))
})

// onUnmounted: only fires on TRUE destruction (e.g. cache eviction).
// Stop the stream and clean up.
onUnmounted(() => {
  const msgs = getCurrentMessages()
  if (msgs.length > 0) saveConversation()
  saveCurrentState()
  const stream = getCurrentStream()
  if (stream) stream.stop()
  isFreshEntry = true
})
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
  background: #FFFFFF;
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: #F9FAFB;
  transition: width 0.2s ease, opacity 0.15s ease;
  overflow: hidden;
}
.sidebar.is-collapsed {
  width: 48px;
}
.sidebar-top {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.sidebar.is-collapsed .sidebar-top {
  padding: 8px;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.sidebar-toggle {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.sidebar-toggle:hover { background: #e5e7eb; color: #374151; }
.new-chat-btn {
  flex: 1;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  background: #FFFFFF;
  color: #374151;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.new-chat-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
.new-chat-icon-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.new-chat-icon-btn:hover { background: #e5e7eb; color: #374151; }

.sidebar-content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 0 8px;
  opacity: 1; transition: opacity 0.15s ease;
}
.sidebar.is-collapsed .sidebar-content { opacity: 0; pointer-events: none; }

.conversation-section { margin-bottom: 16px; }
.section-label {
  padding: 16px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
}

.conv-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border: none; border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.12s ease;
  margin-bottom: 1px;
}
.conv-item .conv-text {
  display: block;
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.conv-item:hover { background: #e5e7eb; }
.conv-item.is-active { background: #e5e7eb; }
.conv-item.is-active .conv-text { color: #1f2937; font-weight: 600; }

.empty-hint {
  padding: 24px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.sidebar-bottom {
  margin-top: auto;
  flex-shrink: 0;
  padding: 8px;
  border-top: 1px solid #f3f4f6;
}
.agent-section { margin-bottom: 8px; }
.agent-list {
  display: flex; flex-direction: column; gap: 2px;
}
.agent-list.is-collapsed {
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.agent-row {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 8px 10px;
  border: none; border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
}
.agent-row:hover { background: rgba(15, 23, 42, 0.04); }
.agent-row.is-active { background: rgba(15, 23, 42, 0.06); }
.agent-list.is-collapsed .agent-row {
  width: 36px; height: 36px;
  padding: 7px 0;
  justify-content: center;
  border-radius: 8px;
}
.agent-list.is-collapsed .agent-row:hover {
  background: rgba(15, 23, 42, 0.08);
}
.agent-icon-mini {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.agent-list.is-collapsed .agent-icon-mini {
  width: 28px; height: 28px; border-radius: 8px;
}
.agent-icon-mini :deep(svg) { width: 100%; height: 100%; }

/* ===== Sidebar/Header/Avatar Icon Hover 动画（非欢迎页） ===== */
.agent-icon-mini :deep(.a-needle) { transform-origin: 20px 10px; }
.agent-icon-mini :deep(.a-star) { transform-origin: 20px 16px; }
.agent-icon-mini :deep(.a-ink-drop) { transform-origin: 30.5px 7.5px; }
.agent-icon-mini :deep(.a-bullseye) { transform-origin: 20px 20px; }
.agent-icon-mini :deep(.a-check) { stroke-dasharray: 20; stroke-dashoffset: 20; }

.agent-row:hover .agent-icon-mini :deep(.a-needle) { animation: needleSway 3s ease-in-out infinite; }
@keyframes needleSway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
.agent-row:hover .agent-icon-mini :deep(.a-star) { animation: starPulse 2.5s ease-in-out infinite; }
@keyframes starPulse { 0%, 100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
.agent-row:hover .agent-icon-mini :deep(.a-ink-drop) { animation: inkBob 2.5s ease-in-out infinite; }
@keyframes inkBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }
.agent-row:hover .agent-icon-mini :deep(.a-bullseye) { animation: bullseyePulse 2.5s ease-in-out infinite; }
@keyframes bullseyePulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.08); opacity: 1; } }
.agent-row:hover .agent-icon-mini :deep(.a-check) { animation: checkDraw 3s ease-in-out infinite; }
@keyframes checkDraw { 0%, 80%, 100% { stroke-dashoffset: 20; } 40% { stroke-dashoffset: 0; } }
.agent-row:hover .agent-icon-mini :deep(.a-ring-out) { animation: ringOutPulse 2s ease-in-out infinite; }
@keyframes ringOutPulse { 0%, 100% { opacity: 0.12; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.03); } }
.agent-row:hover .agent-icon-mini :deep(.a-ring-in) { animation: ringInPulse 2s ease-in-out infinite 0.1s; }
@keyframes ringInPulse { 0%, 100% { opacity: 0.18; transform: scale(1); } 50% { opacity: 0.32; transform: scale(1.03); } }
.agent-row:hover .agent-icon-mini :deep(.a-dot) { animation: dotGlow 1.5s ease-in-out infinite; }
.agent-row:hover .agent-icon-mini :deep(.a-dot-e) { animation-delay: 0.12s; }
.agent-row:hover .agent-icon-mini :deep(.a-dot-s) { animation-delay: 0.24s; }
.agent-row:hover .agent-icon-mini :deep(.a-dot-w) { animation-delay: 0.36s; }
@keyframes dotGlow { 0%, 100% { opacity: 0.5; r: 1.2; } 50% { opacity: 1; r: 2; } }
.agent-row:hover .agent-icon-mini :deep(.a-ink-glow) { animation: inkGlowExpand 1.5s ease-in-out infinite; }
@keyframes inkGlowExpand { 0%, 100% { opacity: 0.4; r: 3.5; } 50% { opacity: 0.7; r: 5; } }
.agent-row:hover .agent-icon-mini :deep(.a-sparkle) { animation: sparkleTwinkle 1.2s ease-in-out infinite; }
.agent-row:hover .agent-icon-mini :deep(.a-sparkle-2) { animation-delay: 0.3s; }
@keyframes sparkleTwinkle { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.3); } }
.agent-row:hover .agent-icon-mini :deep(.a-target-ring) { animation: targetRingSpin 2.5s linear infinite; }
.agent-row:hover .agent-icon-mini :deep(.a-target-r2) { animation-duration: 2s; animation-direction: reverse; }
@keyframes targetRingSpin { 0% { stroke-dasharray: 0 63; stroke-dashoffset: 0; } 50% { stroke-dasharray: 32 31; } 100% { stroke-dasharray: 0 63; } }
.agent-row:hover .agent-icon-mini :deep(.a-tick) { animation: tickPop 1.2s ease-in-out infinite; }
.agent-row:hover .agent-icon-mini :deep(.a-tick-2) { animation-delay: 0.15s; }
.agent-row:hover .agent-icon-mini :deep(.a-tick-3) { animation-delay: 0.3s; }
.agent-row:hover .agent-icon-mini :deep(.a-tick-4) { animation-delay: 0.45s; }
@keyframes tickPop { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
.agent-row:hover .agent-icon-mini :deep(.a-shield) { animation: shieldBreathe 2s ease-in-out infinite; }
@keyframes shieldBreathe { 0%, 100% { fill-opacity: 0.06; } 50% { fill-opacity: 0.14; } }
.agent-row:hover .agent-icon-mini :deep(.a-seal) { animation: sealRotate 4s linear infinite; transform-origin: 28px 12px; }
@keyframes sealRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.agent-row:hover .agent-icon-mini :deep(.a-seal-star) { animation: sealStarFlash 1.5s ease-in-out infinite; transform-origin: 28px 11px; }
@keyframes sealStarFlash { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
.agent-row:hover .agent-icon-mini :deep(.a-lock-dot) { animation: lockDotPulse 1.5s ease-in-out infinite; }
.agent-row:hover .agent-icon-mini :deep(.a-lock-2) { animation-delay: 0.4s; }
@keyframes lockDotPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }

/* Header Icon Hover 动画 */
.header-icon :deep(.a-needle) { transform-origin: 20px 10px; }
.header-icon :deep(.a-star) { transform-origin: 20px 16px; }
.header-icon :deep(.a-ink-drop) { transform-origin: 30.5px 7.5px; }
.header-icon :deep(.a-bullseye) { transform-origin: 20px 20px; }
.header-icon :deep(.a-check) { stroke-dasharray: 20; stroke-dashoffset: 20; }

.header-icon:hover :deep(.a-needle) { animation: needleSway 3s ease-in-out infinite; }
.header-icon:hover :deep(.a-star) { animation: starPulse 2.5s ease-in-out infinite; }
.header-icon:hover :deep(.a-ink-drop) { animation: inkBob 2.5s ease-in-out infinite; }
.header-icon:hover :deep(.a-bullseye) { animation: bullseyePulse 2.5s ease-in-out infinite; }
.header-icon:hover :deep(.a-check) { animation: checkDraw 3s ease-in-out infinite; }
.header-icon:hover :deep(.a-ring-out) { animation: ringOutPulse 2s ease-in-out infinite; }
.header-icon:hover :deep(.a-ring-in) { animation: ringInPulse 2s ease-in-out infinite 0.1s; }
.header-icon:hover :deep(.a-dot) { animation: dotGlow 1.5s ease-in-out infinite; }
.header-icon:hover :deep(.a-dot-e) { animation-delay: 0.12s; }
.header-icon:hover :deep(.a-dot-s) { animation-delay: 0.24s; }
.header-icon:hover :deep(.a-dot-w) { animation-delay: 0.36s; }
.header-icon:hover :deep(.a-ink-glow) { animation: inkGlowExpand 1.5s ease-in-out infinite; }
.header-icon:hover :deep(.a-sparkle) { animation: sparkleTwinkle 1.2s ease-in-out infinite; }
.header-icon:hover :deep(.a-sparkle-2) { animation-delay: 0.3s; }
.header-icon:hover :deep(.a-target-ring) { animation: targetRingSpin 2.5s linear infinite; }
.header-icon:hover :deep(.a-target-r2) { animation-duration: 2s; animation-direction: reverse; }
.header-icon:hover :deep(.a-tick) { animation: tickPop 1.2s ease-in-out infinite; }
.header-icon:hover :deep(.a-shield) { animation: shieldBreathe 2s ease-in-out infinite; }
.header-icon:hover :deep(.a-seal) { animation: sealRotate 4s linear infinite; transform-origin: 28px 12px; }
.header-icon:hover :deep(.a-seal-star) { animation: sealStarFlash 1.5s ease-in-out infinite; transform-origin: 28px 11px; }

.agent-label {
  font-size: 13px; font-weight: 500; color: #374151;
}
.agent-row.is-active .agent-label { color: #1f2937; font-weight: 600; }

.main-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  flex-shrink: 0;
  min-height: 56px;
}

.header-left { display: flex; align-items: center; gap: 16px; }
.header-back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.header-back-btn:hover {
  background: #0F172A;
  color: #FFFFFF;
}
.header-agent-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-icon :deep(svg) { width: 100%; height: 100%; }

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.header-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  line-height: 1.2;
}
.header-role {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
  line-height: 1.2;
}

.header-actions { display: flex; align-items: center; gap: 10px; }

.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.model-selector:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}
.model-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.model-option { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 140px; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.welcome-screen {
  min-height: calc(100% - 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 40px;
}

.welcome-content {
  text-align: center;
  max-width: 640px;
  width: 100%;
  animation: welcomeIn 0.5s ease both;
}

@keyframes welcomeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  position: relative;
  animation: welcomeIconIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.welcome-icon :deep(svg) { width: 100%; height: 100%; }

@keyframes welcomeIconIn {
  0% { opacity: 0; transform: scale(0.7) rotate(-8deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* Welcome Icon 常驻自动播放动画 */
.welcome-icon :deep(.a-needle) { transform-origin: 20px 10px; animation: needleSway 3s ease-in-out infinite; }
.welcome-icon :deep(.a-star) { transform-origin: 20px 16px; animation: starPulse 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-ink-drop) { transform-origin: 30.5px 7.5px; animation: inkBob 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-bullseye) { transform-origin: 20px 20px; animation: bullseyePulse 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-check) { stroke-dasharray: 20; stroke-dashoffset: 20; animation: checkDraw 3s ease-in-out infinite; }
.welcome-icon :deep(.a-ring-out) { animation: ringOutPulse 3s ease-in-out infinite; }
.welcome-icon :deep(.a-ring-in) { animation: ringInPulse 3s ease-in-out infinite 0.2s; }
.welcome-icon :deep(.a-ring-core) { animation: ringCorePulse 3.5s ease-in-out infinite 0.4s; }
@keyframes ringCorePulse { 0%, 100% { opacity: 0.25; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.03); } }
.welcome-icon :deep(.a-dot) { animation: dotGlow 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-dot-e) { animation-delay: 0.2s; }
.welcome-icon :deep(.a-dot-s) { animation-delay: 0.4s; }
.welcome-icon :deep(.a-dot-w) { animation-delay: 0.6s; }
.welcome-icon :deep(.a-axis) { animation: axisExtend 3s ease-in-out infinite; }
@keyframes axisExtend { 0%, 100% { opacity: 1; } 50% { opacity: 0.65; } }
.welcome-icon :deep(.a-arc) { animation: arcFlow 3s ease-in-out infinite; stroke-dasharray: 15; stroke-dashoffset: 0; }
@keyframes arcFlow { 0% { stroke-dashoffset: 15; opacity: 0.3; } 50% { opacity: 0.55; } 100% { stroke-dashoffset: 0; opacity: 0.3; } }
.welcome-icon :deep(.a-quill-body) { animation: quillFloat 3s ease-in-out infinite; transform-origin: 13px 32px; }
@keyframes quillFloat { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-2deg); } }
.welcome-icon :deep(.a-ink-glow) { animation: inkGlowExpand 3s ease-in-out infinite; }
.welcome-icon :deep(.a-sparkle) { animation: sparkleTwinkle 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-sparkle-2) { animation-delay: 0.6s; }
.welcome-icon :deep(.a-write-line) { animation: writeFadeIn 3s ease-in-out infinite; }
.welcome-icon :deep(.a-write-2) { animation-delay: 0.5s; }
@keyframes writeFadeIn { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.55; } }
.welcome-icon :deep(.a-target-ring) { animation: targetRingSpin 5s linear infinite; }
.welcome-icon :deep(.a-target-r2) { animation-duration: 4s; animation-direction: reverse; }
.welcome-icon :deep(.a-crosshair) { animation: crosshairPulse 2.5s ease-in-out infinite; }
@keyframes crosshairPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.welcome-icon :deep(.a-tick) { animation: tickPop 2.5s ease-in-out infinite; }
.welcome-icon :deep(.a-tick-2) { animation-delay: 0.4s; }
.welcome-icon :deep(.a-tick-3) { animation-delay: 0.8s; }
.welcome-icon :deep(.a-tick-4) { animation-delay: 1.2s; }
.welcome-icon :deep(.a-shield) { animation: shieldBreathe 3.5s ease-in-out infinite; }
.welcome-icon :deep(.a-seal) { animation: sealRotate 8s linear infinite; transform-origin: 28px 12px; }
.welcome-icon :deep(.a-seal-star) { animation: sealStarFlash 3s ease-in-out infinite; transform-origin: 28px 11px; }
.welcome-icon :deep(.a-doc-line) { animation: docLineGlow 3s ease-in-out infinite; }
@keyframes docLineGlow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.45; } }
.welcome-icon :deep(.a-lock-dot) { animation: lockDotPulse 3s ease-in-out infinite; }
.welcome-icon :deep(.a-lock-2) { animation-delay: 0.8s; }

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #D97706;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.welcome-desc {
  font-size: 15px;
  line-height: 1.7;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.quick-prompts { text-align: center; }

.prompts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.prompt-chip {
  padding: 10px 18px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  animation: chipIn 0.4s ease both;
}
.prompt-chip:nth-child(1) { animation-delay: 0.05s; }
.prompt-chip:nth-child(2) { animation-delay: 0.1s; }
.prompt-chip:nth-child(3) { animation-delay: 0.15s; }

@keyframes chipIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.prompt-chip:hover {
  border-color: #374151;
  color: #374151;
  background: #f9fafb;
}

.message-wrapper {
  margin-bottom: 32px;
  display: flex;
  justify-content: flex-start;
  animation: msgIn 0.3s ease both;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper.is-user { justify-content: flex-end; }

.message { display: flex; max-width: 85%; }
.message-wrapper.is-user .message { flex-direction: row-reverse; }

.message-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0 4px;
  opacity: 0.8;
  transition: opacity 0.15s ease;
  text-align: left;
}

.message-wrapper:hover .message-time {
  opacity: 1;
  color: #6b7280;
}

.message-content {
  background: #F7F7F8;
  border-radius: 12px;
  padding: 14px 18px;
}

.message-wrapper.is-user .message-content {
  background: #374151;
  color: white;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.message-text {
  font-size: 15.5px;
  line-height: 1.75;
  color: #1f2937;
}
.message-wrapper.is-user .message-text { color: #f9fafb; }

.message-text :deep(p) { margin: 0 0 14px 0; }
.message-text :deep(p:last-child) { margin-bottom: 0; }
.message-text :deep(ul), .message-text :deep(ol) { margin: 14px 0; padding-left: 22px; }
.message-text :deep(li) { margin-bottom: 5px; }
.message-text :deep(code) {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-family-mono);
  font-size: 13px;
}
.message-wrapper.is-user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.12);
}

.reasoning-block {
  margin-top: 4px;
  padding: 0 4px 0 12px;
  border-left: 2px solid #e5e7eb;
  max-width: calc(100% - 12px);
  overflow: hidden;
  transition: all 0.2s ease;
}

.reasoning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  user-select: none;
  transition: color 0.12s ease;
}
.reasoning-header:hover { color: #6b7280; }

.thinking-badge {
  padding: 1px 6px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.reasoning-toggle {
  margin-left: auto;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0.6;
}
.reasoning-toggle.is-expanded { transform: rotate(180deg); }

.reasoning-body {
  padding: 8px 0 12px;
  font-size: 12px;
  line-height: 1.7;
  color: #9ca3af;
  white-space: pre-wrap;
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.25s ease, padding 0.2s ease, opacity 0.2s ease;
  opacity: 1;
}

.reasoning-body:not(.show) {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #374151;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

.waiting-dots { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.waiting-dots .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #9ca3af;
  opacity: 0.4;
  animation: dotBounce 1.4s ease-in-out infinite;
}
.waiting-dots .dot:nth-child(1) { animation-delay: 0s; }
.waiting-dots .dot:nth-child(2) { animation-delay: 0.16s; }
.waiting-dots .dot:nth-child(3) { animation-delay: 0.32s; }
.waiting-label { font-size: 12px; color: #9ca3af; margin-left: 4px; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}
.message-wrapper:hover .message-actions { opacity: 1; }
.message-wrapper.is-user .message-actions {
  justify-content: flex-end;
}

.action-group-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-group-right {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 28px;
  height: 28px;
}
.action-btn:hover {
  background: rgba(15, 23, 42, 0.06);
  color: #6b7280;
  transform: translateY(-1px);
}
.action-btn:active {
  transform: translateY(0) scale(0.95);
}
.action-btn.is-active {
  color: #0F172A;
  background: rgba(15, 23, 42, 0.08);
}

.regenerate-btn {
  padding: 6px 10px;
  font-weight: 500;
  color: #6b7280;
}
.regenerate-btn:hover {
  color: #0F172A;
  background: rgba(15, 23, 42, 0.06);
}
.regenerate-btn .el-icon {
  transition: transform 0.3s ease;
}
.regenerate-btn:hover .el-icon {
  transform: rotate(180deg);
}

.queue-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #d97706;
}

.error-banner {
  background: #fef2f2;
  border-top: 1px solid #fecaca;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.error-content { display: flex; align-items: center; gap: 10px; flex: 1; }
.error-icon { color: #dc2626; flex-shrink: 0; }
.error-info { display: flex; flex-direction: column; gap: 2px; }
.error-title { font-size: 13px; font-weight: 600; color: #dc2626; }
.error-desc { font-size: 12px; color: #6b7280; }
.error-actions { display: flex; gap: 8px; flex-shrink: 0; }

.input-section {
  padding: 16px 32px 24px;
}

.input-container {
  background: #FFFFFF;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.input-container:focus-within {
  border-color: #D97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
}

.chat-textarea {
  width: 100%;
  min-height: 20px;
  max-height: 200px;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  color: #1f2937;
  background: transparent;
  font-family: var(--font-family-base);
  padding: 14px 18px;
}
.chat-textarea::placeholder { color: #9ca3af; }
.chat-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
}

.toolbar-left { display: flex; align-items: center; gap: 4px; }
.toolbar-right { display: flex; align-items: center; }

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}
.toolbar-btn:hover:not(:disabled) { background: #f3f4f6; color: #374151; }
.toolbar-btn.is-active {
  background: rgba(217, 119, 6, 0.08);
  color: #D97706;
  border: 1px solid rgba(217, 119, 6, 0.2);
}
.toolbar-btn.is-active:hover:not(:disabled) {
  background: rgba(217, 119, 6, 0.08);
  color: #D97706;
  border-color: rgba(217, 119, 6, 0.2);
}
.toolbar-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transition: all 0.15s ease;
}

.send-btn.is-active {
  background: #374151;
  color: white;
  cursor: pointer;
}

.send-btn.is-active:hover {
  background: #1f2937;
  transform: translateY(-1px);
}

.send-btn.is-stop { background: #dc2626; color: white; cursor: pointer; }
.send-btn.is-stop:hover { background: #b91c1c; }

/* ===== Agent Tooltip 美化 ===== */
:deep(.el-popper.is-light.agent-tooltip) {
  border: none !important;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06) !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
}
:deep(.el-popper.is-light.agent-tooltip .el-tooltip__trigger) {
  width: 100%;
  display: flex;
}
:deep(.el-tooltip__trigger) {
  width: 100%;
  display: flex;
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .chat-messages { padding: 24px 20px; }
  .input-section { padding: 12px 16px 16px; }
  .message { max-width: 92%; }
  .welcome-title { font-size: 22px; }
  .welcome-icon { width: 44px; height: 44px; }
  .prompts-list { flex-direction: column; align-items: stretch; }
  .chat-header { padding: 14px 20px; }
  .input-section { padding: 12px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .agent-icon-mini, .header-icon, .welcome-icon {
    animation: none !important;
    transition: opacity 0.15s ease !important;
  }
  .agent-icon-mini :deep(*), .header-icon :deep(*),
  .welcome-icon :deep(*) {
    animation: none !important;
  }
}
</style>
