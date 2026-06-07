<template>
  <el-container
    class="app-container"
    :class="{ 'is-immersive': isImmersivePage, 'is-home': isHomePage }"
  >
    <el-header
      v-if="!isImmersivePage"
      class="app-header"
    >
      <div class="header-content">
        <!-- 左侧：Logo -->
        <div class="header-left">
          <Logo @click="router.push('/')" />
        </div>

        <!-- 中间：桌面端导航菜单 -->
        <nav class="nav-menu-container desktop-nav">
          <router-link
            v-for="item in coreMenuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
          >
            {{ item.name }}
          </router-link>
          <el-dropdown
            v-if="moreMenuItems.length > 0"
            trigger="hover"
            placement="bottom-end"
            class="more-dropdown"
          >
            <span class="nav-item more-trigger">
              更多
            </span>
            <template #dropdown>
              <el-dropdown-menu class="more-menu">
                <el-dropdown-item
                  v-for="item in moreMenuItems"
                  :key="item.path"
                  :class="{ 'is-active': activeMenu === item.path }"
                  @click="navigateTo(item.path)"
                >
                  {{ item.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </nav>

        <!-- 右侧：公告 + 设置按钮 + 移动端汉堡菜单按钮 -->
        <div class="header-right">
          <AnnouncementButton />
          <el-tooltip
            content="AI配置"
            placement="bottom"
            :show-after="200"
          >
            <button
              class="ai-config-btn"
              :class="{ 'is-active': isAIConfigPage }"
              aria-label="AI配置"
              @click="router.push('/ai-config')"
            >
              <el-icon :size="18">
                <Cpu />
              </el-icon>
            </button>
          </el-tooltip>
          <button
            class="hamburger-btn"
            aria-label="打开菜单"
            @click="mobileMenuVisible = true"
          >
            <el-icon :size="24">
              <Expand />
            </el-icon>
          </button>
        </div>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            v-if="route.meta.keepAlive"
            :key="route.fullPath"
          />
        </keep-alive>
        <component
          :is="Component"
          v-if="!route.meta.keepAlive"
          :key="route.fullPath"
        />
      </router-view>
    </el-main>

    <!-- 移动端导航抽屉 -->
    <el-drawer
      v-model="mobileMenuVisible"
      direction="rtl"
      size="280px"
      :show-close="false"
      class="mobile-menu-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title">导航菜单</span>
          <button
            class="drawer-close-btn"
            aria-label="关闭菜单"
            @click="mobileMenuVisible = false"
          >
            <el-icon :size="20">
              <Close />
            </el-icon>
          </button>
        </div>
      </template>
      <div class="mobile-menu-list">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="mobile-menu-item"
          :class="{ 'is-active': activeMenu === item.path }"
          @click="navigateTo(item.path)"
        >
          <el-icon><Menu /></el-icon>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </el-drawer>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="guideVisible"
      title="使用指南"
      width="60%"
      class="guide-dialog"
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4><el-icon><Document /></el-icon> 快速开始（6个步骤）</h4>
          <ol>
            <li><strong>填写背景评估</strong>：在"背景评估"页面完成您的个人信息、学术背景和实践经历的填写</li>
            <li><strong>获取评估报告</strong>：系统会自动生成您的竞争力雷达图和详细评语</li>
            <li><strong>AI智能选校</strong>：基于您的评估结果，系统推荐匹配的院校清单</li>
            <li><strong>时间规划</strong>：查看动态生成的时间线，管理申请任务</li>
            <li><strong>材料准备</strong>：使用文书助手和材料清单，赋能申请全流程</li>
            <li><strong>AI智能对话</strong>：与多角色AI智能体对话，获取专业申请建议</li>
          </ol>
        </div>
        <div class="guide-section">
          <h4><el-icon><Cpu /></el-icon> AI功能使用</h4>
          <p>本平台支持多个AI供应商（OpenAI、Anthropic、DeepSeek等），请先在"AI配置"页面完成API配置：</p>
          <ul>
            <li>配置Base URL、API Key和模型名称</li>
            <li>使用"测试连接"验证配置有效性</li>
            <li>在AI对话和文书生成功能中选择已配置的provider</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4><el-icon><DataLine /></el-icon> 数据持久化</h4>
          <p>您的所有数据（评估结果、选校清单、对话历史等）均保存在浏览器本地存储中：</p>
          <ul>
            <li>数据不会上传到服务器，保护您的隐私</li>
            <li>清除浏览器数据会导致信息丢失，请及时导出重要内容</li>
            <li>支持导出对话历史、材料清单等</li>
          </ul>
        </div>
      </div>
    </el-dialog>

    <!-- 关于对话框 -->
    <el-dialog
      v-model="aboutVisible"
      title="关于我们"
      width="50%"
    >
      <p>智途 AstroPath - 智能留学规划平台，通过AI分析用户背景，生成动态的、可执行的个性化留学规划路径图。</p>
      <p>技术栈：Vue 3 + Vite + Element-Plus + ECharts</p>
    </el-dialog>

    <!-- 联系对话框 -->
    <el-dialog
      v-model="contactVisible"
      title="联系方式"
      width="40%"
    >
      <p>如有问题或建议，欢迎联系我们：</p>
      <p>邮箱：contact@example.com</p>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Menu, Close, Document, Cpu, DataLine } from '@element-plus/icons-vue'
import Logo from './components/common/Logo.vue'
import AnnouncementButton from './components/common/AnnouncementButton.vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const isImmersivePage = computed(() => route.path === '/ai-chat' || route.path === '/story' || route.path === '/result')
const isHomePage = computed(() => route.path === '/')
const isAIConfigPage = computed(() => route.path === '/ai-config')

const mobileMenuVisible = ref(false)
const guideVisible = ref(false)
const aboutVisible = ref(false)
const contactVisible = ref(false)

const coreMenuItems = [
  { path: '/', name: '首页' },
  { path: '/assessment', name: '背景评估' },
  { path: '/school-recommendation', name: '选校推荐' },
  { path: '/timeline', name: '时间规划' },
  { path: '/materials', name: '材料中心' },
  { path: '/university-database', name: '院校数据库' },
  { path: '/ai-chat', name: 'AI对话' },
]

const moreMenuItems = [
  { path: '/story', name: '项目故事' },
  { path: '/result', name: '比赛结果' },
]

const menuItems = [...coreMenuItems, ...moreMenuItems]

const navigateTo = (path) => {
  router.push(path)
  mobileMenuVisible.value = false
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 0 24px;
  box-shadow:
    0 1px 2px rgba(30, 58, 95, 0.04),
    0 4px 16px rgba(30, 58, 95, 0.04);
  border-bottom: 1px solid rgba(30, 58, 95, 0.06);
  position: sticky;
  top: 0;
  z-index: 9999;
}

.header-content {
  max-width: 1800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.nav-menu-container {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  padding: 0 18px;
  height: 60px;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  border-bottom: none;
  transition: color 0.25s ease;
  position: relative;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2px;
  background: var(--color-slate-700);
  border-radius: 1px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  color: var(--color-text-primary);
}

.nav-item:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.nav-item.is-active,
.nav-item.router-link-active {
  color: var(--color-text-primary);
  font-weight: 600;
}

.nav-item.is-active::after,
.nav-item.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

.more-dropdown {
  margin-left: 4px;
}

.more-trigger {
  cursor: pointer;
  outline: none;
}

.more-trigger:hover {
  color: var(--color-text-primary);
}

.more-trigger:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.more-menu {
  min-width: 140px;
  padding: 6px 0;
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(30, 58, 95, 0.12),
    0 1px 3px rgba(30, 58, 95, 0.08);
  border: 1px solid rgba(30, 58, 95, 0.08);
}

.more-menu :deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.more-menu :deep(.el-dropdown-menu__item:hover) {
  background: var(--color-slate-50);
  color: var(--color-text-primary);
}

.more-menu :deep(.el-dropdown-menu__item.is-active) {
  color: var(--color-text-primary);
  font-weight: 600;
  background: var(--color-slate-50);
}

.nav-menu {
  border-bottom: none;
  background: transparent;
  flex: 1;
  overflow-x: auto;
  /* Element Plus菜单变量覆盖 */
  --el-menu-active-color: var(--color-slate-700);
  --el-menu-hover-color: var(--color-slate-700);
  --el-menu-text-color: var(--color-text-secondary);
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
}

.nav-menu :deep(.el-menu) {
  /* 菜单项水平居中 */
  justify-content: center;
}

/* AI配置按钮 - 圆形 */
.ai-config-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(240, 244, 248, 0.9) 0%, rgba(232, 238, 245, 0.9) 100%);
  border: 1.5px solid rgba(30, 58, 95, 0.12);
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  color: var(--color-slate-700);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 2px 6px rgba(30, 58, 95, 0.06);
}

.ai-config-btn:hover {
  background: var(--color-solid);
  border-color: transparent;
  color: white;
  transform: scale(1.08) translateY(-1px);
  box-shadow:
    0 6px 20px rgba(15, 23, 42, 0.2),
    0 2px 6px rgba(15, 23, 42, 0.12);
}

.ai-config-btn.is-active {
  background: var(--color-solid);
  border-color: transparent;
  color: white;
  box-shadow:
    0 0 0 3px rgba(30, 58, 95, 0.12),
    0 6px 20px rgba(30, 58, 95, 0.25),
    0 2px 6px rgba(30, 58, 95, 0.15);
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: none;
  background: linear-gradient(135deg, rgba(240, 244, 248, 0.9) 0%, rgba(232, 238, 245, 0.9) 100%);
  border: 1.5px solid rgba(30, 58, 95, 0.1);
  border-radius: var(--radius-lg);
  padding: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 2px 6px rgba(30, 58, 95, 0.04);
}

.hamburger-btn:hover {
  background: linear-gradient(135deg, rgba(30, 58, 95, 0.06) 0%, rgba(30, 58, 95, 0.03) 100%);
  border-color: rgba(30, 58, 95, 0.15);
  color: var(--color-slate-700);
  transform: translateY(-1px);
}

/* 响应式布局 */
@media (max-width: 992px) {
  .header-content {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .nav-menu,
  .nav-menu-container {
    display: none;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.nav-menu::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.nav-menu :deep(.el-menu-item) {
  color: var(--color-text-secondary);
  border-bottom: none;
  padding: 0 12px;
  letter-spacing: 0.2px;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: transparent;
  color: var(--color-text-primary);
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: transparent !important;
  color: var(--color-text-primary) !important;
  font-weight: 600;
}

.app-main {
  flex: 1;
  padding: 0;
  background: var(--color-background);
}

.el-main {
  padding: 0 !important;
}

.app-container.is-immersive .app-main,
.app-container.is-home .app-main {
  padding: 0;
  background: var(--color-surface);
}

/* 移动端菜单抽屉 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.drawer-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
}

.drawer-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #303133;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.mobile-menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  font-size: 16px;
  transition: all 0.2s;
}

.mobile-menu-item:hover {
  background: var(--color-slate-50);
  color: var(--color-slate-700);
}

.mobile-menu-item.is-active {
  background: var(--color-slate-50);
  color: var(--color-slate-700);
  font-weight: 600;
}

.mobile-menu-item .el-icon {
  font-size: 20px;
}

/* 桌面端导航 - 默认显示 */
.desktop-nav {
  display: flex;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 15px;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--color-accent-light);
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
}

/* ===== 使用指南对话框样式 ===== */
:deep(.guide-dialog .el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}

.guide-content {
  padding: 10px 0;
}

.guide-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.guide-section:last-child {
  margin-bottom: 0;
}

.guide-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.guide-section .el-icon {
  color: var(--color-slate-700);
  font-size: 18px;
}

.guide-section p,
.guide-section ul,
.guide-section ol {
  margin: 0;
  padding-left: 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.guide-section li {
  margin-bottom: 8px;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
}
</style>
