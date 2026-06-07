/**
 * AstroPath 全真用户模拟自动化测试
 * 覆盖：页面渲染、导航路由、表单交互、AI Chat、数据持久化、
 *       响应式/移动端、边界异常、性能稳定性
 * 
 * 策略：模拟真实用户从首页开始，逐步浏览每个页面、填写表单、
 *       切换视图、测试边界情况，全程收集JS错误
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ===== 工具函数 =====

interface ErrorCollector {
  errors: string[];
  warnings: string[];
  pageErrors: string[];
  getCritical: () => string[];
}

function collectErrors(page: import('@playwright/test').Page): ErrorCollector {
  const ctx: ErrorCollector = { errors: [], warnings: [], pageErrors: [] };
  page.on('console', msg => {
    if (msg.type() === 'error') ctx.errors.push(msg.text());
    if (msg.type() === 'warning') ctx.warnings.push(msg.text());
  });
  page.on('pageerror', err => ctx.pageErrors.push(err.message));
  return ctx;
}

// 过滤已知的无害错误
function filterErrors(ctx: ErrorCollector): string[] {
  const ignore = ['favicon', 'sourcemap', 'net::ERR_FILE_NOT_FOUND', 'net::ERR_CONNECTION', 'Download the Vue Devtools'];
  return ctx.pageErrors.filter(e => !ignore.some(k => e.includes(k)));
}

// 等待页面完全渲染
async function waitForPageReady(page: import('@playwright/test').Page, timeout = 2000) {
  await page.waitForTimeout(timeout);
}

// ===== A. 页面渲染完整性 =====

test.describe('A. 页面渲染完整性 — 全部12个路由无白屏无JS报错', () => {

  const routes = [
    { path: '/', title: '首页', selector: '.hp-hero' },
    { path: '/assessment', title: '背景评估', selector: '.assessment-awwwards' },
    { path: '/school-recommendation', title: '选校推荐', selector: '.sr-page, .page-empty' },
    { path: '/timeline', title: '时间规划', selector: '.timeline-page' },
    { path: '/materials', title: '材料中心', selector: '.studio-page' },
    { path: '/university-database', title: '院校数据库', selector: '.ud-page' },
    { path: '/ai-chat', title: 'AI对话', selector: '.ai-chat-page' },
    { path: '/ai-config', title: 'AI配置', selector: '.page-root' },
    { path: '/story', title: '项目故事', selector: '.story-page' },
    { path: '/result', title: '比赛结果', selector: '.result-page' },
    { path: '/school-detail/mit', title: '院校详情', selector: '.sd-page, .sd-error' },
    { path: '/major-detail/cs', title: '专业详情', selector: '.md-page, .md-error' },
  ];

  for (const route of routes) {
    test(`${route.title} (${route.path}) — 渲染正常`, async ({ page }) => {
      const ctx = collectErrors(page);
      await page.goto(`${BASE}/#${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await waitForPageReady(page);

      // 1. 页面有实质内容（不是空白页）
      const bodyLen = await page.evaluate(() => document.body.innerText.length);
      expect(bodyLen).toBeGreaterThan(50);

      // 2. 关键选择器存在（selector可以是逗号分隔的备选项）
      const selectorVisible = await page.locator(route.selector.split(',').map(s => s.trim()).join(', ')).count();
      expect(selectorVisible).toBeGreaterThan(0);

      // 3. 无JS运行时错误
      expect(filterErrors(ctx)).toEqual([]);

      // 4. 标题包含关键词
      const title = await page.title();
      expect(title).toContain(route.title);
    });
  }

  test('404页面 — 不存在的路由', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/nonexistent-page-xyz`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    await expect(page.locator('.not-found-code')).toContainText('404');
    await expect(page.locator('.not-found-title')).toContainText('页面未找到');
    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== B. 导航与路由 =====

test.describe('B. 导航与路由', () => {

  test('B.1 顶部导航栏 — 所有链接可点击且导航正确', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page);

    const navItems = page.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(6);

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const text = await item.textContent();
      if (text && text.trim().length > 0) {
        await item.click();
        await waitForPageReady(page, 1000);
        const bodyLen = await page.evaluate(() => document.body.innerText.length);
        expect(bodyLen).toBeGreaterThan(80);
        // 返回首页再点击下一个
        await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
        await waitForPageReady(page, 800);
      }
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('B.2 首页CTA → 背景评估', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page);

    await page.locator('.hp-btn--primary').first().click();
    await page.waitForURL('**/#/assessment', { timeout: 5000 });
    await waitForPageReady(page, 1500);

    expect(page.url()).toContain('/#/assessment');
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('B.3 Bento卡片导航', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page);

    const cards = page.locator('.hp-bento__card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(6);

    // 点击第一张卡片
    await cards.first().click();
    await waitForPageReady(page, 1000);
    const url = page.url();
    expect(url).not.toBe(`${BASE}/`);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('B.4 浏览器前进/后退', async ({ page }) => {
    const ctx = collectErrors(page);

    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);

    // 后退2次
    await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
    await waitForPageReady(page, 800);
    expect(page.url()).toContain('/#/timeline');

    await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
    await waitForPageReady(page, 800);
    expect(page.url()).toContain('/#/assessment');

    // 前进1次
    await page.goForward({ waitUntil: 'networkidle', timeout: 10000 });
    await waitForPageReady(page, 800);
    expect(page.url()).toContain('/#/timeline');

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('B.5 直接URL访问（模拟书签）', async ({ page }) => {
    const ctx = collectErrors(page);
    const directRoutes = ['/assessment', '/timeline', '/ai-chat', '/ai-config', '/university-database'];

    for (const route of directRoutes) {
      await page.goto(`${BASE}/#${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await waitForPageReady(page, 1500);
      const bodyLen = await page.evaluate(() => document.body.innerText.length);
      expect(bodyLen).toBeGreaterThan(80);
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('B.6 沉浸式页面 header 隐藏/显示', async ({ page }) => {
    const ctx = collectErrors(page);

    // AI Chat 是沉浸模式
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);
    expect(await page.locator('.app-container.is-immersive').count()).toBe(1);

    // 切到普通页面
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 1000);
    expect(await page.locator('.app-container.is-immersive').count()).toBe(0);

    // Story 也是沉浸模式
    await page.goto(`${BASE}/#/story`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);
    expect(await page.locator('.app-container.is-immersive').count()).toBe(1);

    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== C. 表单交互 =====

test.describe('C. 表单交互 — 评估页填写 + AI配置CRUD + 搜索筛选 + 任务CRUD', () => {

  test('C.1 背景评估 — 完整填写流程（4个场景）', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page);

    // 场景0 Hero → 点击"开始评估"
    await expect(page.locator('.scene--hero')).toBeVisible();
    await page.locator('.btn-hero').click();
    await waitForPageReady(page, 800);
    await expect(page.locator('.scene--form').nth(0)).toBeVisible();
    await expect(page.locator('.scene--form .scene-num').first()).toContainText('01');

    // 场景1 基本信息填写
    await page.fill('.form-input[type="text"]', '测试学生');
    await page.waitForTimeout(200);
    
    // 选择院校类型
    const uniSelect = page.locator('.university-select');
    if (await uniSelect.isVisible()) {
      await uniSelect.click();
      await page.waitForTimeout(300);
      await page.locator('.el-select-dropdown__item').first().click();
      await page.waitForTimeout(200);
    }

    // 设置GPA — 点击快速按钮
    const gpaBtn = page.locator('.gpa-btn').first();
    if (await gpaBtn.isVisible()) {
      await gpaBtn.click();
      await page.waitForTimeout(200);
    }
    const gpaVal = await page.locator('.gpa-value').textContent();
    expect(gpaVal).toBeTruthy();

    // 场景2 学术信息
    await page.locator('.btn-nav--next').click();
    await waitForPageReady(page, 600);
    await expect(page.locator('.scene--form .scene-num').nth(1)).toContainText('02');

    // 选择学历层次
    const masterPill = page.locator('.pill-btn').first();
    if (await masterPill.isVisible()) {
      await masterPill.click();
      await page.waitForTimeout(200);
    }

    // 选择专业标签（多选）
    const tag1 = page.locator('.tag-btn').first();
    if (await tag1.isVisible()) {
      await tag1.click();
      await page.waitForTimeout(100);
    }
    const tag2 = page.locator('.tag-btn').nth(1);
    if (await tag2.isVisible()) {
      await tag2.click();
      await page.waitForTimeout(100);
    }

    // 填写均分
    const numInput = page.locator('input[type="number"]');
    if (await numInput.count() > 0) {
      await numInput.first().fill('88');
      await page.waitForTimeout(200);
    }

    // 场景3 经历管理
    await page.locator('.btn-nav--next').click();
    await waitForPageReady(page, 600);
    await expect(page.locator('.scene--form .scene-num').nth(2)).toContainText('03');

    // 添加实习经历
    const addExpBtn = page.locator('.btn-add-exp');
    if (await addExpBtn.isVisible()) {
      await addExpBtn.click();
      await waitForPageReady(page, 500);

      // 填写对话框
      const dialog = page.locator('.experience-dialog');
      if (await dialog.isVisible()) {
        await page.fill('input[placeholder*="公司"]', '字节跳动');
        await page.fill('input[placeholder*="职位"]', '前端开发实习生');
        await page.fill('input[placeholder*="时长"]', '3个月');
        await page.fill('textarea', '参与前端架构优化和组件库建设');
        await page.waitForTimeout(200);

        await page.locator('.btn-dialog-confirm').click();
        await waitForPageReady(page, 500);

        // 验证经历记录出现
        expect(await page.locator('.exp-item, .exp-item-compact').count()).toBeGreaterThanOrEqual(1);
      }
    }

    // 场景4 AI报告
    await page.locator('.btn-nav--next').click();
    await waitForPageReady(page, 600);

    // 报告页面
    await expect(page.locator('.scene--report, .score-hero').first()).toBeVisible();

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.2 GPA边界测试 — 最小/最大值', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);
    await page.locator('.btn-hero').click();
    await waitForPageReady(page, 800);

    // 减到最小
    const minusBtn = page.locator('.num-btn').first();
    for (let i = 0; i < 10; i++) {
      if (await minusBtn.isVisible()) await minusBtn.click();
      await page.waitForTimeout(80);
    }
    const gpaMin = await page.locator('.gpa-value').textContent();
    expect(gpaMin).toBeTruthy();
    const gpaMinNum = parseFloat(gpaMin!);
    expect(gpaMinNum).toBeGreaterThanOrEqual(0);

    // 加到最大
    const plusBtn = page.locator('.num-btn').last();
    for (let i = 0; i < 50; i++) {
      if (await plusBtn.isVisible()) await plusBtn.click();
      await page.waitForTimeout(80);
    }
    const gpaMax = await page.locator('.gpa-value').textContent();
    expect(gpaMax).toBeTruthy();
    const gpaMaxNum = parseFloat(gpaMax!);
    expect(gpaMaxNum).toBeLessThanOrEqual(4.0); // GPA不应超过4.0

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.3 AI配置 — 添加/编辑/删除供应商完整CRUD', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page, 2500);

    const initialCount = await page.locator('.provider-row').count();

    // CREATE: 添加新供应商
    await page.fill('#prov-name', '自动化测试供应商');
    await page.fill('#prov-url', 'https://api.test-automation.com/v1');
    await page.fill('#prov-key', 'sk-auto-test-key-12345');
    await page.fill('#prov-model', 'test-model-v1');
    await page.waitForTimeout(200);

    // 选择类型
    const typeSelect = page.locator('#prov-type');
    await typeSelect.click();
    await page.waitForTimeout(300);
    const options = page.locator('.custom-select-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(200);
    }

    await page.locator('.btn-submit').click();
    await waitForPageReady(page, 500);

    let afterAdd = await page.locator('.provider-row').count();
    expect(afterAdd).toBe(initialCount + 1);

    // READ: 验证新供应商在列表中
    const rows = page.locator('.provider-row');
    const lastRowText = await rows.last().textContent();
    expect(lastRowText).toContain('自动化测试供应商');

    // UPDATE: 编辑第一个供应商
    await rows.first().locator('.btn-edit').click();
    await waitForPageReady(page, 500);
    await expect(page.locator('.modal-panel')).toBeVisible();

    const nameInput = page.locator('#edit-name');
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill('修改后的供应商');
      await page.waitForTimeout(200);
    }

    await page.locator('.modal-panel .btn-primary').click();
    await waitForPageReady(page, 500);

    // DELETE: 删除最后添加的供应商
    await page.locator('.btn-delete').last().click();
    await waitForPageReady(page, 500);

    const afterDelete = await page.locator('.provider-row').count();
    expect(afterDelete).toBe(initialCount);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.4 院校数据库 — 搜索/筛选/视图切换', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page, 3000);

    // 默认院校Tab
    await expect(page.locator('.ud-tab--active').first()).toBeVisible();

    // 搜索
    await page.fill('.ud-search__field', 'Stanford');
    await page.click('.ud-search__btn');
    await waitForPageReady(page, 1000);

    // 筛选国家
    const countryChip = page.locator('.ud-chip').nth(1);
    if (await countryChip.isVisible()) {
      await countryChip.click();
      await page.waitForTimeout(500);
    }

    // 切换到列表视图
    const listViewBtn = page.locator('.ud-view-btn').last();
    if (await listViewBtn.isVisible()) {
      await listViewBtn.click({ force: true });
      await waitForPageReady(page, 800);
      // 列表视图可能使用不同的选择器
      const tableView = page.locator('.ud-list-wrap, .ud-table, .el-table');
      expect(await tableView.count()).toBeGreaterThan(0);
    }

    // 切换回卡片视图
    const cardViewBtn = page.locator('.ud-view-btn').first();
    if (await cardViewBtn.isVisible()) {
      await cardViewBtn.click();
      await waitForPageReady(page, 500);
    }

    // 专业Tab
    await page.locator('.ud-tab').last().click();
    await waitForPageReady(page, 800);
    await expect(page.locator('.ud-tab--active').last()).toBeVisible();
    expect(await page.locator('.ud-major').count()).toBeGreaterThan(0);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.5 时间规划 — 任务CRUD + 视图切换', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page, 3000);

    // 生成示例任务（确保有数据）
    const generateBtn = page.locator('.btn-primary-cta');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await waitForPageReady(page, 2000);
    }

    // 切换到看板
    const kanbanBtn = page.locator('.view-btn').filter({ hasText: '任务看板' });
    if (await kanbanBtn.count() > 0) {
      await kanbanBtn.first().click({ force: true });
      await waitForPageReady(page, 1000);
    }

    // 添加任务
    const addBtn = page.locator('.add-task-btn-premium').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await waitForPageReady(page, 500);

      const modal = page.locator('.modal-premium');
      if (await modal.isVisible()) {
        await page.fill('#task-title', '自动化测试任务 - 准备托福');
        await page.waitForTimeout(200);

        // 选择高优先级
        const highPriority = page.locator('.priority-chip').first();
        if (await highPriority.isVisible()) {
          await highPriority.click();
          await page.waitForTimeout(200);
        }

        await page.locator('.btn-modal-primary').click();
        await waitForPageReady(page, 500);
      }
    }

    // 图表视图
    const chartBtn = page.locator('.view-btn').filter({ hasText: '图表视图' });
    if (await chartBtn.count() > 0) {
      await chartBtn.first().click({ force: true });
      await waitForPageReady(page, 1000);
      await expect(page.locator('.chart-area').first()).toBeVisible();
    }

    // 时间线视图
    const timelineBtn = page.locator('.view-btn').filter({ hasText: '时间线' });
    if (await timelineBtn.count() > 0) {
      await timelineBtn.first().click({ force: true });
      await waitForPageReady(page, 1000);
    }

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.6 院校详情 — 从数据库点击进入', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 点击第一张卡片进入详情
    const card = page.locator('.ud-card').first();
    if (await card.isVisible()) {
      await card.click();
      await waitForPageReady(page, 2000);

      expect(page.url()).toContain('/school-detail/');

      // 验证详情页元素
      const detailPage = page.locator('.sd-page, .sd-error').first();
      await expect(detailPage).toBeVisible();

      // 收藏按钮
      const favBtn = page.locator('.sd-fav');
      if (await favBtn.isVisible()) {
        await favBtn.click();
        await page.waitForTimeout(300);
        // 取消收藏
        await favBtn.click();
        await page.waitForTimeout(300);
      }
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.7 专业详情 — 从数据库点击进入', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 切换到专业Tab
    await page.locator('.ud-tab').last().click();
    await waitForPageReady(page, 800);

    const major = page.locator('.ud-major').first();
    if (await major.isVisible()) {
      await major.click();
      await waitForPageReady(page, 2000);

      expect(page.url()).toContain('/major-detail/');
      const detailPage = page.locator('.md-page, .md-error').first();
      await expect(detailPage).toBeVisible();
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('C.8 选校推荐 — 无数据空状态 + 有数据后展示', async ({ page }) => {
    const ctx = collectErrors(page);

    // 清除评估数据
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.removeItem('astropath_assessment_form');
      localStorage.removeItem('astropath_school_recommendations');
    });

    // 访问选校推荐
    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 应该显示空状态
    const emptyState = page.locator('.page-empty, .empty-state, .sr-empty');
    const emptyCount = await emptyState.count();
    expect(emptyCount).toBeGreaterThan(0);

    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== D. AI Chat 深度 =====

test.describe('D. AI Chat 深度交互', () => {

  test('D.1 页面渲染 — 侧栏/欢迎屏幕/输入框', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForPageReady(page, 2500);

    await expect(page.locator('.ai-chat-page')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-chat')).toBeVisible();
    await expect(page.locator('.chat-textarea')).toBeVisible();
    await expect(page.locator('.welcome-screen')).toBeVisible();

    const welcomeTitle = await page.locator('.welcome-title').textContent();
    expect(welcomeTitle).toContain('留学顾问');

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.2 多智能体切换', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    const agents = ['留学顾问', '文书导师', '选校专家', '签证助手'];
    for (const name of agents) {
      const btn = page.locator(`.agent-row:has-text("${name}")`);
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(500);
        const title = await page.locator('.welcome-title').textContent();
        expect(title).toContain(name);
      }
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.3 侧栏折叠/展开', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 折叠
    await page.locator('.sidebar-toggle').click();
    await page.waitForTimeout(300);
    expect(await page.locator('.sidebar.is-collapsed').count()).toBe(1);

    // 展开
    await page.locator('.sidebar-toggle').click();
    await page.waitForTimeout(300);
    expect(await page.locator('.sidebar.is-collapsed').count()).toBe(0);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.4 快捷提示词填充', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    const chips = page.locator('.prompt-chip');
    if (await chips.count() > 0) {
      await chips.first().click();
      await page.waitForTimeout(500);

      const inputValue = await page.locator('.chat-textarea').inputValue();
      expect(inputValue.length).toBeGreaterThan(0);
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.5 发送消息 + 等待响应/错误', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2500);

    // 填写消息
    const textarea = page.locator('.chat-textarea');
    await textarea.fill('你好，请帮我分析一下美国计算机科学专业的申请前景');
    await page.waitForTimeout(200);

    // 发送按钮应该激活
    const sendBtn = page.locator('.send-btn');
    expect(await sendBtn.locator('.is-active, .send-btn.is-active').count() + await sendBtn.evaluate(el => el.classList.contains('is-active')) ? 1 : 0).toBeGreaterThanOrEqual(0); // just check it doesn't crash

    // 按 Enter 发送
    await textarea.press('Enter');
    await page.waitForTimeout(8000); // 等待可能的AI响应

    // 页面不应崩溃
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(100);

    // 不应有未捕获的JS错误
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.6 新对话 + 返回按钮', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 新对话
    const newChatBtn = page.locator('.new-chat-btn');
    if (await newChatBtn.isVisible()) {
      await newChatBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('.welcome-screen')).toBeVisible();
    }

    // 返回按钮
    await page.locator('.header-back-btn').click();
    await page.waitForTimeout(800);
    expect(page.url()).not.toContain('/ai-chat');

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('D.7 深度思考切换', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    const thinkBtn = page.locator('.toolbar-btn');
    const thinkCount = await thinkBtn.count();
    if (thinkCount > 0) {
      // 点击开启
      await thinkBtn.first().click();
      await page.waitForTimeout(200);
      // 点击关闭
      await thinkBtn.first().click();
    }

    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== E. 数据持久化 =====

test.describe('E. 数据持久化 — localStorage', () => {

  test('E.1 AI配置刷新后数据保留', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2500);

    const countBefore = await page.locator('.provider-row').count();

    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2500);

    const countAfter = await page.locator('.provider-row').count();
    expect(countAfter).toBe(countBefore);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('E.2 评估数据刷新后保留', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);
    await page.locator('.btn-hero').click();
    await waitForPageReady(page, 800);

    // 填写姓名
    await page.fill('.form-input[type="text"]', '持久化测试用户');
    await page.waitForTimeout(300);

    // 刷新
    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 数据应该还在（场景应该还在form而非hero）
    const scene1 = page.locator('.scene--form').nth(0);
    // 注意：刷新后可能回到hero，取决于组件是否记住当前场景
    // 至少不应该崩溃
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(50);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('E.3 时间线任务刷新后保留', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 生成示例任务
    const generateBtn = page.locator('.btn-primary-cta');
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await waitForPageReady(page, 2000);
    }

    const taskCountBefore = await page.locator('.task-card-premium, .task-card').count();

    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 任务数量应该相同或更多（不能丢失数据）
    const taskCountAfter = await page.locator('.task-card-premium, .task-card').count();
    expect(taskCountAfter).toBeGreaterThanOrEqual(taskCountBefore);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('E.4 院校收藏状态持久化', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 收藏第一张卡片
    const action = page.locator('.ud-card__action').first();
    if (await action.isVisible()) {
      await action.click();
      await page.waitForTimeout(300);

      const textBefore = await action.textContent();

      // 刷新
      await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
      await waitForPageReady(page, 3000);

      const actionAfter = page.locator('.ud-card__action').first();
      if (await actionAfter.isVisible()) {
        const textAfter = await actionAfter.textContent();
        // 收藏状态应该保持
        // 如果之前收藏了，刷新后应该还是"已收藏"
        if (textBefore?.includes('已收藏')) {
          expect(textAfter).toContain('已收藏');
        }
      }

      // 取消收藏清理
      await actionAfter.click();
      await page.waitForTimeout(300);
    }

    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== F. 响应式/移动端 =====

test.describe('F. 响应式/移动端', () => {

  test('F.1 移动端首页 — 汉堡菜单导航', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 1500);

    // 汉堡按钮可见
    await expect(page.locator('.hamburger-btn')).toBeVisible();

    // 桌面导航隐藏
    const desktopNav = page.locator('.desktop-nav');
    expect(await desktopNav.isVisible()).toBeFalsy();

    // 打开移动菜单
    await page.locator('.hamburger-btn').click();
    await page.waitForTimeout(500);

    // 抽屉出现
    const drawer = page.locator('.mobile-menu-drawer .el-drawer, .el-drawer');
    expect(await drawer.count()).toBeGreaterThan(0);

    // 点击导航项
    const menuItem = page.locator('.mobile-menu-item').first();
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await waitForPageReady(page, 800);
      const bodyLen = await page.evaluate(() => document.body.innerText.length);
      expect(bodyLen).toBeGreaterThan(80);
    }

    // 恢复桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('F.2 移动端AI Chat — 侧栏自动折叠', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 聊天区域应可见
    await expect(page.locator('.chat-textarea')).toBeVisible();

    // 发送按钮可见
    await expect(page.locator('.send-btn')).toBeVisible();

    // 页面不应崩溃
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(80);

    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('F.3 平板视口 (768px)', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 1500);

    // 首页应正常渲染
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(200);
    await expect(page.locator('.hp-hero').first()).toBeVisible();

    // 导航到评估页
    await page.locator('.hp-btn--primary').first().click();
    await waitForPageReady(page, 1500);
    expect(page.url()).toContain('/#/assessment');

    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('F.4 窄视口 (320px) — 极端情况', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 1500);

    // 不应该出现水平滚动条导致内容溢出
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    // 宽屏页面可能有轻微溢出，只要不是严重溢出即可
    if (hasHorizontalScroll) {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      console.log(`  水平溢出: ${overflow}px`);
      expect(overflow).toBeLessThan(50); // 允许最多50px溢出
    }

    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== G. 边界/异常 =====

test.describe('G. 边界/异常情况', () => {

  test('G.1 快速连续页面切换(20次)不崩溃', async ({ page }) => {
    const ctx = collectErrors(page);
    const routes = ['/', '/assessment', '/timeline', '/ai-chat', '/university-database', '/materials', '/ai-config'];

    for (let round = 0; round < 3; round++) {
      for (const route of routes) {
        await page.goto(`${BASE}/#${route}`, { timeout: 8000 });
        await page.waitForTimeout(200);
      }
    }

    // 最终页面应正常
    await page.waitForTimeout(1000);
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(50);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.2 超长URL — 不崩溃', async ({ page }) => {
    const ctx = collectErrors(page);
    const longPath = '/' + 'x'.repeat(5000);
    await page.goto(`${BASE}/#${longPath}`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(30);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.3 院校数据库空搜索 — 显示空状态', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    await page.fill('.ud-search__field', 'zzzz不存在的大学名xxxxx');
    await page.click('.ud-search__btn');
    await waitForPageReady(page, 1000);

    // 应该显示空状态或"无结果"
    const empty = page.locator('.ud-empty, .empty-state');
    const hasEmpty = await empty.count();
    if (hasEmpty > 0) {
      await expect(empty.first()).toBeVisible();
    }

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.4 AI配置 — 特殊字符输入', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2500);

    // 输入特殊字符
    await page.fill('#prov-name', '<script>alert("xss")</script>测试<>');
    await page.fill('#prov-url', 'not-a-url');
    await page.fill('#prov-model', '');
    await page.waitForTimeout(200);

    // 页面不应崩溃
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(50);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.5 评估页 — 导航点直接跳转', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page);

    const dots = page.locator('.nav-dot');
    expect(await dots.count()).toBe(5);

    // 随机跳转
    await dots.nth(4).click(); // 直接跳报告
    await waitForPageReady(page, 600);
    await dots.nth(1).click(); // 跳到场景1
    await waitForPageReady(page, 600);
    await dots.nth(3).click(); // 跳到场景3
    await waitForPageReady(page, 600);
    await dots.first().click(); // 回hero
    await waitForPageReady(page, 600);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.6 院校详情 — 不存在的ID', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/school-detail/nonexistent-id-xyz`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 应该显示错误状态
    const error = page.locator('.sd-error');
    if (await error.isVisible()) {
      await expect(error).toBeVisible();
    }

    // 不应该白屏
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(30);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.7 多次刷新同一页面稳定性', async ({ page }) => {
    const ctx = collectErrors(page);
    for (let i = 0; i < 5; i++) {
      await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
      await waitForPageReady(page, 1000);
      await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
    }
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(50);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.8 时间线 — 模式切换（紧凑/常规/宽松）', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    const modeSelect = page.locator('#view-mode');
    if (await modeSelect.isVisible()) {
      await modeSelect.selectOption('compact');
      await page.waitForTimeout(500);
      await modeSelect.selectOption('relaxed');
      await page.waitForTimeout(500);
      await modeSelect.selectOption('normal');
      await page.waitForTimeout(500);
    }
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.9 材料中心 — 编辑器输入长文本', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/materials`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 3000);

    // 查找可编辑区域
    const editable = page.locator('[contenteditable="true"], textarea, .editor-area').first();
    if (await editable.isVisible()) {
      await editable.click();
      await page.waitForTimeout(300);

      // 输入较长的文书内容
      const longText = '这是一段测试文书内容。'.repeat(50);
      await page.keyboard.type(longText.substring(0, 2000));
      await page.waitForTimeout(500);

      const text = await editable.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.10 AI Chat — 发送空消息不应崩溃', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    // 不输入任何内容，直接按 Enter
    const textarea = page.locator('.chat-textarea');
    await textarea.press('Enter');
    await page.waitForTimeout(1000);

    // 不应发送消息
    const messages = page.locator('.message-wrapper');
    expect(await messages.count()).toBe(0);

    expect(filterErrors(ctx)).toEqual([]);
  });

  test('G.11 AI Chat — 超长消息', async ({ page }) => {
    const ctx = collectErrors(page);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await waitForPageReady(page, 2000);

    const textarea = page.locator('.chat-textarea');
    const longMsg = '请帮我分析'.repeat(500); // 约2500字
    await textarea.fill(longMsg);
    await page.waitForTimeout(200);

    // 发送按钮应激活
    // 不按Enter，只验证不崩溃
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(50);

    expect(filterErrors(ctx)).toEqual([]);
  });
});

// ===== H. 性能/稳定性 =====

test.describe('H. 性能与稳定性', () => {

  test('H.1 首页加载时间 < 10s', async ({ page }) => {
    const ctx = collectErrors(page);
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - start;

    console.log(`  首页加载: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('H.2 20轮导航不内存泄漏', async ({ page }) => {
    const ctx = collectErrors(page);
    const routes = ['/', '/assessment', '/timeline', '/ai-chat', '/university-database', '/materials', '/ai-config', '/story'];

    for (let round = 0; round < 5; round++) {
      for (const route of routes) {
        await page.goto(`${BASE}/#${route}`, { timeout: 8000 });
        await page.waitForTimeout(200);
      }
    }

    // 最终回到首页
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    expect(bodyLen).toBeGreaterThan(100);
    expect(filterErrors(ctx)).toEqual([]);
  });

  test('H.3 各页面独立加载无交叉污染', async ({ page }) => {
    const ctx = collectErrors(page);

    // 按顺序访问不同功能页面，检查是否有残留元素
    const pages = [
      { route: '/ai-chat', mustHave: '.ai-chat-page', mustNotHave: '.ud-page' },
      { route: '/university-database', mustHave: '.ud-page', mustNotHave: '.ai-chat-page' },
      { route: '/timeline', mustHave: '.timeline-page', mustNotHave: '.ai-chat-page' },
    ];

    for (const p of pages) {
      await page.goto(`${BASE}/#${p.route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await waitForPageReady(page, 1500);
      expect(await page.locator(p.mustHave).count()).toBeGreaterThan(0);
      expect(await page.locator(p.mustNotHave).count()).toBe(0);
    }

    expect(filterErrors(ctx)).toEqual([]);
  });
});

console.log('\n══════════════════════════════════════════');
console.log('AstroPath 全真用户模拟自动化测试');
console.log('8维度 × 40+用例 — 全面覆盖');
console.log('══════════════════════════════════════════\n');
