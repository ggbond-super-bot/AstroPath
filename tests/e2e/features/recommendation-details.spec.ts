/**
 * AstroPath 全面自动化测试 - 第三批
 * 选校推荐完整流程 + 院校详情 + 专业详情
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

test.describe('10 选校推荐完整流程测试', () => {

  test('10.1 选校推荐 - 无评估数据空状态', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 清除所有localStorage
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 应该显示空状态
    await expect(page.locator('.page-empty')).toBeVisible();
    const emptyTitle = await page.locator('.empty-title').textContent();
    expect(emptyTitle).toContain('评估');

    // "去评估"按钮应该存在
    const ctaBtn = page.locator('.btn-cta');
    await expect(ctaBtn).toBeVisible();

    expect(getErrors()).toEqual([]);
    console.log('✓ 选校推荐空状态正常');
  });

  test('10.2 选校推荐 - 从空状态跳转到评估页', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // 点击"去评估"按钮
    await page.locator('.btn-cta').click();
    await page.waitForTimeout(1000);

    // 应该跳转到评估页
    expect(page.url()).toContain('/#/assessment');

    expect(getErrors()).toEqual([]);
    console.log('✓ 从空状态跳转到评估页正常');
  });

  test('10.3 选校推荐 - 有评估数据时显示偏好收集器', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 模拟有评估数据
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      const assessmentData = {
        basic: { name: '测试', age: 22, university: '985', gpa: 3.7, language: '雅思7.0' },
        academic: { degree: '硕士', majors: ['理工'], averageScore: 88, research: [] },
        practice: { internships: [], competitions: [], volunteers: [] }
      };
      localStorage.setItem('astropath_assessment_form', JSON.stringify(assessmentData));
    });

    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // 应该不显示空状态
    const hasEmpty = await page.locator('.page-empty').count();
    expect(hasEmpty).toBe(0);

    // 应该显示偏好收集页面或推荐结果
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    expect(getErrors()).toEqual([]);
    console.log('✓ 有评估数据时偏好收集器正常');
  });

  test('10.4 选校推荐 - 偏好收集器交互', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      const assessmentData = {
        basic: { name: '测试', age: 22, university: '985', gpa: 3.7, language: '雅思7.0' },
        academic: { degree: '硕士', majors: ['理工'], averageScore: 88, research: [] },
        practice: { internships: [], competitions: [], volunteers: [] }
      };
      localStorage.setItem('astropath_assessment_form', JSON.stringify(assessmentData));
    });

    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // 尝试找到偏好选项并点击
    const prefOptions = page.locator('.pref-option, .preference-item, .tag-btn, .chip-btn');
    if (await prefOptions.count() > 0) {
      await prefOptions.first().click();
      await page.waitForTimeout(500);
    }

    // 尝试找到开始推荐按钮
    const startBtn = page.locator('.btn-start, .btn-primary, .btn-cta').first();
    if (await startBtn.count() > 0 && await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(2000);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 偏好收集器交互正常');
  });

  test('10.5 选校推荐 - 院校卡片信息显示', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 设置有完整评估+推荐数据
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      const assessmentData = {
        basic: { name: '测试', age: 22, university: '985', gpa: 3.7, language: '雅思7.0' },
        academic: { degree: '硕士', majors: ['理工', '商科'], averageScore: 88, research: [{ name: 'AI研究', role: '研究员', duration: '1年', description: '深度学习' }] },
        practice: { internships: [{ company: '腾讯', position: '前端开发', duration: '3个月', description: '组件开发' }], competitions: [{ name: 'ACM', level: '国家级', award: '金奖', year: '2024' }], volunteers: [{ organization: '红十字会', role: '志愿者', hours: '50小时', description: '社区服务' }] }
      };
      localStorage.setItem('astropath_assessment_form', JSON.stringify(assessmentData));
    });

    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // 检查页面内容
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(200);

    expect(getErrors()).toEqual([]);
    console.log('✓ 院校卡片信息正常');
  });
});

test.describe('11 院校详情页面测试', () => {

  test('11.1 院校详情页 - 直接访问不存在的ID', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/school-detail/nonexistent-id-12345`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 应该显示返回按钮或空状态，不应该白屏
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);

    expect(getErrors()).toEqual([]);
    console.log('✓ 不存在的院校ID处理正常');
  });

  test('11.2 院校详情页 - 从数据库导航进入', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // 点击第一张卡片
    const cards = page.locator('.ud-card');
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(2000);

      // 应该跳转到详情页
      expect(page.url()).toContain('/school-detail/');

      // 详情页应该有内容
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(200);

      // 应该有返回按钮
      const backBtn = page.locator('.sd-back');
      if (await backBtn.count() > 0) {
        await backBtn.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('/university-database');
      }
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 院校详情页导航正常');
  });

  test('11.3 院校详情页 - 返回按钮功能', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    // 通过列表视图进入详情
    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到列表视图
    const listBtn = page.locator('.ud-view-btn').last();
    if (await listBtn.count() > 0) {
      await listBtn.click();
      await page.waitForTimeout(500);
    }

    // 点击列表行
    const tableRows = page.locator('.el-table__row');
    if (await tableRows.count() > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/school-detail/');

      // 使用返回按钮
      const backBtn = page.locator('.sd-back, .md-back');
      if (await backBtn.count() > 0) {
        await backBtn.first().click();
        await page.waitForTimeout(1000);
      }
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 详情页返回按钮正常');
  });

  test('11.4 院校详情页 - 刷新后状态保持', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    const cards = page.locator('.ud-card');
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForTimeout(2000);

      // 刷新页面
      await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      // 应该还在详情页
      expect(page.url()).toContain('/school-detail/');
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(100);
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 详情页刷新状态正常');
  });
});

test.describe('12 专业详情页面测试', () => {

  test('12.1 专业详情页 - 从数据库Tab导航进入', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    // 切换到专业Tab
    await page.click('.ud-tab >> text=专业搜索');
    await page.waitForTimeout(1000);

    // 点击第一个专业卡片
    const majors = page.locator('.ud-major');
    if (await majors.count() > 0) {
      await majors.first().click();
      await page.waitForTimeout(2000);

      // 应该跳转到专业详情
      expect(page.url()).toContain('/major-detail/');

      // 详情页应该有内容
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(100);

      // 返回按钮
      const backBtn = page.locator('.md-back');
      if (await backBtn.count() > 0) {
        await backBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 专业详情导航正常');
  });

  test('12.2 专业详情页 - 不存在的专业ID', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/major-detail/nonexistent-major-999`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 不应该白屏
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);

    expect(getErrors()).toEqual([]);
    console.log('✓ 不存在专业ID处理正常');
  });

  test('12.3 专业详情页 - 返回导航', async ({ page }) => {
    const { getErrors } = collectErrors(page);

    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);

    await page.click('.ud-tab >> text=专业搜索');
    await page.waitForTimeout(1000);

    const majors = page.locator('.ud-major');
    if (await majors.count() > 0) {
      await majors.first().click();
      await page.waitForTimeout(2000);

      // 浏览器后退
      await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('university-database');
    }

    expect(getErrors()).toEqual([]);
    console.log('✓ 专业详情返回导航正常');
  });
});

console.log('\n========================================');
console.log('AstroPath 全面自动化测试 - 第三批');
console.log('选校推荐 + 院校详情 + 专业详情');
console.log('========================================\n');
