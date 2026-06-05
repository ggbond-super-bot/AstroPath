<template>
  <div class="page-root">
    <div class="bg-grid" />
    <div class="bg-glow" />

    <section class="hero-full">
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="tag-dot" />
            <span>AI Configuration</span>
          </div>
          <h1 class="hero-title">
            <span class="title-line title-line-1">AI</span>
            <span class="title-line title-line-2">配置管理</span>
          </h1>
          <p class="hero-desc">
            管理 AI 供应商连接配置，支持多供应商切换与连接测试
          </p>
        </div>
        <div class="hero-stats">
          <div class="stat-chip stat-chip--primary">
            <span class="stat-value">{{ providers.length }}</span>
            <span class="stat-label">已配置</span>
          </div>
          <div class="stat-chip stat-chip--success">
            <span class="stat-value">{{ connectedCount }}</span>
            <span class="stat-label">已连接</span>
          </div>
          <div class="stat-chip stat-chip--danger">
            <span class="stat-value">{{ errorCount }}</span>
            <span class="stat-label">异常</span>
          </div>
        </div>
      </div>
    </section>

    <main class="main-content">
      <section class="config-section">
        <div class="section-header">
          <div class="section-header-text">
            <h2 class="section-title">
              <span class="title-num">01</span>
              AI 供应商配置
            </h2>
            <p class="section-subtitle">
              配置和管理您的 AI 模型接入点
            </p>
          </div>
          <button
            class="btn btn-primary btn-sm"
            @click="testAllConnections"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
            测试全部连接
          </button>
        </div>

        <!-- 原 SECURITY NOTICE 内容已暂存保留
        <div class="security-notice">
          <div class="notice-glass">
            <div class="notice-noise" />
            <div class="notice-accent" />
            <div class="notice-icon-wrap">
              <svg
                class="notice-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
            </div>
            <div class="notice-content">
              <span class="notice-label">SECURITY NOTICE</span>
              <span class="notice-divider" />
              <span class="notice-text">
                本系统预置开发者 API Key（<span class="notice-model">{{ zhipuModelName }}</span>）仅供演示使用。<span class="notice-emphasis">严禁提取、传播或用于任何其他目的</span>，违者将承担相应法律责任。
              </span>
            </div>
          </div>
        </div>
        -->

        <div class="security-notice">
          <div class="notice-glass">
            <div class="notice-noise" />
            <div class="notice-accent" />
            <div class="notice-icon-wrap">
              <svg
                class="notice-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
            </div>
            <div class="notice-content">
              <span class="notice-label">USAGE NOTICE</span>
              <span class="notice-divider" />
              <span class="notice-text">
                使用 AI 功能，需先免费申请一个智谱 API Key 😊
                申请地址：<a
                  href="https://www.bigmodel.cn/apikey/platform"
                  target="_blank"
                  rel="noopener"
                >https://www.bigmodel.cn/apikey/platform</a>
              </span>
            </div>
          </div>
        </div>

        <div class="table-glass">
          <table class="data-table">
            <thead>
              <tr>
                <th><span class="th-inner">供应商名称</span></th>
                <th><span class="th-inner">类型</span></th>
                <th><span class="th-inner">Base URL</span></th>
                <th><span class="th-inner">API Key</span></th>
                <th><span class="th-inner">模型名称</span></th>
                <th><span class="th-inner">状态</span></th>
                <th><span class="th-inner">操作</span></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(provider, index) in providers"
                :key="provider.id"
                class="provider-row"
              >
                <td class="cell-name">
                  {{ provider.name }}
                </td>
                <td>
                  <span class="badge badge-type">{{ provider.type }}</span>
                </td>
                <td
                  class="cell-mono"
                  :title="provider.baseUrl"
                >
                  {{ provider.baseUrl }}
                </td>
                <td class="cell-key">
                  {{ provider.apiKey ? '••••••••' : '未设置' }}
                </td>
                <td
                  class="cell-mono"
                  :title="provider.model"
                >
                  {{ provider.model }}
                </td>
                <td>
                  <span
                    v-if="provider.status === 'testing'"
                    class="status-badge status-testing"
                  ><i class="pulse-dot" /><span>测试中</span></span>
                  <span
                    v-else-if="provider.status === 'connected'"
                    class="status-badge status-connected"
                  ><i class="status-dot" /><span>已连接</span></span>
                  <span
                    v-else-if="provider.status === 'error'"
                    class="status-badge status-error"
                  ><i class="status-dot" /><span>连接失败</span></span>
                  <span
                    v-else
                    class="status-badge status-untested"
                  ><i class="status-dot status-dot--muted" /><span>未测试</span></span>
                </td>
                <td class="cell-actions">
                  <button
                    class="btn-action btn-edit"
                    @click="editProvider(index)"
                  >
                    编辑
                  </button>
                  <button
                    class="btn-action btn-delete"
                    @click="removeProvider(index)"
                  >
                    删除
                  </button>
                  <button
                    class="btn-action btn-test"
                    :disabled="provider.status === 'testing'"
                    @click="testConnection(index)"
                  >
                    {{ provider.status === 'testing' ? '测试中...' : '测试' }}
                  </button>
                </td>
              </tr>
              <tr v-if="providers.length === 0">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon-wrap">
                      <svg
                        class="empty-icon"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          stroke-width="1.5"
                          opacity=".2"
                        />
                        <path
                          d="M24 14v16m0 0l-6-6m6 6l6-6"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          opacity=".3"
                        />
                      </svg>
                    </div>
                    <p class="empty-title">
                      暂无供应商配置
                    </p>
                    <p class="empty-desc">
                      请在下方添加您的第一个 AI 供应商配置
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="section-divider" />

      <section class="config-section form-section form-comfortable">
        <div class="section-header">
          <div class="section-header-text">
            <h2 class="section-title">
              <span class="title-num">02</span>
              自定义配置
            </h2>
            <p class="section-subtitle">
              添加新的 AI 供应商
            </p>
          </div>
        </div>

        <form
          class="provider-form"
          @submit.prevent="addProvider"
        >
          <div class="form-row">
            <div class="form-field">
              <label
                class="form-label"
                for="prov-name"
              >供应商名称</label>
              <input
                id="prov-name"
                v-model="newProvider.name"
                type="text"
                class="form-input"
                placeholder="如：OpenAI、Anthropic"
              >
            </div>
            <div class="form-field">
              <label
                class="form-label"
                for="prov-type"
              >类型</label>
              <CustomSelect
                id="prov-type"
                v-model="newProvider.type"
                :options="typeOptions"
                placeholder="选择类型"
              />
            </div>
          </div>
          <div class="form-field">
            <label
              class="form-label"
              for="prov-url"
            >Base URL</label>
            <input
              id="prov-url"
              v-model="newProvider.baseUrl"
              type="text"
              class="form-input"
              placeholder="https://api.openai.com/v1"
            >
          </div>
          <div class="form-field">
            <label
              class="form-label"
              for="prov-key"
            >API Key</label>
            <input
              id="prov-key"
              v-model="newProvider.apiKey"
              type="password"
              class="form-input"
              placeholder="sk-..."
            >
          </div>
          <div class="form-field">
            <label
              class="form-label"
              for="prov-model"
            >模型名称</label>
            <input
              id="prov-model"
              v-model="newProvider.model"
              type="text"
              class="form-input"
              placeholder="gpt-4, glm-4-flash 等"
            >
          </div>
          <div class="form-footer">
            <button
              type="submit"
              class="btn btn-primary btn-submit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M12 5v14m-7-7h14" /></svg>
              保存配置
            </button>
          </div>
        </form>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toast.visible"
          class="toast-notification"
          :class="'toast-' + toast.type"
        >
          <span class="toast-icon">{{ toastIcons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <div class="toast-timer" />
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editVisible"
          class="modal-backdrop"
          @click.self="editVisible = false"
        >
          <div
            class="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-heading"
          >
            <header class="modal-head">
              <h3
                id="modal-heading"
                class="modal-heading"
              >
                编辑供应商
              </h3>
              <button
                class="btn-close"
                aria-label="关闭"
                @click="editVisible = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>
            <div class="modal-body">
              <form @submit.prevent="saveEdit">
                <div class="form-field">
                  <label
                    class="form-label"
                    for="edit-name"
                  >供应商名称</label>
                  <input
                    id="edit-name"
                    v-model="editingProvider.name"
                    type="text"
                    class="form-input"
                  >
                </div>
                <div class="form-field">
                  <label
                    class="form-label"
                    for="edit-type"
                  >类型</label>
                  <CustomSelect
                    id="edit-type"
                    v-model="editingProvider.type"
                    :options="typeOptions"
                    placeholder="选择类型"
                  />
                </div>
                <div class="form-field">
                  <label
                    class="form-label"
                    for="edit-url"
                  >Base URL</label>
                  <input
                    id="edit-url"
                    v-model="editingProvider.baseUrl"
                    type="text"
                    class="form-input"
                  >
                </div>
                <div class="form-field">
                  <label
                    class="form-label"
                    for="edit-key"
                  >API Key</label>
                  <input
                    id="edit-key"
                    v-model="editingProvider.apiKey"
                    type="password"
                    class="form-input"
                  >
                </div>
                <div class="form-field">
                  <label
                    class="form-label"
                    for="edit-model"
                  >模型名称</label>
                  <input
                    id="edit-model"
                    v-model="editingProvider.model"
                    type="text"
                    class="form-input"
                  >
                </div>
              </form>
            </div>
            <footer class="modal-foot">
              <button
                class="btn btn-cancel"
                @click="editVisible = false"
              >
                取消
              </button>
              <button
                class="btn btn-primary"
                @click="saveEdit"
              >
                保存更改
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { testProviderConnection } from '@/utils/ai-api'
import { ZHIPU_MODEL_ID, DEFAULT_PROVIDER } from '@/composables/useAIConfig'

const zhipuModelName = computed(() =>
  '智谱 ' + ZHIPU_MODEL_ID.split('-').map((p, i) => i === 0 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)).join('-')
)

const providers = ref([])
const newProvider = ref({
  name: '',
  type: '',
  baseUrl: '',
  apiKey: '',
  model: ''
})
const editVisible = ref(false)
const editingProvider = ref({})
const editingIndex = ref(-1)

const typeOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'domestic', label: '国内供应商' },
  { value: 'other', label: '其他' }
]

const connectedCount = computed(() =>
  providers.value.filter(p => p.status === 'connected').length
)

const errorCount = computed(() =>
  providers.value.filter(p => p.status === 'error').length
)

const toast = reactive({
  visible: false,
  message: '',
  type: 'info'
})

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ'
}

let toastTimer = null

function showToast(message, type = 'info', duration = 3000) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.visible = true
  toastTimer = setTimeout(() => {
    toast.visible = false
  }, duration)
}

onMounted(() => {
  loadProviders()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

const loadProviders = () => {
  const saved = localStorage.getItem('ai_providers')
  if (saved) {
    providers.value = JSON.parse(saved)
  } else {
    providers.value = []
    addZhipuPreset()
  }
}

const saveProviders = () => {
  localStorage.setItem('ai_providers', JSON.stringify(providers.value))
}

const addProvider = () => {
  if (!newProvider.value.name || !newProvider.value.baseUrl || !newProvider.value.apiKey) {
    showToast('请填写完整信息', 'warning')
    return
  }
  providers.value.push({
    ...newProvider.value,
    status: 'untested',
    id: Date.now()
  })
  saveProviders()
  showToast('配置已保存', 'success')
  newProvider.value = { name: '', type: '', baseUrl: '', apiKey: '', model: '' }
}

const addZhipuPreset = () => {
  const existing = providers.value.find(p => p.name === zhipuModelName.value + '（推荐）')
  if (existing) {
    showToast('智谱配置已存在', 'info')
    return
  }
  providers.value.push({
    name: zhipuModelName.value + '（推荐）',
    type: 'domestic',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: DEFAULT_PROVIDER.apiKey || '',
    model: ZHIPU_MODEL_ID,
    status: 'untested',
    id: Date.now(),
    isDefault: true,
    supportsThinking: true
  })
  saveProviders()
  showToast('已添加' + zhipuModelName.value + '配置（支持思考模式），请点击"测试"验证连接', 'success')
}

const removeProvider = (index) => {
  providers.value.splice(index, 1)
  saveProviders()
  showToast('已删除', 'success')
}

const testConnection = async (index) => {
  const provider = providers.value[index]
  provider.status = 'testing'
  saveProviders()

  try {
    const result = await testProviderConnection(provider.id)
    if (result && result.success) {
      provider.status = 'connected'
      showToast(`${provider.name} 连接成功`, 'success')
    } else {
      provider.status = 'error'
      const errMsg = result?.error || '未知错误'
      showToast(`${provider.name} 连接失败: ${errMsg}`, 'error')
    }
  } catch (err) {
    provider.status = 'error'
    showToast(`${provider.name} 连接失败: ${err.message}`, 'error')
  }
  saveProviders()
}

const testAllConnections = () => {
  providers.value.forEach((_, index) => testConnection(index))
}

const editProvider = (index) => {
  editingIndex.value = index
  editingProvider.value = { ...providers.value[index] }
  editVisible.value = true
}

const saveEdit = () => {
  providers.value[editingIndex.value] = { ...editingProvider.value }
  saveProviders()
  editVisible.value = false
  showToast('配置已更新', 'success')
}
</script>

<script>
import { h, Transition } from 'vue'

function ChevronIcon(cls) {
  return h('svg', {
    class: cls,
    width: 12,
    height: 12,
    viewBox: '0 0 12 12',
    fill: 'none'
  }, [
    h('path', {
      d: 'M3 5L6 8L9 5',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    })
  ])
}

export default {
  components: {
    CustomSelect: {
      props: {
        modelValue: { type: [String, Number], default: '' },
        options: { type: Array, required: true },
        placeholder: { type: String, default: '请选择' },
        id: { type: String, default: '' }
      },
      emits: ['update:modelValue'],
      data() {
        return { open: false }
      },
      computed: {
        selectedLabel() {
          const opt = this.options.find(o => o.value === this.modelValue)
          return opt ? opt.label : ''
        }
      },
      mounted() {
        document.addEventListener('click', this.closeOnClickOutside)
      },
      beforeUnmount() {
        document.removeEventListener('click', this.closeOnClickOutside)
      },
      methods: {
        toggle() {
          this.open = !this.open
        },
        select(option) {
          this.$emit('update:modelValue', option.value)
          this.open = false
        },
        closeOnClickOutside(e) {
          if (this.open && !this.$el.contains(e.target)) {
            this.open = false
          }
        }
      },
      render() {
        const isActive = (val) => val === this.modelValue
        return h('div', {
          id: this.id || undefined,
          role: 'combobox',
          'aria-labelledby': this.id ? undefined : undefined,
          class: ['custom-select', { 'custom-select--open': this.open }]
        }, [
          h('button', {
            type: 'button',
            class: 'custom-select-trigger',
            onClick: (e) => { e.preventDefault(); this.toggle() },
            'aria-expanded': this.open
          }, [
            h('span', {
              class: ['custom-select-value', { 'custom-select-placeholder': !this.modelValue }]
            }, this.selectedLabel || this.placeholder),
            ChevronIcon(['custom-select-arrow', { 'custom-select-arrow--rotate': this.open }])
          ]),
          h(Transition, { name: 'select-dropdown' }, () => {
            if (!this.open) return null
            return h('ul', {
              class: 'custom-select-dropdown',
              role: 'listbox'
            }, this.options.map(opt =>
              h('li', {
                key: opt.value,
                class: ['custom-select-option', { 'custom-select-option--active': isActive(opt.value) }],
                role: 'option',
                'aria-selected': isActive(opt.value),
                onClick: () => this.select(opt)
              }, opt.label)
            ))
          })
        ])
      }
    }
  }
}
</script>

<style scoped>
.page-root {
  width: 100%;
  min-height: 100vh;
  background: #F8FAFC;
  color: #0F172A;
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(217, 119, 6, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(217, 119, 6, 0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(217, 119, 6, 0.07), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(241, 245, 249, 0.8), transparent);
  pointer-events: none;
  z-index: 0;
}

.hero-full {
  position: relative;
  z-index: 1;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  padding-top: 56px;
  padding-bottom: 48px;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  background: #FFFBEB;
  border: 1px solid rgba(217, 119, 6, 0.18);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #B45309;
  margin-bottom: 28px;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D97706;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.hero-title {
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -1.5px;
  line-height: 1.08;
  margin: 0 0 16px 0;
  display: flex;
  flex-direction: column;
}

.title-line-1 {
  color: rgba(15, 23, 42, 0.3);
  font-weight: 300;
  font-size: 0.55em;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.title-line-2 {
  display: block;
}

.hero-desc {
  font-size: 15px;
  color: #64748B;
  line-height: 1.6;
  margin: 0;
  max-width: 420px;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 22px;
  background: #FFFFFF;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 14px;
  min-width: 76px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03), 0 4px 12px rgba(15, 23, 42, 0.03);
}

.stat-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.8), transparent);
  pointer-events: none;
}

.stat-chip:hover {
  border-color: rgba(15, 23, 42, 0.14);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(15, 23, 42, 0.06);
}

.stat-chip--primary:hover { box-shadow: 0 4px 8px rgba(217, 119, 6, 0.1), 0 12px 28px rgba(217, 119, 6, 0.08); }
.stat-chip--success:hover { box-shadow: 0 4px 8px rgba(5, 150, 105, 0.08), 0 12px 28px rgba(5, 150, 105, 0.06); }
.stat-chip--danger:hover { box-shadow: 0 4px 8px rgba(220, 38, 38, 0.08), 0 12px 28px rgba(220, 38, 38, 0.06); }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.stat-chip--primary .stat-value { color: #D97706; }
.stat-chip--success .stat-value { color: #059669; }
.stat-chip--danger .stat-value { color: #DC2626; }

.stat-label {
  font-size: 10px;
  font-weight: 500;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.main-content {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
  padding-top: 44px;
  padding-bottom: 80px;
}

.config-section {
  margin-bottom: 0;
}

.table-section {
  width: 100%;
}

.form-comfortable {
  max-width: 720px;
}

.form-section {
  padding-top: 40px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-header-text {
  min-width: 0;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 6px 0;
  line-height: 1.3;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title-num {
  font-size: 11px;
  font-weight: 700;
  color: #D97706;
  letter-spacing: 1.5px;
  font-variant-numeric: tabular-nums;
}

.section-subtitle {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
  line-height: 1.5;
  margin-left: 23px;
}

.table-glass {
  background: #FFFFFF;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;
  overflow: auto;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 8px 32px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.data-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: #F8FAFC;
}

.data-table th {
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  text-align: left;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  white-space: nowrap;
}

.th-inner {
  display: block;
}

.data-table td {
  padding: 16px 20px;
  color: #334155;
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
  vertical-align: middle;
  transition: all 0.2s ease;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.provider-row {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.provider-row:hover {
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.1) 0 3px, rgba(217, 119, 6, 0.02) 3px);
}

.provider-row:hover td {
  color: #0F172A;
}

.cell-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.cell-name {
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0F172A;
}

.cell-mono {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #64748B;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  font-size: 11.5px;
  letter-spacing: -0.2px;
}

.cell-key {
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  font-size: 11.5px;
  color: #CBD5E1;
  letter-spacing: 1.5px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--muted {
  background: #CBD5E1;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #D97706;
  flex-shrink: 0;
  animation: pulse-ring 1.4s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(217, 119, 6, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
}

.status-testing {
  background: #FFFBEB;
  color: #B45309;
  border: 1px solid rgba(217, 119, 6, 0.15);
}

.status-testing .status-dot { background: #D97706; }

.status-connected {
  background: #ECFDF5;
  color: #059669;
  border: 1px solid rgba(5, 150, 105, 0.12);
}

.status-connected .status-dot { background: #059669; }

.status-error {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.status-error .status-dot { background: #DC2626; }

.status-untested {
  background: #F8FAFC;
  color: #94A3B8;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: 2px solid #D97706;
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #D97706, #B45309);
  color: #FFFFFF;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px 22px;
  min-height: 40px;
  font-size: 13px;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 3px rgba(217, 119, 6, 0.25), 0 4px 12px rgba(217, 119, 6, 0.15);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35), 0 8px 20px rgba(217, 119, 6, 0.2);
  filter: brightness(1.06);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit {
  padding: 12px 28px;
  font-size: 14px;
  border-radius: 10px;
}

.btn-cancel {
  background: #FFFFFF;
  color: #64748B;
  font-weight: 500;
  border-radius: 10px;
  padding: 10px 22px;
  min-height: 40px;
  font-size: 13px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.btn-cancel:hover {
  border-color: rgba(15, 23, 42, 0.2);
  color: #334155;
  background: #F8FAFC;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.06);
}

.btn-action {
  background: transparent;
  font-weight: 500;
  border-radius: 5px;
  padding: 4px 8px;
  min-height: 24px;
  font-size: 11px;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.btn-edit {
  color: #64748B;
}
.btn-edit:hover {
  color: #D97706;
  background: #FFFBEB;
  border-color: rgba(217, 119, 6, 0.15);
}

.btn-delete {
  color: #64748B;
}
.btn-delete:hover {
  color: #DC2626;
  background: #FEF2F2;
  border-color: rgba(220, 38, 38, 0.12);
}

.btn-test {
  color: #FFFFFF;
  background: linear-gradient(135deg, #D97706, #B45309);
  border-color: transparent;
  box-shadow: 0 1px 3px rgba(217, 119, 6, 0.2);
}
.btn-test:hover:not(:disabled) {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3), 0 6px 16px rgba(217, 119, 6, 0.15);
}

.btn-sm {
  padding: 8px 18px;
  min-height: 36px;
  font-size: 12px;
  border-radius: 10px;
}

.btn-xs {
  padding: 5px 12px;
  min-height: 30px;
  font-size: 11px;
  border-radius: 8px;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #FFFFFF;
  color: #94A3B8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-close:hover {
  background: #FEF2F2;
  border-color: rgba(220, 38, 38, 0.2);
  color: #DC2626;
  transform: rotate(90deg);
}

.security-notice {
  margin-top: 16px;
}

.notice-glass {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 20px;
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}

.notice-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  border-radius: inherit;
}

.notice-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.notice-accent {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: linear-gradient(180deg, #F59E0B, #D97706 50%, #B45309);
  border-radius: 2px;
  box-shadow:
    0 0 8px rgba(217, 119, 6, 0.18),
    0 0 24px rgba(217, 119, 6, 0.06);
  animation: accent-pulse 3s ease-in-out infinite;
}

@keyframes accent-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(217, 119, 6, 0.18), 0 0 24px rgba(217, 119, 6, 0.06); }
  50% { box-shadow: 0 0 14px rgba(217, 119, 6, 0.3), 0 0 36px rgba(217, 119, 6, 0.12); }
}

.notice-icon-wrap {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 8px;
  position: relative;
}

.notice-icon {
  width: 16px;
  height: 16px;
  color: #D97706;
}

.notice-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.notice-label {
  font-family: var(--font-family-mono), 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #92400E;
  white-space: nowrap;
  opacity: 0.85;
}

.notice-divider {
  width: 1px;
  height: 14px;
  background: rgba(217, 119, 6, 0.15);
  flex-shrink: 0;
  border-radius: 1px;
}

.notice-text {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-model {
  font-family: var(--font-family-mono), 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #B45309;
  padding: 0 5px;
  background: rgba(217, 119, 6, 0.07);
  border: 1px solid rgba(217, 119, 6, 0.1);
  border-radius: 3px;
}

.notice-emphasis {
  color: #DC2626;
  font-weight: 600;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.08), transparent);
  margin: 40px 0;
}

.provider-form {
  max-width: 520px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #FFFFFF;
  color: #0F172A;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 46px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.form-input:focus {
  outline: none;
  border-color: #D97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1), 0 0 20px rgba(217, 119, 6, 0.06);
  background: #FFFFFF;
}

.form-input::placeholder {
  color: #CBD5E1;
}

.form-footer {
  margin-top: 28px;
  display: flex;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F8FAFC;
  border: 1px solid rgba(15, 23, 42, 0.06);
  margin-bottom: 20px;
}

.empty-icon {
  width: 28px;
  height: 28px;
  color: #CBD5E1;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #64748B;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
  max-width: 300px;
}

.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  pointer-events: auto;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.08),
    0 1px 3px rgba(15, 23, 42, 0.04);
  max-width: 360px;
}

.toast-notification::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 2px;
  background: currentColor;
  opacity: 0.25;
  border-radius: 1px;
  animation: toast-progress 3s linear forwards;
}

@keyframes toast-progress {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-success {
  background: #F0FDF4;
  color: #166534;
  border-color: rgba(22, 101, 52, 0.12);
}

.toast-error {
  background: #FEF2F2;
  color: #991B1B;
  border-color: rgba(153, 27, 27, 0.12);
}

.toast-warning {
  background: #FFFBEB;
  color: #92400E;
  border-color: rgba(146, 64, 14, 0.12);
}

.toast-info {
  background: #F8FAFC;
  color: #334155;
  border-color: rgba(51, 65, 85, 0.1);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #166534;
  color: #FFFFFF;
}

.toast-error .toast-icon {
  background: #991B1B;
  color: #FFFFFF;
}

.toast-warning .toast-icon {
  background: #92400E;
  color: #FFFFFF;
}

.toast-info .toast-icon {
  background: #334155;
  color: #FFFFFF;
}

.toast-message {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-timer {
  display: none;
}

.toast-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: toast-out 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(8px) scale(0.97); }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-enter-active {
  animation: modal-overlay-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
  animation: modal-overlay-out 0.2s ease;
}

@keyframes modal-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-overlay-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.modal-panel {
  background: #FFFFFF;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow:
    0 24px 64px rgba(15, 23, 42, 0.15),
    0 0 1px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  max-width: 540px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-panel {
  animation: panel-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.modal-heading {
  font-size: 17px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.3px;
}

.modal-body {
  padding: 28px;
}

.modal-body .form-field {
  margin-bottom: 20px;
}

.modal-body .form-field:last-child {
  margin-bottom: 0;
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

:deep(.custom-select) {
  position: relative;
  width: 100%;
}

:deep(.custom-select-trigger) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #FFFFFF;
  color: #0F172A;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 46px;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

:deep(.custom-select-trigger:focus) {
  outline: none;
  border-color: #D97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}

:deep(.custom-select--open .custom-select-trigger) {
  border-color: #D97706;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}

:deep(.custom-select-value) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.custom-select-placeholder) {
  color: #CBD5E1;
}

:deep(.custom-select-arrow) {
  flex-shrink: 0;
  color: #94A3B8;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.custom-select-arrow--rotate) {
  transform: rotate(180deg);
}

:deep(.custom-select-dropdown) {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  margin-top: -1px;
  background: #FFFFFF;
  border: 1px solid #D97706;
  border-top: none;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12), 0 0 1px rgba(217, 119, 6, 0.15);
  list-style: none;
  padding: 8px 0;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
}

:deep(.custom-select-option) {
  padding: 10px 16px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  list-style: none;
}

:deep(.custom-select-option:hover) {
  background: #FFFBEB;
  color: #0F172A;
}

:deep(.custom-select-option--active) {
  color: #D97706;
  font-weight: 600;
  background: rgba(217, 119, 6, 0.05);
}

.select-dropdown-enter-active {
  animation: dropdown-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.select-dropdown-leave-active {
  animation: dropdown-out 0.15s ease;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes dropdown-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}

@media (min-width: 1600px) {
  .hero-inner {
    max-width: 1400px;
  }

  .main-content {
    max-width: 1400px;
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .hero-inner {
    max-width: 1100px;
  }

  .main-content {
    max-width: 1100px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .hero-inner {
    padding: 40px 0;
  }

  .hero-inner,
  .main-content {
    max-width: 100%;
  }

  .main-content {
    padding-top: 32px;
    padding-bottom: 64px;
  }

  .hero-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .stat-chip {
    flex: 1;
    max-width: 120px;
  }
}

@media (max-width: 767px) {
  .hero-inner {
    padding: 32px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-stats {
    gap: 8px;
    width: 100%;
  }

  .stat-chip {
    padding: 12px 16px;
    min-width: 64px;
  }

  .stat-value {
    font-size: 20px;
  }

  .main-content {
    padding: 0 20px;
    padding-top: 28px;
    padding-bottom: 56px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
  }

  .section-subtitle {
    margin-left: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .data-table th,
  .data-table td {
    padding: 12px 14px;
  }

  .col-actions {
    width: auto;
    min-width: 140px;
  }

  .cell-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .modal-panel {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 14px;
  }

  .modal-head,
  .modal-foot {
    padding: 18px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .security-notice {
    margin-top: 12px;
  }

  .notice-glass {
    padding: 9px 12px 9px 16px;
    gap: 10px;
    border-radius: 8px;
  }

  .notice-accent {
    top: 6px;
    bottom: 6px;
  }

  .notice-icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }

  .notice-icon {
    width: 15px;
    height: 15px;
  }

  .notice-content {
    gap: 6px;
  }

  .notice-label {
    font-size: 9px;
    letter-spacing: 1.2px;
  }

  .notice-divider {
    height: 12px;
  }

  .notice-text {
    font-size: 11.5px;
  }

  .notice-model {
    font-size: 10px;
    padding: 0 4px;
  }

  .section-divider {
    margin: 28px 0;
  }

  .toast-notification {
    left: 16px;
    right: 16px;
    transform: none;
  }

  .toast-message {
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal-panel,
  .toast-notification,
  .provider-row,
  .provider-row::before,
  .stat-chip,
  .tag-dot,
  .pulse-dot,
  .notice-accent {
    animation: none;
    transition: opacity 0.15s ease;
  }

  .select-dropdown-enter-active,
  .select-dropdown-leave-active {
    animation: none;
  }
}
</style>
