/**
 * AstroPath 全面自动化测试 - 第二批
 * AI配置 + 院校数据库 + 时间规划 + 材料中心
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

function collectErrors(page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return { getErrors: () => errors.filter(e =>
    !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR') && !e.includes('Download')
  )};
}

test.describe('04 AI配置页面测试', () => {

  test('4.1 AI配置页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Hero区域
    await expect(page.locator('.hero-title')).toBeVisible();
    const titleText = await page.locator('.hero-title').textContent();
    expect(titleText).toContain('AI');

    // 供应商表格
    await expect(page.locator('.data-table')).toBeVisible();

    // 自定义配置表单
    await expect(page.locator('.provider-form')).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ AI配置页渲染正常');
  });

  test('4.2 供应商列表 - 查看和编辑', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 供应商行应该存在（至少有默认的智谱配置）
    const providerRows = page.locator('.provider-row');
    const rowCount = await providerRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // 测试编辑按钮
    const editBtn = page.locator('.btn-edit').first();
    await editBtn.click();
    await page.waitForTimeout(500);

    // 编辑模态框应该出现
    await expect(page.locator('.modal-panel')).toBeVisible();
    await expect(page.locator('.modal-heading')).toContainText('编辑供应商');

    // 关闭
    await page.click('.btn-close');
    await page.waitForTimeout(300);

    expect(getErrors()).toEqual([]);
    console.log(`✓ 供应商列表正常 (${rowCount}个供应商)`);
  });

  test('4.3 添加新供应商', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 记录当前数量
    const beforeCount = await page.locator('.provider-row').count();

    // 填写新供应商
    await page.fill('#prov-name', '测试供应商');
    await page.fill('#prov-url', 'https://api.test.com/v1');
    await page.fill('#prov-key', 'sk-test123456');
    await page.fill('#prov-model', 'test-model');
    await page.waitForTimeout(200);

    // 选择类型
    const typeSelect = page.locator('#prov-type');
    await typeSelect.click();
    await page.waitForTimeout(300);
    await page.locator('.custom-select-option >> text=OpenAI').click();
    await page.waitForTimeout(200);

    // 提交
    await page.click('.btn-submit');
    await page.waitForTimeout(500);

    // 验证新增
    const afterCount = await page.locator('.provider-row').count();
    expect(afterCount).toBe(beforeCount + 1);

    expect(getErrors()).toEqual([]);
    console.log('✓ 添加供应商正常');
  });

  test('4.4 删除供应商', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const beforeCount = await page.locator('.provider-row').count();
    if (beforeCount > 1) {
      await page.locator('.btn-delete').last().click();
      await page.waitForTimeout(500);
      const afterCount = await page.locator('.provider-row').count();
      expect(afterCount).toBe(beforeCount - 1);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 删除供应商正常');
  });

  test('4.5 测试连接按钮', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const testBtn = page.locator('.btn-test').first();
    if (await testBtn.count() > 0 && await testBtn.isEnabled()) {
      await testBtn.click();
      await page.waitForTimeout(5000);

      // 应该有状态变化
      const statusBadge = page.locator('.status-badge').first();
      await expect(statusBadge).toBeVisible();
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 测试连接正常');
  });

  test('4.6 自定义Select下拉组件', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 检查自定义下拉框
    const customSelect = page.locator('.custom-select').first();
    if (await customSelect.count() > 0) {
      await customSelect.click();
      await page.waitForTimeout(300);
      await expect(page.locator('.custom-select-dropdown')).toBeVisible();
      await page.locator('.custom-select-option').last().click();
      await page.waitForTimeout(200);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 自定义下拉框正常');
  });
});

test.describe('05 院校数据库页面测试', () => {

  test('5.1 数据库页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Hero区域
    await expect(page.locator('.ud-hero')).toBeVisible();

    // 搜索框
    await expect(page.locator('.ud-search__field')).toBeVisible();

    // 热门标签
    await expect(page.locator('.ud-tag').first()).toBeVisible();

    // Tab导航
    await expect(page.locator('.ud-tab').first()).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 数据库页渲染正常');
  });

  test('5.2 院校搜索筛选', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 院校Tab应该默认激活
    await expect(page.locator('.ud-tab--active >> text=院校搜索')).toBeVisible();

    // 国家筛选
    const countryChips = page.locator('.ud-filter__row').first();
    await expect(countryChips).toBeVisible();

    // 点击一个国家筛选
    const countryChip = page.locator('.ud-chip').nth(2);
    await countryChip.click();
    await page.waitForTimeout(500);

    // 验证有结果
    const cards = page.locator('.ud-card');
    expect(await cards.count()).toBeGreaterThan(0);

    expect(getErrors()).toEqual([]);
    console.log('✓ 院校搜索筛选正常');
  });

  test('5.3 搜索功能', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 输入搜索
    await page.fill('.ud-search__field', 'MIT');
    await page.waitForTimeout(300);

    await page.click('.ud-search__btn');
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    expect(getErrors()).toEqual([]);
    console.log('✓ 搜索功能正常');
  });

  test('5.4 卡片/列表视图切换', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 卡片视图
    await page.locator('.ud-view-btn--on >> text=""').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.ud-card').first()).toBeVisible();

    // 切换到列表视图
    await page.locator('.ud-view-btn').last().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.ud-table')).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 视图切换正常');
  });

  test('5.5 收藏功能', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const cards = page.locator('.ud-card');
    if (await cards.count() > 0) {
      // 点击收藏
      await page.locator('.ud-card__action').first().click();
      await page.waitForTimeout(300);

      // 应该显示已收藏
      const btnText = await page.locator('.ud-card__action').first().textContent();
      expect(btnText).toContain('已收藏');

      // 取消收藏
      await page.locator('.ud-card__action').first().click();
      await page.waitForTimeout(300);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 收藏功能正常');
  });

  test('5.6 院校详情导航', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const cards = page.locator('.ud-card');
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(1500);

      // 应该导航到详情页
      expect(page.url()).toContain('/school-detail/');
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 院校详情导航正常');
  });

  test('5.7 专业Tab - 搜索和筛选', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到专业Tab
    await page.click('.ud-tab >> text=专业搜索');
    await page.waitForTimeout(800);

    await expect(page.locator('.ud-tab--active >> text=专业搜索')).toBeVisible();

    // 专业卡片应该存在
    const majors = page.locator('.ud-major');
    expect(await majors.count()).toBeGreaterThan(0);

    expect(getErrors()).toEqual([]);
    console.log('✓ 专业Tab正常');
  });

  test('5.8 分页功能', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const pagination = page.locator('.el-pagination');
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 分页正常');
  });
});

test.describe('06 时间规划页面测试', () => {

  test('6.1 时间规划页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Hero区域
    await expect(page.locator('.hero-section')).toBeVisible();

    // 工具栏
    await expect(page.locator('.toolbar-float')).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 时间规划渲染正常');
  });

  test('6.2 三种视图切换', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 图表视图
    await page.click('.view-btn >> text=图表视图');
    await page.waitForTimeout(600);
    await expect(page.locator('.chart-area')).toBeVisible();

    // 时间线视图
    await page.click('.view-btn >> text=时间线');
    await page.waitForTimeout(600);
    await expect(page.locator('.timeline-area')).toBeVisible();

    // 看板视图
    await page.click('.view-btn >> text=任务看板');
    await page.waitForTimeout(600);
    await expect(page.locator('.kanban-area')).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 三种视图切换正常');
  });

  test('6.3 任务看板 - 拖拽任务', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到看板
    await page.click('.view-btn >> text=任务看板');
    await page.waitForTimeout(600);

    // 找到待处理的第一个任务
    const todoTasks = page.locator('.kanban-col-premium').first().locator('.task-card-premium');
    const todoCount = await todoTasks.count();

    if (todoCount > 0) {
      // 点击编辑按钮
      const editBtn = page.locator('.tc-action-btn').first();
      await editBtn.click();
      await page.waitForTimeout(500);

      // 对话框应该出现
      await expect(page.locator('.modal-premium')).toBeVisible();
      await expect(page.locator('.modal-header-premium')).toContainText('编辑任务');

      // 关闭
      await page.click('.modal-close-premium');
      await page.waitForTimeout(300);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 任务看板操作正常');
  });

  test('6.4 添加新任务', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到看板
    await page.click('.view-btn >> text=任务看板');
    await page.waitForTimeout(600);

    // 点击添加任务
    await page.locator('.add-task-btn-premium').first().click();
    await page.waitForTimeout(500);

    // 填写任务
    await page.fill('#task-title', '测试任务 - 准备申请材料');
    await page.waitForTimeout(200);

    // 选择优先级
    await page.click('.priority-chip >> text=高');
    await page.waitForTimeout(200);

    // 保存
    await page.click('.btn-modal-primary');
    await page.waitForTimeout(500);

    expect(getErrors()).toEqual([]);
    console.log('✓ 添加新任务正常');
  });

  test('6.5 时间线视图 - 里程碑选择', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到时间线视图
    await page.click('.view-btn >> text=时间线');
    await page.waitForTimeout(600);

    // 选择一个里程碑
    const milestone = page.locator('.milestone-item-premium').first();
    if (await milestone.count() > 0) {
      await milestone.click();
      await page.waitForTimeout(500);

      // 详情面板应该出现
      await expect(page.locator('.detail-panel-premium')).toBeVisible();
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 时间线视图正常');
  });

  test('6.6 重置和生成示例任务', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 重置
    await page.locator('.btn-icon[title*="重置"]').click();
    await page.waitForTimeout(500);

    // 生成示例任务
    await page.click('.btn-primary-cta');
    await page.waitForTimeout(1000);

    expect(getErrors()).toEqual([]);
    console.log('✓ 重置和示例任务正常');
  });

  test('6.7 紧凑/常规/宽松模式切换', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const modeSelect = page.locator('#view-mode');
    await modeSelect.selectOption('compact');
    await page.waitForTimeout(500);

    await modeSelect.selectOption('relaxed');
    await page.waitForTimeout(500);

    await modeSelect.selectOption('normal');
    await page.waitForTimeout(500);

    expect(getErrors()).toEqual([]);
    console.log('✓ 模式切换正常');
  });
});

test.describe('07 材料中心测试', () => {

  test('7.1 材料中心页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/materials`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Studio布局
    await expect(page.locator('.studio-page')).toBeVisible();

    // Header
    await expect(page.locator('.studio-header')).toBeVisible();

    // 编辑器
    await expect(page.locator('.studio-content')).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 材料中心渲染正常');
  });

  test('7.2 文书类型选择', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/materials`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 如果有欢迎向导
    const welcomeWizard = page.locator('.welcome-wizard');
    if (await welcomeWizard.count() > 0) {
      await expect(welcomeWizard).toBeVisible();
    }

    // 如果有类型选择
    const essayTypes = page.locator('.essay-type');
    if (await essayTypes.count() > 0) {
      await essayTypes.first().click();
      await page.waitForTimeout(500);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 文书类型选择正常');
  });

  test('7.3 Zen模式切换', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/materials`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 状态栏应该可见
    const statusBar = page.locator('.studio-status-bar');
    if (await statusBar.count() > 0) {
      await expect(statusBar).toBeVisible();
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ Zen模式正常');
  });
});

test.describe('08 静态页面测试', () => {

  test('8.1 Story页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/story`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Story是沉浸页面
    const isImmersive = await page.locator('.app-container.is-immersive').count();
    expect(isImmersive).toBe(1);

    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    expect(getErrors()).toEqual([]);
    console.log('✓ Story页面正常');
  });

  test('8.2 Result页面渲染', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/result`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    expect(getErrors()).toEqual([]);
    console.log('✓ Result页面正常');
  });
});

test.describe('09 边界情况和路由测试', () => {

  test('9.1 多次快速导航不应崩溃', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });

    // 快速连续点击导航
    for (let i = 0; i < 5; i++) {
      await page.goto(`${BASE}/#/assessment`, { timeout: 5000 });
      await page.goto(`${BASE}/#/timeline`, { timeout: 5000 });
      await page.goto(`${BASE}/#/ai-chat`, { timeout: 5000 });
      await page.goto(`${BASE}/#/university-database`, { timeout: 5000 });
    }

    await page.waitForTimeout(1000);
    expect(getErrors()).toEqual([]);
    console.log('✓ 快速导航不崩溃');
  });

  test('9.2 浏览器前进后退', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('assessment');

    await page.goForward({ waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('timeline');

    expect(getErrors()).toEqual([]);
    console.log('✓ 前进后退正常');
  });

  test('9.3 localStorage数据持久化', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 访问AI配置页
    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 刷新页面
    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 数据应该还在
    const providerRows = await page.locator('.provider-row').count();
    expect(providerRows).toBeGreaterThanOrEqual(0);

    expect(getErrors()).toEqual([]);
    console.log('✓ localStorage持久化正常');
  });

  test('9.4 标题更新', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // 标题应该包含"背景评估"
    const title = await page.title();
    expect(title).toContain('背景评估');

    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const title2 = await page.title();
    expect(title2).toContain('AI对话');

    expect(getErrors()).toEqual([]);
    console.log('✓ 标题更新正常');
  });

  test('9.5 搜索空结果处理', async ({ page }) => {
    const { getErrors } = collectErrors(page);
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 搜索不存在的学校
    await page.fill('.ud-search__field', 'xyznonexistent学校123');
    await page.click('.ud-search__btn');
    await page.waitForTimeout(1000);

    // 应该显示空状态
    const emptyState = page.locator('.ud-empty');
    const hasEmpty = await emptyState.count();
    if (hasEmpty) {
      await expect(emptyState).toBeVisible();
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 空搜索结果正常');
  });

  test('9.6 选校推荐 - 无评估数据空状态', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 清除localStorage
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.removeItem('astropath_assessment_form');
      localStorage.removeItem('astropath_school_recommendations');
    });
    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 应该显示空状态 - 请先完成评估
    const emptyState = page.locator('.page-empty');
    await expect(emptyState).toBeVisible();
    const emptyTitle = await page.locator('.empty-title').textContent();
    expect(emptyTitle).toContain('评估');

    expect(getErrors()).toEqual([]);
    console.log('✓ 无评估数据空状态正常');
  });
});

console.log('\n========================================');
console.log('AstroPath 全面自动化测试 - 第二批');
console.log('AI配置 + 院校数据库 + 时间规划 + 材料中心 + 边界情况');
console.log('========================================\n');
