<template>
  <div class="assessment-awwwards">
    <!-- ═══════════════ NOISE OVERLAY ═══════════════ -->
    <div class="noise-overlay" />

    <!-- ═══════════════ SCENE 0: HERO ═══════════════ -->
    <section
      class="scene scene--hero"
      :class="{ 'is-active': currentScene === 0 }"
    >
      <!-- WebGL Particle Background -->
      <canvas
        ref="particleCanvas"
        class="particle-bg"
      />

      <div class="scene-content">
        <!-- Badge -->
        <div class="hero-badge stagger-item">
          <span class="badge-dot" />
          <span class="badge-text">ASTROPATH ENGINE</span>
        </div>

        <!-- Main Title -->
        <h1 class="hero-title stagger-item">
          <span class="title-line">背景评估</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle stagger-item">
          AI 智能解析背景，为你生成专属留学路线图
        </p>

        <!-- CTA Button -->
        <button
          class="btn-magnetic btn-hero stagger-item"
          @click="goToScene(1)"
        >
          <span class="btn-text">开始评估</span>
          <span class="btn-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <!-- Metrics -->
        <div class="hero-metrics stagger-item">
          <div class="metric-item">
            <span class="metric-num">{{ SCHOOL_COUNT_DISPLAY }}</span>
            <span class="metric-label">精选院校</span>
          </div>
          <div class="metric-divider" />
          <div class="metric-item">
            <span class="metric-num">6</span>
            <span class="metric-label">核心场景</span>
          </div>
          <div class="metric-divider" />
          <div class="metric-item">
            <span class="metric-num">AI</span>
            <span class="metric-label">智能协同</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SCENE 1: IDENTITY ═══════════════ -->
    <section
      class="scene scene--form"
      :class="{ 'is-active': currentScene === 1 }"
    >
      <div class="scene-content">
        <!-- Header -->
        <div class="scene-header">
          <span class="scene-num">01</span>
          <h2 class="scene-title">
            构建你的数字留学档案
          </h2>
          <div class="scene-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: 25%"
              />
            </div>
            <span class="progress-text">1 / 4</span>
          </div>
        </div>

        <!-- Form Grid -->
        <div class="form-grid">
          <!-- Name Field -->
          <div class="form-group form-group--full">
            <label class="form-label">你的姓名</label>
            <div class="input-wrapper">
              <input
                v-model="form.basic.name"
                type="text"
                class="form-input"
                placeholder="输入姓名..."
              >
            </div>
            <p class="form-hint">
              用于生成个性化评估报告
            </p>
          </div>

          <!-- Age & University Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">年龄</label>
              <div class="number-input">
                <button
                  class="num-btn"
                  @click="form.basic.age--"
                >
                  −
                </button>
                <span class="num-value">{{ form.basic.age }}</span>
                <button
                  class="num-btn"
                  @click="form.basic.age++"
                >
                  +
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">在读院校</label>
              <el-select
                v-model="form.basic.university"
                placeholder="选择院校类型"
                class="university-select"
                size="large"
              >
                <el-option
                  label="985 院校"
                  value="985"
                />
                <el-option
                  label="211 院校"
                  value="211"
                />
                <el-option
                  label="普通本科"
                  value="regular"
                />
                <el-option
                  label="海外院校"
                  value="overseas"
                />
              </el-select>
            </div>
          </div>

          <!-- GPA Ring -->
          <div class="form-group form-group--center">
            <label class="form-label">GPA 绩点</label>
            <div class="gpa-container">
              <svg
                class="gpa-ring"
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="var(--color-slate-200)"
                  stroke-width="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="var(--color-accent)"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="gpaCircumference"
                  :stroke-dashoffset="gpaOffset"
                  transform="rotate(-90 100 100)"
                  class="gpa-progress"
                />
                <text
                  x="100"
                  y="95"
                  text-anchor="middle"
                  class="gpa-value"
                >
                  {{ form.basic.gpa.toFixed(1) }}
                </text>
                <text
                  x="100"
                  y="120"
                  text-anchor="middle"
                  class="gpa-max"
                >/ 4.0</text>
              </svg>
              <div class="gpa-quick-btns">
                <button
                  v-for="v in [2.5, 3.0, 3.5, 3.8]"
                  :key="v"
                  class="gpa-btn"
                  :class="{ active: Math.abs(form.basic.gpa - v) < 0.05 }"
                  @click="form.basic.gpa = v"
                >
                  {{ v }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="scene-nav">
          <button
            class="btn-nav btn-nav--prev"
            @click="goToScene(0)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            class="btn-nav btn-nav--next"
            @click="goToScene(2)"
          >
            <span>继续</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SCENE 2: ACADEMICS ═══════════════ -->
    <section
      class="scene scene--form"
      :class="{ 'is-active': currentScene === 2 }"
    >
      <div class="scene-content">
        <!-- Header -->
        <div class="scene-header">
          <span class="scene-num">02</span>
          <h2 class="scene-title">
            定义你的知识版图
          </h2>
          <div class="scene-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: 50%"
              />
            </div>
            <span class="progress-text">2 / 4</span>
          </div>
        </div>

        <!-- Degree Selection -->
        <div class="form-section">
          <label class="section-label">学历层次</label>
          <div class="pill-group">
            <button
              v-for="d in ['本科', '硕士', '博士']"
              :key="d"
              class="pill-btn"
              :class="{ active: form.academic.degree === d }"
              @click="form.academic.degree = d"
            >
              <span class="pill-indicator" />
              {{ d }}
            </button>
          </div>
        </div>

        <!-- Major Tags -->
        <div class="form-section">
          <label class="section-label">专业方向（可多选）</label>
          <div class="tag-cloud">
            <button
              v-for="m in ['理工', '商科', '人文', '社科', '艺术']"
              :key="m"
              class="tag-btn"
              :class="{ active: form.academic.majors.includes(m) }"
              @click="toggleMajor(m)"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <!-- Score Input & Research -->
        <div class="form-row form-row--split">
          <div class="form-group">
            <label class="form-label">均分</label>
            <div class="score-input">
              <input
                v-model.number="form.academic.averageScore"
                type="number"
                class="form-input"
                min="0"
                max="100"
              >
              <span class="score-unit">/ 100</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">科研经历</label>
            <!-- Research List -->
            <div
              v-if="form.academic.research.length > 0"
              class="exp-list-compact"
            >
              <div
                v-for="(item, idx) in form.academic.research"
                :key="idx"
                class="exp-item-compact"
              >
                <div class="exp-info-compact">
                  <span class="exp-title">{{ item.name || '未命名项目' }}</span>
                  <span class="exp-meta">{{ item.role || '未指定角色' }} · {{ item.duration || '未指定时长' }}</span>
                </div>
                <button
                  class="exp-delete"
                  @click="removeResearch(idx)"
                >
                  ×
                </button>
              </div>
            </div>
            <button
              class="btn-add"
              @click="showResearchDialog = true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>添加科研经历</span>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="scene-nav">
          <button
            class="btn-nav btn-nav--prev"
            @click="goToScene(1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            class="btn-nav btn-nav--next"
            @click="goToScene(3)"
          >
            <span>继续</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SCENE 3: EXPERIENCE ═══════════════ -->
    <section
      class="scene scene--form"
      :class="{ 'is-active': currentScene === 3 }"
    >
      <div class="scene-content">
        <!-- Header -->
        <div class="scene-header">
          <span class="scene-num">03</span>
          <h2 class="scene-title">
            记录你的成长轨迹
          </h2>
          <div class="scene-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: 75%"
              />
            </div>
            <span class="progress-text">3 / 4</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="exp-tabs">
          <button
            v-for="tab in ['实习', '竞赛', '志愿']"
            :key="tab"
            class="exp-tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Experience List -->
        <div class="exp-content">
          <div
            v-if="activeTab === '实习'"
            class="exp-list"
          >
            <div
              v-for="(item, idx) in form.practice.internships"
              :key="idx"
              class="exp-item"
            >
              <div class="exp-info">
                <span class="exp-company">{{ item.company }}</span>
                <span class="exp-role">{{ item.position }}</span>
                <span class="exp-duration">{{ item.duration }}</span>
              </div>
              <button
                class="exp-delete"
                @click="removeInternship(idx)"
              >
                ×
              </button>
            </div>
            <button
              class="btn-add-exp"
              @click="showInternshipDialog = true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>添加实习经历</span>
            </button>
          </div>

          <div
            v-else-if="activeTab === '竞赛'"
            class="exp-list"
          >
            <div
              v-for="(item, idx) in form.practice.competitions"
              :key="idx"
              class="exp-item"
            >
              <div class="exp-info">
                <span class="exp-company">{{ item.name }}</span>
                <span class="exp-role">{{ item.level }}-{{ item.award }}</span>
                <span class="exp-duration">{{ item.year }}</span>
              </div>
              <button
                class="exp-delete"
                @click="removeCompetition(idx)"
              >
                ×
              </button>
            </div>
            <button
              class="btn-add-exp"
              @click="showCompetitionDialog = true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>添加竞赛经历</span>
            </button>
          </div>

          <div
            v-else
            class="exp-list"
          >
            <div
              v-for="(item, idx) in form.practice.volunteers"
              :key="idx"
              class="exp-item"
            >
              <div class="exp-info">
                <span class="exp-company">{{ item.organization }}</span>
                <span class="exp-role">{{ item.role }}</span>
                <span class="exp-duration">{{ item.hours }}</span>
              </div>
              <button
                class="exp-delete"
                @click="removeVolunteer(idx)"
              >
                ×
              </button>
            </div>
            <button
              class="btn-add-exp"
              @click="showVolunteerDialog = true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>添加志愿服务</span>
            </button>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <h3 class="cta-title">
            准备好解锁你的留学潜力了吗？
          </h3>
          <p class="cta-desc">
            AI 将基于你填写的所有信息，生成专属竞争力分析报告
          </p>
          <div class="cta-actions">
            <div class="provider-select">
              <select
                v-model="selectedProvider"
                class="select-provider"
              >
                <option
                  v-for="p in providers"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }}
                </option>
              </select>
            </div>
            <button
              class="btn-generate"
              :disabled="!isFormComplete"
              @click="generateReport"
            >
              <span>生成 AI 分析报告</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="scene-nav">
          <button
            class="btn-nav btn-nav--prev"
            @click="goToScene(2)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SCENE 4: REPORT ═══════════════ -->
    <section
      class="scene scene--report"
      :class="{ 'is-active': currentScene === 4 }"
    >
      <div class="scene-content">
        <!-- Score Hero -->
        <div class="score-hero">
          <div class="score-glow" />
          <div class="score-inner">
            <span class="score-label">综合竞争力评分</span>
            <div class="score-display">
              <span class="score-value">{{ animatedScore }}</span>
              <span class="score-max">/ 5.0</span>
            </div>
            <div class="score-bar">
              <div
                class="score-fill"
                :style="{ width: (overallScore / 5 * 100) + '%' }"
              />
            </div>
            <p class="score-comment">
              {{ getScoreComment(overallScore) }}
            </p>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Radar Chart -->
          <div class="dashboard-card">
            <h3 class="card-title">
              五维能力模型
            </h3>
            <div
              ref="radarRef"
              class="radar-chart"
            />
          </div>

          <!-- Dimension Details -->
          <div class="dashboard-card">
            <h3 class="card-title">
              维度深度解析
            </h3>
            <div class="dim-list">
              <div
                v-for="item in detailItems"
                :key="item.key"
                class="dim-item"
              >
                <div class="dim-header">
                  <span class="dim-name">{{ item.label }}</span>
                  <span class="dim-score">{{ item.score.toFixed(1) }}<span class="dim-max">/5</span></span>
                </div>
                <div class="dim-bar">
                  <div
                    class="dim-fill"
                    :class="'dim-fill--' + item.key"
                    :style="{ width: (item.score / 5 * 100) + '%' }"
                  />
                </div>
                <p class="dim-comment">
                  {{ item.comment }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Analysis -->
        <div class="ai-panel">
          <div
            class="ai-header"
            @click="showAiSection = !showAiSection"
          >
            <div class="ai-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                />
                <path d="M9 9h6v6H9z" />
              </svg>
              <span>AI 深度分析</span>
              <span
                v-if="aiStream.isStreaming"
                class="ai-badge"
              >实时生成中</span>
            </div>
            <svg
              class="ai-chevron"
              :class="{ open: showAiSection }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </div>

          <div
            v-show="showAiSection"
            class="ai-body"
          >
            <!-- Error State -->
            <div
              v-if="aiStream.error"
              class="ai-error"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                />
                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                />
              </svg>
              <p>{{ aiStream.error }}</p>
              <button
                class="btn-retry"
                @click="generateReport"
              >
                重试
              </button>
            </div>
            <!-- Content -->
            <div
              v-else-if="aiStream.content"
              class="ai-content"
              v-html="renderAiContent(aiStream.content)"
            />
            <!-- Loading State -->
            <div
              v-else-if="aiStream.isLoading"
              class="ai-loading"
            >
              <div class="loading-dots">
                <span /><span /><span />
              </div>
              <p>AI 正在分析你的背景...</p>
            </div>
            <!-- Empty State -->
            <div
              v-else
              class="ai-empty"
            >
              <p>点击"生成 AI 分析报告"获取个性化评估</p>
            </div>
          </div>
        </div>

        <!-- FAB Actions -->
        <div class="fab-actions">
          <button
            class="fab-btn"
            title="保存报告"
            @click="saveReport"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
          </button>
          <button
            class="fab-btn"
            title="重新填写"
            @click="resetForm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════ NAVIGATION DOTS ═══════════════ -->
    <nav class="nav-dots">
      <button
        v-for="i in 5"
        :key="i"
        class="nav-dot"
        :class="{ active: currentScene === i - 1 }"
        @click="goToScene(i - 1)"
      />
    </nav>

    <!-- ═══════════════ DIALOGS ═══════════════ -->
    <!-- Research Dialog -->
    <el-dialog
      v-model="showResearchDialog"
      title="添加科研经历"
      width="500px"
      class="experience-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="dialog-form-item">
          <label>项目名称</label>
          <input
            v-model="researchForm.name"
            type="text"
            placeholder="例如：基于深度学习的图像识别研究"
            class="dialog-input"
          >
        </div>
        <div class="dialog-form-row">
          <div class="dialog-form-item">
            <label>担任角色</label>
            <input
              v-model="researchForm.role"
              type="text"
              placeholder="例如：项目负责人"
              class="dialog-input"
            >
          </div>
          <div class="dialog-form-item">
            <label>项目时长</label>
            <input
              v-model="researchForm.duration"
              type="text"
              placeholder="例如：6个月"
              class="dialog-input"
            >
          </div>
        </div>
        <div class="dialog-form-item">
          <label>项目描述</label>
          <textarea
            v-model="researchForm.description"
            rows="3"
            placeholder="简要描述项目内容、你的贡献和成果..."
            class="dialog-textarea"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button
            class="btn-dialog-cancel"
            @click="showResearchDialog = false"
          >
            取消
          </button>
          <button
            class="btn-dialog-confirm"
            :disabled="!researchForm.name.trim()"
            @click="addResearch"
          >
            添加
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Internship Dialog -->
    <el-dialog
      v-model="showInternshipDialog"
      title="添加实习经历"
      width="500px"
      class="experience-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="dialog-form-item">
          <label>公司名称</label>
          <input
            v-model="internshipForm.company"
            type="text"
            placeholder="例如：腾讯科技"
            class="dialog-input"
          >
        </div>
        <div class="dialog-form-row">
          <div class="dialog-form-item">
            <label>职位</label>
            <input
              v-model="internshipForm.position"
              type="text"
              placeholder="例如：产品经理实习生"
              class="dialog-input"
            >
          </div>
          <div class="dialog-form-item">
            <label>实习时长</label>
            <input
              v-model="internshipForm.duration"
              type="text"
              placeholder="例如：3个月"
              class="dialog-input"
            >
          </div>
        </div>
        <div class="dialog-form-item">
          <label>工作内容</label>
          <textarea
            v-model="internshipForm.description"
            rows="3"
            placeholder="简要描述工作职责和成果..."
            class="dialog-textarea"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button
            class="btn-dialog-cancel"
            @click="showInternshipDialog = false"
          >
            取消
          </button>
          <button
            class="btn-dialog-confirm"
            :disabled="!internshipForm.company.trim()"
            @click="addInternship"
          >
            添加
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Competition Dialog -->
    <el-dialog
      v-model="showCompetitionDialog"
      title="添加竞赛经历"
      width="500px"
      class="experience-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="dialog-form-item">
          <label>竞赛名称</label>
          <input
            v-model="competitionForm.name"
            type="text"
            placeholder="例如：全国大学生数学建模竞赛"
            class="dialog-input"
          >
        </div>
        <div class="dialog-form-row">
          <div class="dialog-form-item">
            <label>竞赛级别</label>
            <el-select
              v-model="competitionForm.level"
              placeholder="选择级别"
              class="dialog-select"
            >
              <el-option
                label="国家级"
                value="国家级"
              />
              <el-option
                label="省级"
                value="省级"
              />
              <el-option
                label="校级"
                value="校级"
              />
              <el-option
                label="国际级"
                value="国际级"
              />
            </el-select>
          </div>
          <div class="dialog-form-item">
            <label>获奖等级</label>
            <el-select
              v-model="competitionForm.award"
              placeholder="选择奖项"
              class="dialog-select"
            >
              <el-option
                label="一等奖"
                value="一等奖"
              />
              <el-option
                label="二等奖"
                value="二等奖"
              />
              <el-option
                label="三等奖"
                value="三等奖"
              />
              <el-option
                label="优秀奖"
                value="优秀奖"
              />
              <el-option
                label="特等奖"
                value="特等奖"
              />
            </el-select>
          </div>
        </div>
        <div class="dialog-form-item">
          <label>获奖年份</label>
          <input
            v-model="competitionForm.year"
            type="text"
            placeholder="例如：2024"
            class="dialog-input"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button
            class="btn-dialog-cancel"
            @click="showCompetitionDialog = false"
          >
            取消
          </button>
          <button
            class="btn-dialog-confirm"
            :disabled="!competitionForm.name.trim()"
            @click="addCompetition"
          >
            添加
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Volunteer Dialog -->
    <el-dialog
      v-model="showVolunteerDialog"
      title="添加志愿服务"
      width="500px"
      class="experience-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="dialog-form-item">
          <label>组织名称</label>
          <input
            v-model="volunteerForm.organization"
            type="text"
            placeholder="例如：红十字会"
            class="dialog-input"
          >
        </div>
        <div class="dialog-form-row">
          <div class="dialog-form-item">
            <label>担任角色</label>
            <input
              v-model="volunteerForm.role"
              type="text"
              placeholder="例如：志愿者"
              class="dialog-input"
            >
          </div>
          <div class="dialog-form-item">
            <label>服务时长</label>
            <input
              v-model="volunteerForm.hours"
              type="text"
              placeholder="例如：50小时"
              class="dialog-input"
            >
          </div>
        </div>
        <div class="dialog-form-item">
          <label>服务内容</label>
          <textarea
            v-model="volunteerForm.description"
            rows="3"
            placeholder="简要描述志愿服务内容..."
            class="dialog-textarea"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button
            class="btn-dialog-cancel"
            @click="showVolunteerDialog = false"
          >
            取消
          </button>
          <button
            class="btn-dialog-confirm"
            :disabled="!volunteerForm.organization.trim()"
            @click="addVolunteer"
          >
            添加
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onActivated, onDeactivated, nextTick, watch } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([RadarChart, RadarComponent, TooltipComponent, LegendComponent, CanvasRenderer])
import { useAIStream } from '@/composables/useAIStream'
import { buildAssessmentPrompt } from '@/utils/ai-api'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAssessmentState } from '@/composables/useAssessmentState'
import { SCHOOL_COUNT_DISPLAY } from '@/data/schoolsData'

// ═══════════════ STATE ═══════════════
const currentScene = ref(0)
const particleCanvas = ref(null)
const radarRef = ref(null)
let radarChart = null

// Use global assessment state
const assessmentState = useAssessmentState()

// Form State - sync with global state
const form = reactive({
  basic: { ...assessmentState.form.value.basic },
  academic: { ...assessmentState.form.value.academic, majors: [...assessmentState.form.value.academic.majors], research: [...assessmentState.form.value.academic.research] },
  practice: {
    internships: [...assessmentState.form.value.practice.internships],
    competitions: [...assessmentState.form.value.practice.competitions],
    volunteers: [...assessmentState.form.value.practice.volunteers]
  }
})

const activeTab = ref('实习')
const selectedProvider = ref('default')
const showAiSection = ref(true)
const animatedScore = ref('0.0')
let _scoreGen = 0

// Dialog States
const showResearchDialog = ref(false)
const showInternshipDialog = ref(false)
const showCompetitionDialog = ref(false)
const showVolunteerDialog = ref(false)

// Form Models for Dialogs
const researchForm = reactive({ name: '', role: '', duration: '', description: '' })
const internshipForm = reactive({ company: '', position: '', duration: '', description: '' })
const competitionForm = reactive({ name: '', level: '', award: '', year: '' })
const volunteerForm = reactive({ organization: '', role: '', hours: '', description: '' })

// AI Stream State
const aiStream = reactive({
  isLoading: false,
  isStreaming: false,
  content: '',
  error: null
})

// Initialize AI Stream for assessment
const assessmentAI = useAIStream({
  taskId: 'assessment-report',
  enableThinking: true,
  onStateChange: (state) => {
    aiStream.isStreaming = state === 'streaming' || state === 'thinking'
    aiStream.isLoading = state === 'connecting' || state === 'thinking'
  },
  onStream: (content) => {
    aiStream.content = content
  },
  onComplete: (content) => {
    aiStream.content = content
    aiStream.isStreaming = false
    aiStream.isLoading = false
    // Save report to global state
    assessmentState.saveReport(content)
  },
  onError: (error) => {
    aiStream.error = error
    aiStream.isStreaming = false
    aiStream.isLoading = false
  }
})

// Providers
const providers = ref([
  { id: 'default', name: '智谱 GLM-4-Flash' },
  { id: 'openai', name: 'OpenAI GPT-4' }
])

// ═══════════════ COMPUTED ═══════════════
const gpaCircumference = 2 * Math.PI * 85
const gpaOffset = computed(() => {
  return gpaCircumference * (1 - form.basic.gpa / 4)
})

const overallScore = computed(() => {
  const scores = [
    Math.min(form.basic.gpa / 4 * 5, 5),
    form.academic.averageScore / 100 * 5,
    Math.min(form.academic.research.length * 1.5, 5),
    Math.min(form.practice.internships.length * 1.2, 5)
  ]
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

const detailItems = computed(() => [
  { key: 'academic', label: '学术能力', score: Math.min(form.basic.gpa / 4 * 5, 5), comment: getAcademicComment() },
  { key: 'language', label: '语言能力', score: 2.5, comment: '建议提升语言成绩' },
  { key: 'research', label: '科研经历', score: Math.min(form.academic.research.length * 1.5, 5), comment: '建议补充科研项目' },
  { key: 'practice', label: '实践经历', score: Math.min(form.practice.internships.length * 1.2, 5), comment: '实习经历良好' }
])

const isFormComplete = computed(() => {
  return form.basic.name && form.basic.university
})

// ═══════════════ METHODS ═══════════════
function goToScene(index) {
  currentScene.value = index
  // Save current scene to global state
  assessmentState.saveScene(index)
  if (index === 4) {
    nextTick(() => {
      // Delay chart init until scene transition completes (CSS transition is 600ms)
      setTimeout(() => {
        initRadarChart()
        animateScore(overallScore.value)
      }, 300)
    })
  }
}

function toggleMajor(major) {
  const idx = form.academic.majors.indexOf(major)
  if (idx > -1) form.academic.majors.splice(idx, 1)
  else form.academic.majors.push(major)
}

function addResearch() {
  if (researchForm.name.trim()) {
    form.academic.research.push({
      name: researchForm.name,
      role: researchForm.role,
      duration: researchForm.duration,
      description: researchForm.description
    })
    // Reset form
    researchForm.name = ''
    researchForm.role = ''
    researchForm.duration = ''
    researchForm.description = ''
    showResearchDialog.value = false
  }
}

function removeResearch(idx) {
  form.academic.research.splice(idx, 1)
}

function addInternship() {
  if (internshipForm.company.trim()) {
    form.practice.internships.push({
      company: internshipForm.company,
      position: internshipForm.position,
      duration: internshipForm.duration,
      description: internshipForm.description
    })
    // Reset form
    internshipForm.company = ''
    internshipForm.position = ''
    internshipForm.duration = ''
    internshipForm.description = ''
    showInternshipDialog.value = false
  }
}

function removeInternship(idx) {
  form.practice.internships.splice(idx, 1)
}

function addCompetition() {
  if (competitionForm.name.trim()) {
    form.practice.competitions.push({
      name: competitionForm.name,
      level: competitionForm.level,
      award: competitionForm.award,
      year: competitionForm.year
    })
    // Reset form
    competitionForm.name = ''
    competitionForm.level = ''
    competitionForm.award = ''
    competitionForm.year = ''
    showCompetitionDialog.value = false
  }
}

function removeCompetition(idx) {
  form.practice.competitions.splice(idx, 1)
}

function addVolunteer() {
  if (volunteerForm.organization.trim()) {
    form.practice.volunteers.push({
      organization: volunteerForm.organization,
      role: volunteerForm.role,
      hours: volunteerForm.hours,
      description: volunteerForm.description
    })
    // Reset form
    volunteerForm.organization = ''
    volunteerForm.role = ''
    volunteerForm.hours = ''
    volunteerForm.description = ''
    showVolunteerDialog.value = false
  }
}

function removeVolunteer(idx) {
  form.practice.volunteers.splice(idx, 1)
}

function animateScore(target) {
  const t = Number(target)
  if (!Number.isFinite(t)) return
  const clamped = Math.max(0, Math.min(5, t))
  const gen = ++_scoreGen
  const start = parseFloat(animatedScore.value) || 0
  const dur = 1200
  const t0 = Date.now()

  const tick = () => {
    if (gen !== _scoreGen) return
    const p = Math.min((Date.now() - t0) / dur, 1)
    const e = 1 - Math.pow(1 - p, 3)
    animatedScore.value = (start + (clamped - start) * e).toFixed(1)
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function getScoreComment(score) {
  if (score >= 4) return '你的背景具备冲刺 Top 10 院校的潜力'
  if (score >= 3) return '你的背景具备冲刺 Top 30 院校的潜力'
  if (score >= 2) return '建议针对性提升背景，冲击 Top 50 院校'
  return '建议系统规划，逐步提升竞争力'
}

function getAcademicComment() {
  if (form.basic.gpa >= 3.5) return 'GPA 优秀，院校背景良好'
  if (form.basic.gpa >= 3.0) return 'GPA 良好，有提升空间'
  return '建议提升 GPA 成绩'
}

function initRadarChart() {
  if (!radarRef.value) return
  if (radarChart) radarChart.dispose()

  radarChart = echarts.init(radarRef.value)
  radarChart.setOption({
    radar: {
      indicator: [
        { name: '学术能力', max: 5 },
        { name: '语言能力', max: 5 },
        { name: '科研经历', max: 5 },
        { name: '实践经历', max: 5 },
        { name: '综合素质', max: 5 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#64748B', fontSize: 12 },
      splitLine: { lineStyle: { color: '#E2E8F0' } },
      splitArea: { areaStyle: { color: ['#FFFFFF', '#F8FAFC', '#FFFFFF', '#F8FAFC'] } },
      axisLine: { lineStyle: { color: '#E2E8F0' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          Math.min(form.basic.gpa / 4 * 5, 5),
          2.5,
          Math.min(form.academic.research.length * 1.5, 5),
          Math.min(form.practice.internships.length * 1.2, 5),
          3.5
        ],
        areaStyle: { color: 'rgba(217, 119, 6, 0.2)' },
        lineStyle: { color: '#D97706', width: 2 },
        itemStyle: { color: '#D97706' }
      }]
    }]
  })
  // Ensure chart recalculates dimensions after container becomes visible
  requestAnimationFrame(() => radarChart.resize())
}

async function generateReport() {
  goToScene(4)
  aiStream.isLoading = true
  aiStream.isStreaming = true
  aiStream.content = ''
  aiStream.error = null

  // Calculate scores for the prompt
  const scores = {
    academic: Math.min(form.basic.gpa / 4 * 5, 5),
    language: 2.5,
    research: Math.min(form.academic.research.length * 1.5, 5),
    practice: Math.min(form.practice.internships.length * 1.2, 5),
    overall: overallScore.value
  }

  // Build the assessment prompt
  const prompt = buildAssessmentPrompt(form, scores)

  // Prepare messages for AI
  const messages = [
    { role: 'system', content: '你是一位资深的留学申请顾问，拥有15年申请评估经验。请提供客观、严谨的评估报告。' },
    { role: 'user', content: prompt }
  ]

  try {
    // Use the AI stream to generate the report
    await assessmentAI.generate(messages, {
      stream: true,
      enableThinking: true,
      temperature: 0.7
    })
  } catch (error) {
    console.error('AI generation failed:', error)
    aiStream.error = error.message || 'AI 分析生成失败，请稍后重试'
    aiStream.isLoading = false
    aiStream.isStreaming = false
  }
}

function renderAiContent(content) {
  if (!content) return ''
  try {
    const fixed = content.replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
    const html = marked(fixed, {
      breaks: true,
      gfm: true
    })
    return DOMPurify.sanitize(html)
  } catch {
    return content
  }
}

function saveReport() {
  ElMessage.success('报告已保存')
}

function resetForm() {
  form.basic.name = ''
  form.basic.university = ''
  form.basic.gpa = 3.0
  form.academic.majors = []
  form.academic.research = []
  form.practice.internships = []
  form.practice.competitions = []
  form.practice.volunteers = []
  aiStream.content = ''
  aiStream.error = null
  // Clear global state
  assessmentState.resetForm()
  goToScene(0)
}

// ═══════════════ PARTICLE BACKGROUND ═══════════════
function initParticles() {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight

  const particles = []
  const particleCount = 60

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    })
  }

  let mouseX = width / 2
  let mouseY = height / 2

  const mouseHandler = (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  document.addEventListener('mousemove', mouseHandler)
  let particleAnimFrame = 0

  function animate() {
    ctx.clearRect(0, 0, width, height)

    particles.forEach((p, i) => {
      // Mouse interaction
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        p.vx += dx * 0.0001
        p.vy += dy * 0.0001
      }

      p.x += p.vx
      p.y += p.vy

      // Boundary check
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(217, 119, 6, 0.25)'
      ctx.fill()

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2)
        if (d < 120) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.15 * (1 - d / 120)})`
          ctx.stroke()
        }
      }
    })

    particleAnimFrame = requestAnimationFrame(animate)
  }

  animate()

  const resizeHandler = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resizeHandler)
  
  return () => {
    cancelAnimationFrame(particleAnimFrame)
    document.removeEventListener('mousemove', mouseHandler)
    window.removeEventListener('resize', resizeHandler)
  }
}


// ═══════════════ WATCHERS ═══════════════
// Sync local form to global state whenever it changes
watch(() => form, () => {
  assessmentState.updateForm({
    basic: { ...form.basic },
    academic: {
      degree: form.academic.degree,
      majors: [...form.academic.majors],
      averageScore: form.academic.averageScore,
      research: [...form.academic.research]
    },
    practice: {
      internships: [...form.practice.internships],
      competitions: [...form.practice.competitions],
      volunteers: [...form.practice.volunteers]
    }
  })
}, { deep: true })

// ═══════════════ LIFECYCLE ═══════════════
let cleanupParticles = null

onMounted(() => {
  cleanupParticles = initParticles()
  // Sync from global state on mount
  if (assessmentState.hasData.value) {
    form.basic = { ...assessmentState.form.value.basic }
    form.academic = { ...assessmentState.form.value.academic, majors: [...assessmentState.form.value.academic.majors], research: [...assessmentState.form.value.academic.research] }
    form.practice.internships = [...assessmentState.form.value.practice.internships]
    form.practice.competitions = [...assessmentState.form.value.practice.competitions]
    form.practice.volunteers = [...assessmentState.form.value.practice.volunteers]
    // Restored previous assessment data
  }
  // Restore last scene if user has data and was not on hero page
  const savedScene = assessmentState.currentScene.value
  if (savedScene > 0) {
    currentScene.value = savedScene
    // Restored to previous scene
    // Initialize radar chart and score animation if restored to results page
    if (savedScene === 4) {
      nextTick(() => {
        setTimeout(() => {
          initRadarChart()
          animateScore(overallScore.value)
        }, 300)
      })
    }
  }
  // Restore AI report if exists and we're on results page
  const savedReport = assessmentState.report.value
  if (savedReport && savedScene === 4) {
    aiStream.content = savedReport
    // Restored previous AI report
  }
})

onUnmounted(() => {
  if (radarChart) radarChart.dispose()
  if (cleanupParticles) cleanupParticles()
})

// onActivated: called when navigating back via <keep-alive>.
// Resize the radar chart since the container was detached and re-attached.
onActivated(() => {
  if (radarChart) {
    requestAnimationFrame(() => radarChart.resize())
  }
})
</script>

<style scoped>
/* ═══════════════ BASE ═══════════════ */
.assessment-awwwards {
  width: 100%;
  min-height: 100vh;
  background: var(--color-background);
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.032;
  pointer-events: none;
  z-index: 9999;
}

/* ═══════════════ SCENE SYSTEM ═══════════════ */
.scene {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.scene.is-active {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
  z-index: 10;
}

.scene:not(.is-active) {
  transform: translateY(20px);
}

.scene-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 80px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ═══════════════ HERO SCENE ═══════════════ */
.scene--hero {
  background: linear-gradient(165deg, var(--color-slate-50) 0%, var(--color-slate-100) 40%, var(--color-background) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene--hero .scene-content {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.particle-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(var(--color-solid-rgb), 0.05);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-slate-500);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 32px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero-title {
  font-size: clamp(3rem, 10vw, 7rem);
  font-weight: 700;
  color: var(--color-solid);
  line-height: 1;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}

.title-line {
  display: block;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-slate-500);
  max-width: 480px;
  margin-bottom: 40px;
  line-height: 1.6;
}

/* Magnetic Button */
.btn-magnetic {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 40px;
  background: var(--color-solid);
  color: var(--color-background);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
  margin-bottom: 48px;
}

.btn-magnetic::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(var(--color-accent-rgb), 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 18px;
  z-index: -1;
}

.btn-magnetic:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(var(--color-solid-rgb), 0.2);
}

.btn-magnetic:hover::before {
  opacity: 1;
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.btn-magnetic:hover .btn-icon {
  transform: translateX(4px);
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

/* Hero Metrics */
.hero-metrics {
  display: flex;
  align-items: center;
  gap: 24px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-solid);
  font-family: 'JetBrains Mono', monospace;
}

.metric-label {
  font-size: 12px;
  color: var(--color-slate-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-divider {
  width: 1px;
  height: 32px;
  background: var(--color-slate-200);
}

/* ═══════════════ FORM SCENES ═══════════════ */
.scene--form {
  background: var(--color-background);
  padding-top: 40px;
}

.scene-header {
  margin-bottom: 48px;
}

.scene-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;
  display: block;
}

.scene-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-solid);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.scene-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-slate-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-text {
  font-size: 12px;
  color: var(--color-slate-500);
  font-family: 'JetBrains Mono', monospace;
}

/* Form Grid */
.form-grid {
  display: grid;
  gap: 32px;
  margin-bottom: 48px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group--center {
  align-items: center;
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.form-row--split {
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-solid);
}

.form-hint {
  font-size: 13px;
  color: var(--color-slate-400);
}

/* Inputs */
.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid var(--color-slate-200);
  border-radius: 12px;
  font-size: 15px;
  color: var(--color-solid);
  background: var(--color-background);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.form-input::placeholder {
  color: var(--color-slate-400);
}

/* Number Input */
.number-input {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border: 1px solid var(--color-slate-200);
  border-radius: 12px;
  width: fit-content;
}

.num-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-slate-100);
  border: none;
  border-radius: 8px;
  font-size: 18px;
  color: var(--color-solid);
  cursor: pointer;
  transition: background 0.2s;
}

.num-btn:hover {
  background: var(--color-slate-200);
}

.num-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-solid);
  min-width: 40px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
}

/* University Select - Element Plus Customization */
.university-select {
  width: 100%;
}

.university-select :deep(.el-input__wrapper) {
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--color-slate-200) inset;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.university-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-accent) inset, 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.university-select :deep(.el-input__inner) {
  font-size: 15px;
  color: var(--color-solid);
  height: auto;
}

.university-select :deep(.el-input__inner::placeholder) {
  color: var(--color-slate-400);
}

/* Dropdown menu customization */
.university-select :deep(.el-select-dropdown) {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(var(--color-solid-rgb), 0.15);
  border: 1px solid var(--color-slate-200);
}

.university-select :deep(.el-select-dropdown__item) {
  padding: 12px 18px;
  font-size: 14px;
  color: var(--color-solid);
  transition: all 0.2s;
}

.university-select :deep(.el-select-dropdown__item:hover) {
  background: var(--color-slate-50);
  color: var(--color-accent);
}

.university-select :deep(.el-select-dropdown__item.selected) {
  background: var(--color-solid);
  color: var(--color-background);
  font-weight: 500;
}

/* GPA Ring */
.gpa-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.gpa-ring {
  width: 200px;
  height: 200px;
}

.gpa-value {
  font-size: 48px;
  font-weight: 700;
  fill: var(--color-solid);
  font-family: 'JetBrains Mono', monospace;
}

.gpa-max {
  font-size: 16px;
  fill: var(--color-slate-400);
  font-family: 'JetBrains Mono', monospace;
}

.gpa-progress {
  transition: stroke-dashoffset 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.gpa-quick-btns {
  display: flex;
  gap: 12px;
}

.gpa-btn {
  padding: 10px 20px;
  border: 1px solid var(--color-slate-200);
  border-radius: 100px;
  background: var(--color-background);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.gpa-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.gpa-btn.active {
  background: var(--color-solid);
  border-color: var(--color-solid);
  color: var(--color-background);
}

/* Section Label */
.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-solid);
  margin-bottom: 16px;
  display: block;
}

.form-section {
  margin-bottom: 32px;
}

/* Pill Group */
.pill-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--color-slate-200);
  border-radius: 100px;
  background: var(--color-background);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn:hover {
  border-color: var(--color-slate-400);
}

.pill-btn.active {
  background: var(--color-solid);
  border-color: var(--color-solid);
  color: var(--color-background);
}

.pill-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 12px 24px;
  border: 1px solid var(--color-slate-200);
  border-radius: 12px;
  background: var(--color-background);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tag-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-background);
}

/* Score Input */
.score-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input .form-input {
  width: 100px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
}

.score-unit {
  font-size: 14px;
  color: var(--color-slate-400);
  font-family: 'JetBrains Mono', monospace;
}

/* Add Button */
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border: 1px dashed var(--color-slate-300);
  border-radius: 12px;
  background: var(--color-slate-50);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
}

.btn-add svg {
  width: 16px;
  height: 16px;
}

/* Compact Experience List (for Scene 2) */
.exp-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.exp-item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-slate-50);
  border-radius: 10px;
  border: 1px solid var(--color-slate-200);
}

.exp-info-compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-title {
  font-weight: 600;
  color: var(--color-solid);
  font-size: 14px;
}

.exp-meta {
  font-size: 12px;
  color: var(--color-slate-500);
}

/* ═══════════════ EXPERIENCE SCENE ═══════════════ */
.exp-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-slate-200);
  padding-bottom: 16px;
}

.exp-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.exp-tab::after {
  content: '';
  position: absolute;
  bottom: -17px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transition: transform 0.2s;
}

.exp-tab:hover {
  color: var(--color-solid);
}

.exp-tab.active {
  color: var(--color-accent);
}

.exp-tab.active::after {
  transform: scaleX(1);
}

/* Exp List */
.exp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.exp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-slate-50);
  border-radius: 12px;
  border: 1px solid var(--color-slate-200);
}

.exp-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.exp-company {
  font-weight: 600;
  color: var(--color-solid);
}

.exp-role {
  color: var(--color-slate-500);
}

.exp-duration {
  font-size: 13px;
  color: var(--color-slate-400);
  font-family: 'JetBrains Mono', monospace;
}

.exp-delete {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-slate-400);
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.exp-delete:hover {
  background: var(--color-danger-bg-light);
  color: var(--color-danger);
}

.btn-add-exp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 1px dashed var(--color-slate-300);
  border-radius: 12px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-exp:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-bg);
}

.btn-add-exp svg {
  width: 16px;
  height: 16px;
}

/* CTA Section */
.cta-section {
  margin-top: auto;
  padding: 32px;
  background: linear-gradient(135deg, var(--color-solid) 0%, var(--color-slate-800) 100%);
  border-radius: 20px;
  text-align: center;
  color: var(--color-background);
}

.cta-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.cta-desc {
  font-size: 14px;
  color: var(--color-slate-400);
  margin-bottom: 24px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.provider-select {
  position: relative;
}

.select-provider {
  padding: 14px 40px 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-background);
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

.select-provider option {
  background: var(--color-solid);
  color: var(--color-background);
}

.btn-generate {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--color-accent);
  border: none;
  border-radius: 12px;
  color: var(--color-background);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-generate:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(var(--color-accent-rgb), 0.4);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate svg {
  width: 18px;
  height: 18px;
}

/* ═══════════════ REPORT SCENE ═══════════════ */
.scene--report {
  background: var(--color-slate-50);
}

.scene--report .scene-content {
  padding-top: 60px;
  padding-bottom: 100px;
}

/* Score Hero */
.score-hero {
  position: relative;
  padding: 48px;
  background: linear-gradient(135deg, var(--color-solid) 0%, var(--color-slate-800) 100%);
  border-radius: 24px;
  text-align: center;
  color: var(--color-background);
  margin-bottom: 32px;
  overflow: hidden;
}

.score-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(var(--color-accent-rgb), 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.score-inner {
  position: relative;
  z-index: 1;
}

.score-label {
  font-size: 14px;
  color: var(--color-slate-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  display: block;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.score-value {
  font-size: clamp(4rem, 10vw, 6rem);
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.score-max {
  font-size: 24px;
  color: var(--color-slate-500);
  font-family: 'JetBrains Mono', monospace;
}

.score-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin: 0 auto 16px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.score-comment {
  font-size: 16px;
  color: var(--color-slate-200);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.dashboard-card {
  background: var(--color-background);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid var(--color-slate-200);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-solid);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.radar-chart {
  width: 100%;
  height: 280px;
}

/* Dimension List */
.dim-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dim-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dim-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-solid);
}

.dim-score {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-solid);
  font-family: 'JetBrains Mono', monospace;
}

.dim-max {
  font-size: 12px;
  color: var(--color-slate-400);
}

.dim-bar {
  height: 6px;
  background: var(--color-slate-200);
  border-radius: 3px;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.dim-fill--academic { background: linear-gradient(90deg, var(--color-solid), var(--color-slate-700)); }
.dim-fill--language { background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light)); }
.dim-fill--research { background: linear-gradient(90deg, var(--color-solid), var(--color-slate-700)); }
.dim-fill--practice { background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light)); }

.dim-comment {
  font-size: 12px;
  color: var(--color-slate-500);
}

/* AI Panel */
.ai-panel {
  background: var(--color-background);
  border-radius: 20px;
  border: 1px solid var(--color-slate-200);
  overflow: hidden;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.ai-header:hover {
  background: var(--color-slate-50);
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-solid);
}

.ai-title svg {
  width: 18px;
  height: 18px;
  color: var(--color-accent);
}

.ai-badge {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--color-accent);
  color: var(--color-background);
  border-radius: 100px;
  font-weight: 500;
}

.ai-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-slate-500);
  transition: transform 0.3s;
}

.ai-chevron.open {
  transform: rotate(180deg);
}

.ai-body {
  padding: 0 24px 24px;
}

.ai-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-slate-700);
}

.ai-content :deep(h1) {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-solid);
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-slate-200);
}

.ai-content :deep(h2) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-solid);
  margin: 20px 0 12px;
}

.ai-content :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-slate-700);
  margin: 16px 0 8px;
}

.ai-content :deep(p) {
  margin: 12px 0;
}

.ai-content :deep(ul),
.ai-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.ai-content :deep(li) {
  margin: 6px 0;
}

.ai-content :deep(strong) {
  color: var(--color-solid);
  font-weight: 600;
}

.ai-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  background: var(--color-slate-50);
  border-left: 4px solid var(--color-accent);
  border-radius: 0 8px 8px 0;
}

.ai-content :deep(code) {
  padding: 2px 6px;
  background: var(--color-slate-100);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--color-accent);
}

.ai-content :deep(pre) {
  padding: 16px;
  background: var(--color-solid);
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

.ai-content :deep(pre code) {
  background: transparent;
  color: var(--color-slate-200);
  padding: 0;
}

.ai-loading {
  text-align: center;
  padding: 40px;
}

.ai-error {
  text-align: center;
  padding: 40px;
  color: var(--color-danger);
}

.ai-error svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  stroke: var(--color-danger);
}

.ai-error p {
  margin-bottom: 20px;
  color: var(--color-danger);
}

.btn-retry {
  padding: 10px 24px;
  background: var(--color-danger);
  border: none;
  border-radius: 10px;
  color: var(--color-background);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: var(--color-danger-dark);
  transform: translateY(-1px);
}

.ai-empty {
  text-align: center;
  padding: 40px;
  color: var(--color-slate-500);
}

.loading-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 16px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ═══════════════ NAVIGATION ═══════════════ */
.scene-nav {
  display: flex;
  gap: 16px;
  margin-top: auto;
  padding-top: 32px;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: 1px solid var(--color-slate-200);
  border-radius: 12px;
  background: var(--color-background);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-solid);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.btn-nav svg {
  width: 18px;
  height: 18px;
}

.btn-nav--next {
  margin-left: auto;
  background: var(--color-solid);
  border-color: var(--color-solid);
  color: var(--color-background);
}

.btn-nav--next:hover {
  background: var(--color-slate-800);
  border-color: var(--color-slate-800);
  color: var(--color-background);
}

/* Nav Dots */
.nav-dots {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-slate-300);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s;
}

.nav-dot:hover {
  border-color: var(--color-slate-400);
}

.nav-dot.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: scale(1.2);
}

/* FAB Actions */
.fab-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.fab-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border: 1px solid var(--color-slate-200);
  border-radius: 50%;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.fab-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.fab-btn svg {
  width: 20px;
  height: 20px;
}

/* Stagger Animation */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
.stagger-item:nth-child(4) { animation-delay: 0.4s; }
.stagger-item:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════════════ DIALOG STYLES ═══════════════ */
.experience-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  margin: 0;
  border-bottom: 1px solid var(--color-slate-200);
}

.experience-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-solid);
}

.experience-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.experience-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid var(--color-slate-200);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dialog-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-form-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-solid);
}

.dialog-input {
  padding: 12px 16px;
  border: 1px solid var(--color-slate-200);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-solid);
  background: var(--color-background);
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.dialog-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.dialog-input::placeholder {
  color: var(--color-slate-400);
}

.dialog-textarea {
  padding: 12px 16px;
  border: 1px solid var(--color-slate-200);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-solid);
  background: var(--color-background);
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.dialog-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.dialog-textarea::placeholder {
  color: var(--color-slate-400);
}

.dialog-select {
  width: 100%;
}

.dialog-select :deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px var(--color-slate-200) inset;
}

.dialog-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-accent) inset, 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-dialog-cancel {
  padding: 10px 20px;
  border: 1px solid var(--color-slate-200);
  border-radius: 10px;
  background: var(--color-background);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-slate-500);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dialog-cancel:hover {
  border-color: var(--color-slate-300);
  color: var(--color-solid);
}

.btn-dialog-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: var(--color-solid);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-background);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dialog-confirm:hover:not(:disabled) {
  background: var(--color-slate-800);
  transform: translateY(-1px);
}

.btn-dialog-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .scene-content {
    padding: 20px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-metrics {
    flex-direction: column;
    gap: 16px;
  }

  .metric-divider {
    width: 40px;
    height: 1px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .nav-dots {
    right: 16px;
  }

  .fab-actions {
    bottom: 20px;
    right: 20px;
  }

  .score-hero {
    padding: 32px 24px;
  }

  .cta-actions {
    flex-direction: column;
  }

  .dialog-form-row {
    grid-template-columns: 1fr;
  }

  .experience-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }
}
</style>