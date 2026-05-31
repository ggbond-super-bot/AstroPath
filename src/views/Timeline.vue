<template>
  <div
    class="timeline-page"
    @mousemove="onMouseMove"
  >
    <!-- Noise Texture Overlay -->
    <div class="noise-overlay" />

    <!-- Custom Cursor -->
    <div
      class="cursor-dot"
      :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
    />
    <div
      class="cursor-ring"
      :class="{ expanded: cursorExpanded }"
      :style="{ left: ringX + 'px', top: ringY + 'px' }"
    />

    <!-- ===== Hero: Cinematic Journey Opener ===== -->
    <section
      ref="heroRef"
      class="hero-section"
    >
      <div class="hero-grid-lines" />
      <div class="hero-glow hero-glow-1" />
      <div class="hero-glow hero-glow-2" />
      <div class="container hero-content">
        <div class="hero-label">
          <span class="label-line" /><span class="label-text">TIMELINE PLANNER</span>
        </div>
        <h1 class="hero-title">
          <span class="title-line title-line-1">时间规划</span>
          <span class="title-line title-line-2"><em>与任务管理</em></span>
        </h1>
        <p class="hero-subtitle">
          AI 智能解析背景，为你生成专属留学路线图 — 分阶段追踪每个关键节点
        </p>

        <div class="hero-stats-row">
          <div
            v-for="(stat, idx) in heroStats"
            :key="stat.label"
            class="hero-stat"
            :class="'stat-' + idx"
            :style="{ animationDelay: idx * 0.12 + 's' }"
            @mouseenter="cursorExpanded = true"
            @mouseleave="cursorExpanded = false"
          >
            <div class="stat-number-wrap">
              <span class="stat-number">{{ animatedStats[idx] }}</span>
              <span
                v-if="stat.suffix"
                class="stat-suffix"
              >{{ stat.suffix }}</span>
            </div>
            <span
              v-if="idx < heroStats.length - 1"
              class="stat-divider-v"
            />
            <span class="stat-label-text">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Main Content ===== -->
    <section class="main-section">
      <div class="data-container">
        <!-- Floating Toolbar -->
        <div
          class="toolbar-float"
          :class="{ 'toolbar-scrolled': toolbarScrolled }"
        >
          <div class="toolbar-inner">
            <div class="toolbar-left">
              <div class="view-switcher">
                <button
                  v-for="view in viewOptions"
                  :key="view.value"
                  class="view-btn"
                  :class="{ active: currentView === view.value }"
                  @click="currentView = view.value"
                >
                  {{ view.label }}
                </button>
              </div>
              <select
                id="view-mode"
                v-model="mode"
                name="view-mode"
                class="mode-select"
                @change="handleModeChange"
              >
                <option value="compact">
                  紧凑
                </option>
                <option value="normal">
                  常规
                </option>
                <option value="relaxed">
                  宽松
                </option>
              </select>
            </div>
            <div class="toolbar-right">
              <button
                class="btn-icon"
                title="删除所有任务"
                @click="deleteAllTasks"
                @mouseenter="cursorExpanded = true"
                @mouseleave="cursorExpanded = false"
              >
                <el-icon><Delete /></el-icon>
              </button>
              <button
                class="btn-icon"
                title="重置所有任务"
                @click="resetAllTasks"
                @mouseenter="cursorExpanded = true"
                @mouseleave="cursorExpanded = false"
              >
                <el-icon><RefreshRight /></el-icon>
              </button>
              <button
                class="btn-primary-cta"
                @click="generateSampleTasks"
                @mouseenter="cursorExpanded = true"
                @mouseleave="cursorExpanded = false"
              >
                <el-icon><DocumentAdd /></el-icon> 生成示例任务
              </button>
            </div>
          </div>
        </div>

        <!-- Chart View -->
        <div
          v-if="currentView === 'chart'"
          class="chart-area animate-on-scroll"
        >
          <div class="chart-card-premium">
            <div class="chart-header-bar">
              <h3 class="chart-title-premium">
                <span class="title-dot" /> 时间规划全景图
              </h3>
              <span class="chart-sub-info">{{ milestones.length }} 个阶段 · 实时追踪</span>
            </div>
            <div
              ref="chartRef"
              class="chart-canvas-premium"
            />
          </div>
        </div>

        <!-- Timeline View -->
        <div
          v-else-if="currentView === 'timeline'"
          class="timeline-area animate-on-scroll"
        >
          <div class="timeline-card-premium">
            <div class="timeline-layout-premium">
              <div class="timeline-container-premium">
                <div class="timeline-track">
                  <div
                    class="track-fill"
                    :style="{ height: trackFillHeight + '%' }"
                  />
                </div>
                <div
                  v-for="(milestone, mIdx) in milestones"
                  :key="milestone.id"
                  class="milestone-item-premium"
                  :class="{
                    'is-overdue': isOverdue(milestone.deadline),
                    'is-selected': selectedMilestone?.id === milestone.id,
                    'ms-visible': visibleMilestones.has(milestone.id)
                  }"
                  :data-index="mIdx"
                  @click="selectMilestone(milestone)"
                  @mouseenter="cursorExpanded = true; hoverMilestone = milestone.id"
                  @mouseleave="cursorExpanded = false; hoverMilestone = null"
                >
                  <div class="ms-node">
                    <div class="node-ring" />
                    <div
                      class="node-core"
                      :class="'node-' + milestone.status"
                    />
                  </div>
                  <div
                    class="ms-card"
                    :class="{ 'card-hover': hoverMilestone === milestone.id }"
                  >
                    <div class="ms-card-top">
                      <div class="ms-phase-num">
                        PHASE {{ String(milestone.id).padStart(2, '0') }}
                      </div>
                      <span
                        class="status-pill"
                        :class="'pill-' + milestone.status"
                      >{{ getStatusLabel(milestone.status) }}</span>
                    </div>
                    <h4 class="ms-title">
                      {{ milestone.title }}
                    </h4>
                    <p class="ms-desc">
                      {{ milestone.description }}
                    </p>
                    <div class="ms-meta-row">
                      <span class="ms-date">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        ><rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                        /><line
                          x1="16"
                          y1="2"
                          x2="16"
                          y2="6"
                        /><line
                          x1="8"
                          y1="2"
                          x2="8"
                          y2="6"
                        /><line
                          x1="3"
                          y1="10"
                          x2="21"
                          y2="10"
                        /></svg>
                        {{ formatDate(milestone.deadline) }}
                      </span>
                      <span class="ms-progress-val">{{ getMilestoneProgress(milestone) }}%</span>
                    </div>
                    <div class="ms-progress-track">
                      <div
                        class="ms-progress-bar"
                        :style="{ width: getMilestoneProgress(milestone) + '%' }"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detail Panel -->
              <div
                v-if="selectedMilestone"
                class="detail-panel-premium"
              >
                <div class="dp-header">
                  <div class="dp-phase-badge">
                    PHASE {{ String(selectedMilestone.id).padStart(2, '0') }}
                  </div>
                  <h3 class="dp-title">
                    {{ selectedMilestone.title }}
                  </h3>
                  <span class="dp-date">{{ formatDate(selectedMilestone.deadline) }}</span>
                </div>
                <p class="dp-desc">
                  {{ selectedMilestone.description }}
                </p>

                <div class="dp-tasks-section">
                  <div class="dp-tasks-header">
                    <span class="dp-tasks-count">任务清单 · <strong>{{ selectedMilestone.tasks.filter(t => !t.completed).length }}</strong>/{{ selectedMilestone.tasks.length }} 未完成</span>
                  </div>
                  <ul class="dp-task-list">
                    <li
                      v-for="task in selectedMilestone.tasks"
                      :key="task.id"
                      class="dp-task-item"
                      :class="{ completed: task.completed }"
                    >
                      <label
                        class="dp-checkbox"
                        @mouseenter="cursorExpanded = true"
                        @mouseleave="cursorExpanded = false"
                      >
                        <input
                          type="checkbox"
                          :checked="task.completed"
                          :aria-label="'标记完成: ' + task.title"
                          @change="toggleTask(selectedMilestone.id, task.id)"
                        >
                        <span class="check-box" />
                      </label>
                      <span class="dp-task-name">{{ task.title }}</span>
                      <span
                        v-if="isUrgent(task.deadline) && !task.completed"
                        class="tag-mini tag-danger"
                      >即将到期</span>
                      <span
                        v-else-if="isOverdue(task.deadline) && !task.completed"
                        class="tag-mini tag-danger"
                      >已逾期</span>
                    </li>
                  </ul>
                  <p
                    v-if="selectedMilestone.tasks.length === 0"
                    class="dp-empty"
                  >
                    暂无任务
                  </p>
                </div>

                <div class="dp-actions">
                  <button
                    class="btn-add-task"
                    @click="showAddTaskToMilestone"
                    @mouseenter="cursorExpanded = true"
                    @mouseleave="cursorExpanded = false"
                  >
                    <el-icon><Plus /></el-icon> 添加任务
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-else
                class="empty-state-premium"
              >
                <div class="empty-rings">
                  <div class="ring ring-outer" />
                  <div class="ring ring-inner" />
                </div>
                <p class="empty-main-text">
                  选择一个阶段
                </p>
                <p class="empty-sub-text">
                  点击左侧任意里程碑查看详情与任务管理
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Kanban View -->
        <div
          v-else
          class="kanban-area animate-on-scroll"
        >
          <div class="kanban-toolbar-premium">
            <div class="kt-left">
              <button
                v-if="!showOnlyUpcoming"
                class="btn-filter"
                @click="showUpcomingTasks"
                @mouseenter="cursorExpanded = true"
                @mouseleave="cursorExpanded = false"
              >
                <el-icon><Bell /></el-icon> 即将到期 (7天)
              </button>
              <button
                v-else
                class="btn-filter btn-filter-active"
                @click="showAllTasks"
                @mouseenter="cursorExpanded = true"
                @mouseleave="cursorExpanded = false"
              >
                <el-icon><Back /></el-icon> 显示全部
              </button>
              <span
                v-if="upcomingTasksCount > 0 && !showOnlyUpcoming"
                class="upcoming-badge"
              >{{ upcomingTasksCount }} 个即将到期</span>
            </div>
          </div>
          <div class="kanban-board-premium">
            <div
              v-for="column in columns"
              :key="column.id"
              class="kanban-col-premium"
            >
              <div class="col-header-premium">
                <span
                  class="col-dot"
                  :class="'dot-' + column.id"
                />
                <h4>{{ column.title }}</h4>
                <span class="col-count-premium">{{ getColumnTasks(column.id).length }}</span>
              </div>
              <div class="col-body-premium">
                <div
                  v-for="task in getVisibleTasks(column.id)"
                  :key="task.id"
                  class="task-card-premium"
                  :class="{
                    'tc-urgent': isUrgent(task.deadline),
                    'tc-soon': isSoon(task.deadline),
                    'tc-overdue': isOverdue(task.deadline)
                  }"
                  draggable="true"
                  @dragstart="dragStart(task, column.id)"
                  @drop="drop(task, column.id)"
                  @dragover.prevent
                  @mouseenter="cursorExpanded = true"
                  @mouseleave="cursorExpanded = false"
                >
                  <div
                    class="tc-stripe"
                    :class="'stripe-' + (isOverdue(task.deadline) ? 'danger' : isUrgent(task.deadline) ? 'warning' : 'solid')"
                  />
                  <div class="tc-body">
                    <div class="tc-top">
                      <span class="tc-title">{{ task.title }}</span>
                      <div class="tc-tags">
                        <span
                          v-if="isOverdue(task.deadline)"
                          class="tag-sm tag-sm-danger"
                        >已逾期</span>
                        <span
                          v-else-if="task.reminderEnabled && isSoon(task.deadline)"
                          class="tag-sm tag-sm-warning"
                        >即将到期</span>
                        <span
                          v-else-if="isUrgent(task.deadline)"
                          class="tag-sm tag-sm-warning"
                        >紧急</span>
                        <span
                          v-if="task.reminderEnabled && !isOverdue(task.deadline)"
                          class="tag-sm tag-sm-info"
                        >提醒</span>
                      </div>
                    </div>
                    <div class="tc-meta">
                      <span>{{ getMilestoneTitle(task.milestoneId) }}</span>
                      <span class="meta-sep">·</span>
                      <span>{{ formatDate(task.deadline) }}</span>
                    </div>
                    <div class="tc-actions-row">
                      <button
                        class="tc-action-btn"
                        @click="editTask(task)"
                      >
                        编辑
                      </button>
                      <button
                        class="tc-action-btn tc-action-del"
                        @click="deleteTask(task.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  v-if="getHiddenCount(column.id) > 0"
                  class="expand-btn-premium"
                  @click="toggleColumnExpand(column.id)"
                  @mouseenter="cursorExpanded = true"
                  @mouseleave="cursorExpanded = false"
                >
                  <el-icon><ArrowDown /></el-icon> {{ isColumnExpanded(column.id) ? '收起' : `展开剩余 ${getHiddenCount(column.id)} 个` }}
                </button>
                <button
                  v-else-if="isColumnExpanded(column.id) && getColumnTasks(column.id).length > VISIBLE_TASK_COUNT"
                  class="expand-btn-premium expand-collapse"
                  @click="toggleColumnExpand(column.id)"
                  @mouseenter="cursorExpanded = true"
                  @mouseleave="cursorExpanded = false"
                >
                  <el-icon><ArrowUp /></el-icon> 收起
                </button>
                <button
                  class="add-task-btn-premium"
                  @click="showAddTask(column.id)"
                  @mouseenter="cursorExpanded = true"
                  @mouseleave="cursorExpanded = false"
                >
                  <el-icon><Plus /></el-icon> 添加新任务
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Task Dialog -->
    <Teleport to="body">
      <Transition name="dialog-premium">
        <div
          v-if="taskDialogVisible"
          class="modal-overlay-premium"
          @click.self="taskDialogVisible = false"
        >
          <div
            class="modal-premium"
            @mouseenter="cursorExpanded = true"
            @mouseleave="cursorExpanded = false"
          >
            <div class="modal-header-premium">
              <h3>{{ editingTask ? '编辑任务' : '添加任务' }}</h3>
              <button
                class="modal-close-premium"
                @click="taskDialogVisible = false"
              >
                &times;
              </button>
            </div>
            <div class="modal-body-premium">
              <div class="fg-group">
                <label
                  class="fg-label"
                  for="task-title"
                >任务标题</label>
                <input
                  id="task-title"
                  v-model="taskForm.title"
                  type="text"
                  class="fg-input"
                  placeholder="请输入任务标题"
                >
              </div>
              <div class="fg-group">
                <label
                  class="fg-label"
                  for="task-milestone"
                >所属阶段</label>
                <select
                  id="task-milestone"
                  v-model="taskForm.milestoneId"
                  class="fg-input fg-select"
                >
                  <option
                    v-for="m in milestones"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ m.title }}
                  </option>
                </select>
              </div>
              <div class="fg-group">
                <label
                  class="fg-label"
                  for="task-deadline"
                >截止日期</label>
                <input
                  id="task-deadline"
                  v-model="taskForm.deadline"
                  type="date"
                  class="fg-input"
                >
              </div>
              <div class="fg-group">
                <span
                  id="priority-label"
                  class="fg-label"
                >优先级</span>
                <div
                  class="priority-chips"
                  role="radiogroup"
                  aria-labelledby="priority-label"
                >
                  <button
                    v-for="p in priorityOptions"
                    :key="p.value"
                    class="priority-chip"
                    :class="{ active: taskForm.priority === p.value }"
                    @click="taskForm.priority = p.value"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>
              <div class="fg-group">
                <label class="fg-check-wrap">
                  <input
                    id="task-reminder"
                    v-model="taskForm.reminderEnabled"
                    name="task-reminder"
                    type="checkbox"
                    class="fg-check"
                  >
                  启用提醒
                </label>
              </div>
              <div
                v-if="taskForm.reminderEnabled"
                class="fg-group"
              >
                <label
                  class="fg-label"
                  for="task-reminder-days"
                >提前提醒</label>
                <select
                  id="task-reminder-days"
                  v-model="taskForm.reminderDays"
                  class="fg-input fg-select"
                >
                  <option :value="1">
                    提前1天
                  </option>
                  <option :value="3">
                    提前3天
                  </option>
                  <option :value="7">
                    提前7天
                  </option>
                </select>
              </div>
              <div class="fg-group">
                <label
                  class="fg-label"
                  for="task-desc"
                >描述</label>
                <textarea
                  id="task-desc"
                  v-model="taskForm.description"
                  class="fg-input fg-textarea"
                  rows="3"
                  placeholder="可选：添加任务描述..."
                />
              </div>
            </div>
            <div class="modal-footer-premium">
              <button
                class="btn-modal-ghost"
                @click="taskDialogVisible = false"
              >
                取消
              </button>
              <button
                class="btn-modal-primary"
                @click="saveTask"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Bell, Back, RefreshRight, DocumentAdd, Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const currentView = ref('chart')
const mode = ref('normal')
const taskDialogVisible = ref(false)
const editingTask = ref(null)
const selectedMilestone = ref(null)
const showOnlyUpcoming = ref(false)
const expandedColumns = ref({})
const VISIBLE_TASK_COUNT = 8
const notificationPermission = ref('default')
const chartRef = ref(null)
let chartInstance = null
const taskForm = reactive({
  title: '',
  milestoneId: 1,
  deadline: null,
  priority: 'medium',
  description: '',
  reminderEnabled: false,
  reminderDays: 1
})

const viewOptions = [
  { label: '图表视图', value: 'chart' },
  { label: '时间线', value: 'timeline' },
  { label: '任务看板', value: 'kanban' }
]

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]

let isLoaded = false
const isSaving = ref(false)

const MODE_OFFSETS = { compact: -30, normal: 0, relaxed: 30 }

const MILESTONE_TEMPLATES = [
  { id: 1, title: '背景提升', status: 'pending', description: '加强科研、实习、语言成绩' },
  { id: 2, title: '选校定位', status: 'pending', description: '确定目标院校和专业' },
  { id: 3, title: '文书准备', status: 'pending', description: '准备PS、CV、推荐信' },
  { id: 4, title: '网申提交', status: 'pending', description: '提交申请材料' },
  { id: 5, title: '面试准备', status: 'pending', description: '准备面试并参加' },
  { id: 6, title: '录取决策', status: 'pending', description: '选择学校并确认入学' },
  { id: 7, title: '签证办理', status: 'pending', description: '办理签证手续' }
]

const STORAGE_KEY = 'timeline_data'

const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.milestones && Array.isArray(data.milestones) && data.milestones.length > 0) milestones.value = data.milestones
      if (data.tasks && Array.isArray(data.tasks)) tasks.value = data.tasks
      if (data.mode && ['compact', 'normal', 'relaxed'].includes(data.mode)) mode.value = data.mode
      if (data.currentView && ['chart', 'timeline', 'kanban'].includes(data.currentView)) currentView.value = data.currentView
    } catch (e) {
      console.warn('Failed to parse timeline data from localStorage:', e)
    }
  }
  isLoaded = true
}

const saveToStorage = () => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ milestones: milestones.value, tasks: tasks.value, mode: mode.value, currentView: currentView.value }))
  } finally {
    setTimeout(() => { isSaving.value = false }, 0)
  }
}

const today = new Date()
const PHASE_INTERVALS = { 1: 90, 2: 75, 3: 90, 4: 45, 5: 75, 6: 60 }

const calculateMilestoneDate = (baseDate, milestoneId) => {
  const offset = MODE_OFFSETS[mode.value]
  const date = new Date(baseDate)
  for (let i = 1; i < milestoneId; i++) date.setDate(date.getDate() + (PHASE_INTERVALS[i] || 60))
  date.setDate(date.getDate() + offset)
  return formatDateString(date)
}

const formatDateString = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

const generateMilestones = () => {
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() + 15)

  return MILESTONE_TEMPLATES.map(template => ({
    ...template,
    deadline: calculateMilestoneDate(startDate, template.id),
    tasks: template.id === 1 ? [
      { id: 101, title: '完成背景评估', milestoneId: template.id, status: 'done', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: true, reminderEnabled: false, reminderDays: 1 },
      { id: 102, title: '提交科研项目申请', milestoneId: template.id, status: 'done', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: true, reminderEnabled: false, reminderDays: 1 },
      { id: 103, title: '参加暑期实习', milestoneId: template.id, status: 'in-progress', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 104, title: '托福/雅思备考', milestoneId: template.id, status: 'in-progress', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 105, title: 'GRE/GMAT准备', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 106, title: '发表论文或项目成果', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 }
    ] : template.id === 2 ? [
      { id: 201, title: '选校清单初版', milestoneId: template.id, status: 'done', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: true, reminderEnabled: false, reminderDays: 1 },
      { id: 202, title: '专业方向确认', milestoneId: template.id, status: 'in-progress', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 203, title: '研究目标院校课程设置', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 204, title: '了解教授研究方向', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 205, title: '确定推荐人名单', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 206, title: '最终选校名单确定', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 }
    ] : template.id === 3 ? [
      { id: 301, title: '个人陈述(PS)初稿', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 302, title: '简历(CV)制作', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 303, title: '联系推荐人', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 304, title: '推荐信跟进', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 305, title: '文书修改润色', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 306, title: '成绩单认证', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 }
    ] : template.id === 4 ? [
      { id: 401, title: '注册网申账号', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 402, title: '填写申请表', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 403, title: '上传申请材料', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 404, title: '支付申请费用', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 405, title: '确认材料完整性', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 }
    ] : template.id === 5 ? [
      { id: 501, title: '面试技巧培训', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 502, title: '模拟面试练习', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 503, title: '准备常见问题答案', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 504, title: '参加正式面试', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 505, title: '发送感谢邮件', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 }
    ] : template.id === 6 ? [
      { id: 601, title: '等待录取通知', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 602, title: '收到录取结果汇总', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 603, title: '对比分析各校offer', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 604, title: '缴纳留位费', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 605, title: '确认入学意向', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 }
    ] : template.id === 7 ? [
      { id: 701, title: '准备签证材料', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 702, title: '预约签证面试', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 7 },
      { id: 703, title: '参加签证面试', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'high', completed: false, reminderEnabled: true, reminderDays: 3 },
      { id: 704, title: '体检和疫苗接种', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 705, title: '购买机票', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 706, title: '安排住宿', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'medium', completed: false, reminderEnabled: false, reminderDays: 1 },
      { id: 707, title: '行李准备', milestoneId: template.id, status: 'todo', deadline: calculateMilestoneDate(startDate, template.id), priority: 'low', completed: false, reminderEnabled: false, reminderDays: 1 }
    ] : []
  }))
}

const milestones = ref(generateMilestones())
const tasks = ref([
  { id: 1, title: '完成背景评估', milestoneId: 1, status: 'done', deadline: milestones.value[0]?.deadline || '', priority: 'high', reminderEnabled: false, reminderDays: 1 },
  { id: 2, title: '选校清单初版', milestoneId: 2, status: 'todo', deadline: milestones.value[1]?.deadline || '', priority: 'high', reminderEnabled: false, reminderDays: 1 },
  { id: 3, title: '文书大纲', milestoneId: 3, status: 'todo', deadline: milestones.value[2]?.deadline || '', priority: 'medium', reminderEnabled: false, reminderDays: 1 }
])

const columns = [
  { id: 'todo', title: '待处理' },
  { id: 'in-progress', title: '进行中' },
  { id: 'done', title: '已完成' }
]

const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'done').length)
const overallProgress = computed(() => totalTasks.value === 0 ? 0 : Math.round((completedTasks.value / totalTasks.value) * 100))

const isOverdue = (date) => new Date(date) < new Date(today)
const isUrgent = (date) => { const d = Math.floor((new Date(date) - new Date(today)) / 86400000); return d <= 7 && d > 0 }
const isSoon = (date) => { const d = Math.floor((new Date(date) - new Date(today)) / 86400000); return d <= 3 && d > 0 }
const formatDate = (date) => { const d = new Date(date); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日` }
const getStatusColor = (s) => ({ completed: '#059669', 'in-progress': '#D97706', pending: '#64748B' }[s] || '#64748B')
const getStatusLabel = (s) => ({ completed: '已完成', 'in-progress': '进行中', pending: '待开始' }[s] || s)
const getMilestoneTitle = (id) => milestones.value.find(m => m.id === id)?.title || 'Unknown'
const getMilestoneProgress = (m) => { const t = m.tasks.length; return t === 0 ? 0 : Math.round((m.tasks.filter(t => t.completed).length / t) * 100) }

const showUpcomingTasks = () => { showOnlyUpcoming.value = true; ElMessage.info('已筛选出7天内到期的任务') }
const showAllTasks = () => { showOnlyUpcoming.value = false }
const toggleColumnExpand = (id) => { expandedColumns.value[id] = !expandedColumns.value[id] }
const isColumnExpanded = (id) => !!expandedColumns.value[id]
const getVisibleTasks = (id) => { const all = getColumnTasks(id); return isColumnExpanded(id) ? all : all.slice(0, VISIBLE_TASK_COUNT) }
const getHiddenCount = (id) => { const h = getColumnTasks(id).length - VISIBLE_TASK_COUNT; return h > 0 ? h : 0 }

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) { ElMessage.warning('当前浏览器不支持通知功能'); return 'unsupported' }
  if (Notification.permission === 'granted') { notificationPermission.value = 'granted'; return 'granted' }
  if (Notification.permission === 'denied') { notificationPermission.value = 'denied'; ElMessage.warning('通知权限已被拒绝'); return 'denied' }
  try { const p = await Notification.requestPermission(); notificationPermission.value = p; return p }
  catch (_e) { ElMessage.error('请求通知权限失败'); return 'error' }
}
const sendTaskNotification = (task, daysBefore) => {
  if (notificationPermission.value !== 'granted') return
  const ms = milestones.value.find(m => m.id === task.milestoneId)
  new Notification('留学规划任务提醒', { body: `任务"${task.title}"还有${daysBefore}天到期（阶段：${ms?.title || '未知'}）`, icon: '/favicon.ico', tag: `task-reminder-${task.id}` })
}
const checkTaskReminders = () => {
  const now = new Date()
  tasks.value.forEach(task => {
    if (!task.reminderEnabled || task.completed) return
    const dd = Math.floor((new Date(task.deadline) - now) / 86400000)
    const rd = task.reminderDays || 1
    if (dd === rd || (dd === 0 && rd === 0)) sendTaskNotification(task, rd)
  })
}

watch([milestones, tasks, mode, currentView], () => { if (isLoaded && !isSaving.value) saveToStorage() }, { deep: true })

const getColumnTasks = (columnId) => {
  let f = tasks.value.filter(t => t.status === columnId)
  if (showOnlyUpcoming.value) f = f.filter(t => isUpcoming(t.deadline))
  return f
}
const isUpcoming = (date) => { const d = Math.floor((new Date(date) - new Date(today)) / 86400000); return d <= 7 && d > 0 }
const upcomingTasksCount = computed(() => tasks.value.filter(t => t.status !== 'done' && isUpcoming(t.deadline)).length)
const selectMilestone = (m) => { selectedMilestone.value = m }

const handleModeChange = () => {
  milestones.value = generateMilestones()
  tasks.value.forEach(task => { const m = milestones.value.find(m => m.id === task.milestoneId); if (m) task.deadline = m.deadline })
  ElMessage.success(`已切换到${mode.value === '紧凑' ? '紧凑' : mode.value === '宽松' ? '宽松' : '常规'}模式`)
}

const deleteAllTasks = () => ElMessageBox.confirm('确定要删除所有任务吗？此操作不可恢复！', '确认删除', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error' }).then(() => { tasks.value = []; milestones.value.forEach(m => { m.tasks = [] }); ElMessage.success('已删除所有任务'); updateChart() }).catch(() => {})
const resetAllTasks = () => ElMessageBox.confirm('确定要重置所有任务吗？这将清除所有数据并恢复到初始状态。', '确认重置', { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning' }).then(() => { localStorage.removeItem(STORAGE_KEY); milestones.value = generateMilestones(); tasks.value = []; selectedMilestone.value = milestones.value[0] || null; ElMessage.success('已重置所有任务'); updateChart() }).catch(() => {})
const generateSampleTasks = () => ElMessageBox.confirm('确定要生成示例任务吗？这将重新生成所有里程碑的示例任务。', '确认生成', { confirmButtonText: '确定生成', cancelButtonText: '取消', type: 'info' }).then(() => { milestones.value = generateMilestones(); tasks.value = []; milestones.value.forEach(ms => { ms.tasks.forEach(t => { tasks.value.push({ ...t, status: t.completed ? 'done' : t.status || 'todo' }) }) }); selectedMilestone.value = milestones.value[0] || null; ElMessage.success(`已生成 ${tasks.value.length} 个示例任务`); updateChart() }).catch(() => {})

const toggleTask = (mid, tid) => {
  const ms = milestones.value.find(m => m.id === mid); if (!ms) return
  const mt = ms.tasks.find(t => t.id === tid); if (!mt) return
  mt.completed = !mt.completed
  const t = tasks.value.find(t => t.id === tid); if (t) t.status = mt.completed ? 'done' : 'todo'
  ElMessage.success('任务状态已更新'); updateChart()
}
const dragStart = (task, col) => { task._dragFrom = col }
const drop = (task, toCol) => { if (task._dragFrom !== toCol) { task.status = toCol; ElMessage.success('任务已移动') } }

const showAddTaskToMilestone = () => {
  if (!selectedMilestone.value) return
  editingTask.value = null
  Object.assign(taskForm, { title: '', milestoneId: selectedMilestone.value.id, deadline: selectedMilestone.value.deadline, priority: 'medium', description: '', reminderEnabled: false, reminderDays: 1 })
  taskDialogVisible.value = true
}
const showAddTask = (colId) => {
  editingTask.value = null
  const ms = milestones.value.find(m => { const t = tasks.value.find(t => t.milestoneId === m.id); return t && t.status === colId }) || milestones.value[0]
  Object.assign(taskForm, { title: '', milestoneId: ms.id, deadline: ms.deadline, priority: 'medium', description: '', reminderEnabled: false, reminderDays: 1 })
  taskDialogVisible.value = true
}
const editTask = (task) => {
  editingTask.value = task
  Object.assign(taskForm, { title: task.title, milestoneId: task.milestoneId, deadline: task.deadline, priority: task.priority, description: task.description, reminderEnabled: task.reminderEnabled || false, reminderDays: task.reminderDays || 1 })
  taskDialogVisible.value = true
}
const saveTask = () => {
  if (!taskForm.title) { ElMessage.warning('请输入任务标题'); return }
  const dl = taskForm.deadline || milestones.value.find(m => m.id === taskForm.milestoneId)?.deadline || formatDateString(new Date())
  const re = taskForm.reminderEnabled, rd = taskForm.reminderDays || 1
  if (editingTask.value) {
    Object.assign(editingTask.value, { title: taskForm.title, milestoneId: taskForm.milestoneId, deadline: dl, priority: taskForm.priority, description: taskForm.description, reminderEnabled: re, reminderDays: rd })
    const ms = milestones.value.find(m => m.id === taskForm.milestoneId)
    if (ms) { const mt = ms.tasks.find(t => t.id === editingTask.value.id); if (mt) Object.assign(mt, editingTask.value); else ms.tasks.push({ ...editingTask.value, completed: editingTask.value.status === 'done' }) }
    ElMessage.success('任务已更新'); updateChart()
  } else {
    const nt = { id: Date.now(), title: taskForm.title, milestoneId: taskForm.milestoneId, deadline: dl, priority: taskForm.priority, description: taskForm.description, status: 'todo', reminderEnabled: re, reminderDays: rd }
    tasks.value.push(nt)
    const ms = milestones.value.find(m => m.id === taskForm.milestoneId)
    if (ms) ms.tasks.push({ ...nt, completed: false })
    ElMessage.success('任务已创建'); updateChart()
    if (re) setTimeout(() => checkTaskReminders(), 100)
  }
  taskDialogVisible.value = false
}
const deleteTask = (id) => ElMessageBox.confirm('确定删除此任务?', '警告', { type: 'warning' }).then(() => {
  const idx = tasks.value.findIndex(t => t.id === id)
  if (idx > -1) {
    const task = tasks.value[idx]
    const ms = milestones.value.find(m => m.id === task.milestoneId)
    if (ms) { const mi = ms.tasks.findIndex(t => t.id === id); if (mi > -1) ms.tasks.splice(mi, 1) }
    tasks.value.splice(idx, 1); ElMessage.success('任务已删除'); updateChart()
  }
}).catch(() => {})

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}
const handleChartResize = () => chartInstance?.resize()
window.addEventListener('resize', handleChartResize)
const updateChart = () => {
  if (!chartInstance) return
  const cats = milestones.value.map(m => m.title)
  const sd = milestones.value.map((ms, i) => {
    const total = ms.tasks.length, done = ms.tasks.filter(t => t.completed).length
    return { name: ms.title, value: [i+1, ms.status==='completed'?100:ms.status==='in-progress'?50:0, total?Math.round(done/total*100):0, ms.status] }
  })
  chartInstance.setOption({
    color: ['#0F172A','#64748B'], animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor:'#0F172A', borderColor:'#0F172A', textStyle:{color:'#F8FAFC',fontSize:13}, padding:[12,16],
      formatter: (params) => { const ms = milestones.value[params[0].dataIndex]; const t=ms.tasks.length, d=ms.tasks.filter(x=>x.completed).length; return `<strong style="font-size:14px">${ms.title}</strong><br/><span style="opacity:0.7">截止：${formatDate(ms.deadline)}</span><br/><span style="color:#D97706">进度：${d}/${t} (${t?Math.round(d/t*100):0}%)</span><br/>状态：${getStatusLabel(ms.status)}` } },
    grid: { left:'4%', right:'6%', bottom:'14%', top:'8%', containLabel:true },
    xAxis: { type:'category', data:cats, axisLabel:{color:'#94A3B8',fontSize:12}, axisLine:{lineStyle:{color:'#E2E8F0'}}, axisTick:{show:false} },
    yAxis: { type:'value', name:'完成度', nameTextStyle:{color:'#94A3B8',fontSize:11}, min:0, max:100, axisLabel:{formatter:'{value}%',color:'#94A3B8',fontSize:11}, axisLine:{lineStyle:{color:'#E2E8F0'}}, splitLine:{lineStyle:{color:'#F1F5F9',type:'dashed'}} },
    series: [{ name:'完成度', type:'bar', data:sd.map(d=>d.value[2]), itemStyle:{color:(p)=>({completed:'#059669','in-progress':'#D97706',pending:'#CBD5E1'}[milestones.value[p.dataIndex].status]||'#CBD5E1'), borderRadius:[6,6,0,0]}, barWidth:'46%',
      label:{show:true,position:'top',formatter:(p)=>{const m=milestones.value[p.dataIndex];return`${m.tasks.filter(t=>t.completed).length}/${m.tasks.length}`},fontSize:11,color:'#64748B',fontWeight:500} },
      { name:'状态线', type:'line', data:sd.map(d=>d.value[1]), smooth:true, symbol:'circle', symbolSize:8, lineStyle:{width:2.5,color:'#D97706'}, itemStyle:{color:'#D97706',borderWidth:2,borderColor:'#fff'} }],
    legend: { data:['完成度','状态线'], bottom:0, textStyle:{color:'#94A3B8',fontSize:12}, itemWidth:16, itemHeight:3 }
  })
}
watch(currentView, (v) => { if (v === 'chart') nextTick(() => initChart()); nextTick(() => refreshObservations()) })

/* ========== AWWWARDS UI STATE ========== */
const cursorX = ref(0)
const cursorY = ref(0)
const ringX = ref(0)
const ringY = ref(0)
const cursorExpanded = ref(false)
const toolbarScrolled = ref(false)
const hoverMilestone = ref(null)
const visibleMilestones = ref(new Set())
const animatedStats = ref([0, 0, 0, 0])
const heroStats = computed(() => [
  { value: totalTasks.value, suffix: '', label: '总任务数' },
  { value: completedTasks.value, suffix: '', label: '已完成' },
  { value: overallProgress.value, suffix: '%', label: '整体进度' },
  { value: upcomingTasksCount.value, suffix: '', label: '即将到期' }
])
const trackFillHeight = computed(() => {
  if (!milestones.value.length) return 0
  return Math.round((milestones.value.filter(m => m.status === 'completed').length / milestones.value.length) * 100)
})

let rafId = null
const onMouseMove = (e) => {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      ringX.value += (cursorX.value - ringX.value) * 0.12
      ringY.value += (cursorY.value - ringY.value) * 0.12
      rafId = null
    })
  }
}

const animateCounter = (targets) => {
  const duration = 1600, start = performance.now()
  const startVals = animatedStats.value.slice()
  function tick(now) {
    const prog = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - prog, 4)
    animatedStats.value = targets.map((t, i) => Math.round(startVals[i] + (t - startVals[i]) * eased))
    if (prog < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const handleScroll = () => { toolbarScrolled.value = window.scrollY > 200 }

let reminderIntervalId = null

onMounted(() => {
  loadFromStorage()
  if (milestones.value.length > 0) selectedMilestone.value = milestones.value[0]
  requestNotificationPermission()
  reminderIntervalId = setInterval(checkTaskReminders, 3600000)
  checkTaskReminders()
  if (currentView.value === 'chart') initChart()
  window.addEventListener('scroll', handleScroll, { passive: true })
  nextTick(() => {
    observeAnimations()
    setTimeout(() => animateCounter(heroStats.value.map(s => s.value)), 400)
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleChartResize)
  window.removeEventListener('scroll', handleScroll)
  if (rafId) cancelAnimationFrame(rafId)
  if (reminderIntervalId) clearInterval(reminderIntervalId)
  if (scrollObserver) scrollObserver.disconnect()
})

let scrollObserver = null

const observeAnimations = () => {
  if (scrollObserver) scrollObserver.disconnect()
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        if (entry.target.classList.contains('milestone-item-premium')) {
          const idxAttr = entry.target.getAttribute('data-index')
          if (idxAttr !== null) {
            const ms = milestones.value[parseInt(idxAttr)]
            if (ms) visibleMilestones.value = new Set([...visibleMilestones.value, ms.id])
          }
        }
      }
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.animate-on-scroll, .milestone-item-premium').forEach(el => scrollObserver.observe(el))
}

const refreshObservations = () => {
  nextTick(() => {
    document.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(el => {
      if (scrollObserver) scrollObserver.observe(el)
    })
    document.querySelectorAll('.milestone-item-premium:not(.ms-visible)').forEach(el => {
      if (scrollObserver) scrollObserver.observe(el)
    })
  })
}
</script>

<style scoped>
/* ============================================
   AWWWARDS-LEVEL TIMELINE PAGE
   Visual Language: New Minimalism + Editorial
   Color System: Slate #0F172A + Amber #D97706
   ============================================ */

/* ---- Reset & Base ---- */
.timeline-page {
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---- Noise Texture ---- */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.032;
  pointer-events: none;
  z-index: 99999;
}

/* ---- Custom Cursor ---- */
.cursor-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  background: #D97706;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s;
}

.cursor-ring {
  position: fixed;
  width: 36px;
  height: 36px;
  border: 1.5px solid rgba(15, 23, 42, 0.2);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99997;
  transform: translate(-50%, -50%);
  transition: width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, opacity 0.3s;
}

.cursor-ring.expanded {
  width: 64px;
  height: 64px;
  border-color: rgba(217, 119, 6, 0.5);
  background: rgba(217, 119, 6, 0.04);
}

/* ============================================
   HERO SECTION — Cinematic Opener (Light)
   ============================================ */
.hero-section {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAFBFC;
  overflow: hidden;
  padding: 80px 40px;
}

.hero-grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 70%);
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.2;
  pointer-events: none;
}

.hero-glow-1 {
  width: 600px;
  height: 600px;
  background: #FEF3C7;
  top: -200px;
  right: -100px;
  animation: glowDrift1 12s ease-in-out infinite alternate;
}

.hero-glow-2 {
  width: 400px;
  height: 400px;
  background: #DBEAFE;
  bottom: -150px;
  left: -80px;
  animation: glowDrift2 15s ease-in-out infinite alternate;
}

@keyframes glowDrift1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-40px, 30px) scale(1.15); }
}

@keyframes glowDrift2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -20px) scale(1.1); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.label-line {
  width: 32px;
  height: 1px;
  background: #D97706;
}

.label-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #94A3B8;
  text-transform: uppercase;
}

.hero-title {
  margin: 0 0 24px;
  line-height: 0.92;
  letter-spacing: -0.035em;
}

.title-line {
  display: block;
}

.title-line-1 {
  font-size: clamp(56px, 8vw, 110px);
  font-weight: 700;
  color: #0F172A;
  animation: titleReveal1 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.15s;
}

.title-line-2 {
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 300;
  color: #64748B;
  font-style: italic;
  animation: titleReveal2 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.35s;
}

.title-line-2 em {
  font-style: italic;
  background: linear-gradient(135deg, #D97706, #B45309);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes titleReveal1 {
  from { opacity: 0; transform: translateY(40px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes titleReveal2 {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-subtitle {
  font-size: clamp(15px, 1.4vw, 18px);
  color: #64748B;
  font-weight: 400;
  max-width: 520px;
  margin: 0 auto 56px;
  line-height: 1.7;
  animation: fadeUp 0.7s ease both;
  animation-delay: 0.55s;
  opacity: 0;
}

/* ---- Hero Stats Row ---- */
.hero-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  animation: fadeUp 0.7s ease both;
  animation-delay: 0.7s;
  opacity: 0;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  position: relative;
}

.stat-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-number {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-suffix {
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 600;
  color: #D97706;
}

.stat-divider-v {
  width: 1px;
  height: 44px;
  background: #E2E8F0;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.stat-label-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #94A3B8;
  margin-top: 8px;
}

.hero-stat:nth-child(1) .stat-number { color: #0F172A; }
.hero-stat:nth-child(2) .stat-number { color: #D97706; }
.hero-stat:nth-child(3) .stat-number { color: #334155; }
.hero-stat:nth-child(4) .stat-number { color: #B45309; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   MAIN SECTION
   ============================================ */
.main-section {
  padding: 0 40px 120px;
  position: relative;
}

.data-container {
  max-width: 1440px;
  margin: 0 auto;
}

/* ============================================
   FLOATING TOOLBAR
   ============================================ */
.toolbar-float {
  position: sticky;
  top: 20px;
  z-index: 100;
  margin: -40px auto 56px;
  max-width: 1440px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toolbar-scrolled {
  top: 12px;
  margin-top: 0;
  margin-bottom: 40px;
}

.toolbar-scrolled .toolbar-inner {
  box-shadow: 0 8px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04);
}

.toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 28px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  transition: box-shadow 0.4s ease;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-switcher {
  display: inline-flex;
  background: #F8FAFC;
  border-radius: 10px;
  padding: 3px;
  gap: 0;
}

.view-btn {
  padding: 7px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

.view-btn:hover { color: #0F172A; }
.view-btn.active {
  background: #0F172A;
  color: #FFF;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.mode-select {
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-height: 36px;
}

.mode-select:focus { border-color: #D97706; box-shadow: 0 0 0 3px rgba(217,119,6,0.1); }

.btn-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  color: #64748B;
  font-size: 15px;
  transition: all 0.2s;
}

.btn-icon:hover { background: #0F172A; color: #FFF; border-color: #0F172A; }

.btn-primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  background: #0F172A;
  color: #FFF;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

.btn-primary-cta:hover {
  background: #D97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.3);
}

/* ============================================
   CHART VIEW — Premium Card
   ============================================ */
.chart-card-premium {
  background: #FFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: box-shadow 0.4s ease, opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translateY(30px);
}

.animate-on-scroll.is-visible .chart-card-premium {
  opacity: 1;
  transform: translateY(0);
}

.chart-card-premium:hover { box-shadow: 0 12px 48px rgba(15,23,42,0.08); }

.chart-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.chart-title-premium {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}

.title-dot {
  width: 8px;
  height: 8px;
  background: #D97706;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-sub-info {
  font-size: 13px;
  color: #94A3B8;
  font-weight: 500;
}

.chart-canvas-premium {
  width: 100%;
  height: 420px;
}

/* ============================================
   TIMELINE VIEW — Premium
   ============================================ */
.timeline-card-premium {
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
}

.timeline-layout-premium {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  min-height: 600px;
}

.timeline-container-premium {
  position: relative;
  padding-left: 48px;
}

.timeline-track {
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.track-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: linear-gradient(180deg, #D97706, #FBBF24);
  border-radius: 2px;
  transition: height 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Milestone Item */
.milestone-item-premium {
  position: relative;
  margin-bottom: 32px;
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.milestone-item-premium.ms-visible {
  opacity: 1;
  transform: translateX(0);
}

.milestone-item-premium.is-overdue .ms-date { color: #DC2626; }

.ms-node {
  position: absolute;
  left: -33px;
  top: 22px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.node-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid #E2E8F0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.milestone-item-premium.is-selected .node-ring,
.milestone-item-premium:hover .node-ring {
  border-color: #D97706;
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
}

.node-core {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.node-pending { background: #CBD5E1; }
.node-in-progress { background: #D97706; box-shadow: 0 0 8px rgba(217,119,6,0.4); }
.node-completed { background: #059669; }

.ms-card {
  background: #FFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.ms-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #D97706, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.ms-card.card-hover,
.milestone-item-premium.is-selected .ms-card {
  border-color: rgba(217, 119, 6, 0.25);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.ms-card.card-hover::before,
.milestone-item-premium.is-selected .ms-card::before { opacity: 1; }

.ms-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ms-phase-num {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #CBD5E1;
}

.status-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.pill-completed { background: #ECFDF5; color: #059669; }
.pill-in-progress { background: #FFFBEB; color: #D97706; }
.pill-pending { background: #F8FAFC; color: #94A3B8; }

.ms-title {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.ms-desc {
  font-size: 13px;
  color: #64748B;
  margin: 0 0 16px;
  line-height: 1.6;
}

.ms-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ms-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #94A3B8;
  font-weight: 500;
}

.ms-progress-val {
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
}

.ms-progress-track {
  height: 4px;
  background: #F1F5F9;
  border-radius: 4px;
  overflow: hidden;
}

.ms-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #D97706, #FBBF24);
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Detail Panel */
.detail-panel-premium {
  background: #FFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 32px;
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  animation: panelSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelSlideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.dp-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F1F5F9;
}

.dp-phase-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #D97706;
  margin-bottom: 8px;
}

.dp-title {
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.dp-date {
  font-size: 13px;
  color: #94A3B8;
  font-weight: 500;
}

.dp-desc {
  color: #64748B;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.dp-tasks-section { margin-top: 8px; }

.dp-tasks-header { margin-bottom: 12px; }

.dp-tasks-count {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.dp-tasks-count strong { color: #0F172A; }

.dp-task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dp-task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F8FAFC;
  transition: all 0.2s;
}

.dp-task-item:last-child { border-bottom: none; }
.dp-task-item.completed .dp-task-name { text-decoration: line-through; color: #CBD5E1; }

.dp-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dp-checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }

.check-box {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #E2E8F0;
  border-radius: 5px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  position: relative;
}

.dp-checkbox input:checked + .check-box {
  background: #0F172A;
  border-color: #0F172A;
}

.check-box::after {
  content: '';
  position: absolute;
  display: none;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  top: 2px;
  left: 5px;
  transform: rotate(45deg);
}

.dp-checkbox input:checked + .check-box::after { display: block; }

.dp-task-name {
  font-size: 14px;
  color: #0F172A;
  flex: 1;
  font-weight: 500;
}

.tag-mini {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.2px;
}

.tag-mini.tag-danger { background: #FEF2F2; color: #DC2626; }

.dp-empty {
  color: #CBD5E1;
  text-align: center;
  padding: 24px;
  font-size: 13px;
}

.dp-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}

.btn-add-task {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  background: #0F172A;
  color: #FFF;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-add-task:hover {
  background: #D97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.3);
}

/* Empty State */
.empty-state-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 480px;
  background: #F8FAFC;
  border-radius: 20px;
  border: 2px dashed #E2E8F0;
}

.empty-rings {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #E2E8F0;
}

.ring-outer {
  inset: 0;
  animation: ringPulse 3s ease-in-out infinite;
}

.ring-inner {
  inset: 16px;
  border-color: #D97706;
  border-style: dashed;
  animation: ringPulse 3s ease-in-out infinite 0.5s;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 1; }
}

.empty-main-text {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 6px;
}

.empty-sub-text {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
}

/* ============================================
   KANBAN VIEW — Premium Glass
   ============================================ */
.kanban-toolbar-premium {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.kt-left { display: flex; align-items: center; gap: 10px; }

.btn-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  background: #F8FAFC;
  color: #64748B;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter:hover { border-color: #D97706; color: #D97706; }
.btn-filter-active { background: #0F172A; color: #FFF; border-color: #0F172A; }

.upcoming-badge {
  font-size: 12px;
  font-weight: 600;
  color: #D97706;
  background: #FEF3C7;
  padding: 4px 12px;
  border-radius: 20px;
}

.kanban-board-premium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.kanban-col-premium {
  background: #F8FAFC;
  border-radius: 20px;
  padding: 20px;
  min-height: 400px;
}

.col-header-premium {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #E2E8F0;
}

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-todo { background: #94A3B8; }
.dot-in-progress { background: #D97706; }
.dot-done { background: #059669; }

.col-header-premium h4 {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: 0.3px;
}

.col-count-premium {
  font-size: 11px;
  font-weight: 700;
  color: #FFF;
  background: #0F172A;
  padding: 2px 10px;
  border-radius: 20px;
  min-width: 24px;
  text-align: center;
}

.col-body-premium {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Task Card Premium */
.task-card-premium {
  background: #FFF;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #F1F5F9;
  display: flex;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.task-card-premium:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
  border-color: #E2E8F0;
}

.task-card-premium:active { cursor: grabbing; transform: translateY(0); }

.tc-stripe {
  width: 3px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.stripe-solid { background: #0F172A; }
.stripe-warning { background: #D97706; }
.stripe-danger { background: #DC2626; }

.tc-body {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tc-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.tc-title {
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  line-height: 1.4;
}

.tc-tags { display: flex; gap: 4px; flex-wrap: wrap; flex-shrink: 0; }

.tag-sm {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
}

.tag-sm-danger { background: #FEF2F2; color: #DC2626; }
.tag-sm-warning { background: #FFFBEB; color: #D97706; }
.tag-sm-info { background: #F0F9FF; color: #0284C7; }

.tc-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94A3B8;
}

.meta-sep { opacity: 0.3; }

.tc-actions-row {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.25s ease;
  margin-top: 4px;
}

.task-card-premium:hover .tc-actions-row {
  max-height: 32px;
  opacity: 1;
}

.tc-action-btn {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  background: #F8FAFC;
  color: #64748B;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tc-action-btn:hover { background: #0F172A; color: #FFF; }
.tc-action-del:hover { background: #FEF2F2; color: #DC2626; }

.expand-btn-premium {
  width: 100%;
  border: none;
  background: #F1F5F9;
  color: #64748B;
  padding: 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.expand-btn-premium:hover { background: #E2E8F0; color: #0F172A; }
.expand-collapse { margin-top: 4px; }

.add-task-btn-premium {
  width: 100%;
  border: 2px dashed #E2E8F0;
  background: transparent;
  color: #94A3B8;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}

.add-task-btn-premium:hover {
  border-color: #D97706;
  color: #D97706;
  background: #FEF3C7;
}

/* ============================================
   MODAL DIALOG — Premium
   ============================================ */
.modal-overlay-premium {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-premium {
  background: #FFF;
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.2), 0 10px 30px rgba(15, 23, 42, 0.1);
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 28px 0;
}

.modal-header-premium h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.01em;
}

.modal-close-premium {
  background: #F8FAFC;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 20px;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-premium:hover { background: #FEF2F2; color: #DC2626; }

.modal-body-premium { padding: 24px 28px; }

.fg-group { margin-bottom: 20px; }

.fg-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.fg-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  background: #F8FAFC;
  color: #0F172A;
  transition: all 0.2s;
  outline: none;
  min-height: 44px;
  box-sizing: border-box;
  font-family: inherit;
}

.fg-input:focus {
  border-color: #D97706;
  background: #FFF;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.08);
}

.fg-input::placeholder { color: #CBD5E1; }

.fg-select { appearance: auto; cursor: pointer; }
.fg-textarea { resize: vertical; min-height: 80px; }

.fg-check-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
  cursor: pointer;
}

.fg-check { width: 18px; height: 18px; accent-color: #D97706; cursor: pointer; }

.priority-chips { display: flex; gap: 8px; }

.priority-chip {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.priority-chip.active {
  background: #0F172A;
  color: #FFF;
  border-color: #0F172A;
}

.priority-chip:hover:not(.active) { border-color: #D97706; color: #D97706; }

.modal-footer-premium {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 28px 28px;
}

.btn-modal-ghost {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: #64748B;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-ghost:hover { background: #F8FAFC; }

.btn-modal-primary {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  background: #0F172A;
  color: #FFF;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-modal-primary:hover {
  background: #D97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.3);
}

/* Dialog Transition */
.dialog-premium-enter-active { transition: opacity 0.3s ease; }
.dialog-premium-leave-active { transition: opacity 0.2s ease; }
.dialog-premium-enter-active .modal-premium { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; }
.dialog-premium-leave-active .modal-premium { transition: transform 0.2s ease, opacity 0.2s ease; }
.dialog-premium-enter-from, .dialog-premium-leave-to { opacity: 0; }
.dialog-premium-enter-from .modal-premium { transform: scale(0.95) translateY(16px); opacity: 0; }
.dialog-premium-leave-to .modal-premium { transform: scale(0.97) translateY(8px); opacity: 0; }

/* ============================================
   SCROLL ANIMATION TRIGGER
   ============================================ */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .main-section { padding: 0 24px 80px; }
  .timeline-layout-premium { grid-template-columns: 1fr; }
  .detail-panel-premium { position: static; max-height: none; }
  .hero-section { padding: 60px 24px; }
  .toolbar-inner { flex-wrap: wrap; padding: 12px 20px; }
  .kanban-board-premium { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero-title { line-height: 1; }
  .title-line-1 { font-size: clamp(36px, 10vw, 56px); }
  .title-line-2 { font-size: clamp(28px, 8vw, 44px); }
  .hero-stats-row { flex-wrap: wrap; gap: 16px; }
  .hero-stat { padding: 16px 24px; }
  .stat-divider-v { display: none; }
  .toolbar-float { position: static; margin: 0 0 32px; }
  .toolbar-inner { flex-direction: column; align-items: stretch; }
  .toolbar-left, .toolbar-right { flex-direction: column; }
  .view-switcher { width: 100%; justify-content: center; }
  .view-btn { flex: 1; text-align: center; }
  .toolbar-right { gap: 8px; }
  .toolbar-right .btn-icon, .btn-primary-cta { width: 100%; justify-content: center; }
  .main-section { padding: 0 16px 60px; }
  .hero-section { min-height: 80vh; padding: 48px 16px; }
  .timeline-container-premium { padding-left: 36px; }
  .ms-card { padding: 18px; }
  .kanban-col-premium { min-height: 300px; }
  .cursor-dot, .cursor-ring { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll { opacity: 1; transform: none; transition: none; }
  .cursor-dot, .cursor-ring { display: none !important; }
  .ms-card { transition: none; }
  .milestone-item-premium { transition: none; }
  .view-btn, .btn-icon, .btn-primary-cta { transition: none; }
  .dialog-premium-enter-active,
  .dialog-premium-leave-active,
  .dialog-premium-enter-active .modal-premium,
  .dialog-premium-leave-active .modal-premium { transition: none; }
}
</style>
