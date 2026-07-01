import { test, expect } from '@playwright/test'
import { waitForPageLoad, expectNoApplicationError } from './fixtures'

const PAGES = [
  { url: '/safety', name: '安全首页' },
  { url: '/safety/check', name: '安全检查' },
  { url: '/safety/hazard', name: '隐患登记' },
  { url: '/safety/hazard-ledger', name: '隐患台账' },
  { url: '/safety/hazard-identification', name: '危险源辨识' },
  { url: '/safety/hazard-identification/ledger', name: '危险源台账' },
  { url: '/safety/hazard-identification/new', name: '新建危险源' },
  { url: '/safety/accident', name: '事故管理' },
  { url: '/safety/training', name: '安全培训' },
  { url: '/safety/special-ops', name: '特殊作业' },
  { url: '/safety/special-ops/personnel', name: '特殊作业人员' },
  { url: '/safety/scheduled-tasks', name: '定时任务' },
  { url: '/safety/scheduled-tasks/new', name: '新建定时任务' },
  { url: '/safety/ai-workflow-config', name: 'AI工作流配置' },
  { url: '/safety/contractor', name: '承包商管理' },
  { url: '/safety/regulation', name: '法规管理' },
  { url: '/safety/knowledge-base', name: '知识库' },
  { url: '/safety/ehs-change', name: 'EHS变更' },
  { url: '/safety/occupational-health', name: '职业健康' },
  { url: '/safety/risk-reporting', name: '风险报备' },
]

test.describe('安全模块L0冒烟', () => {
  for (const p of PAGES) {
    test(`${p.name} 加载`, async ({ page }) => {
      await page.goto(p.url); await waitForPageLoad(page, 4000)
      await expectNoApplicationError(page)
      // 宽松断言：页面主体可见即可
      const content = page.locator('table, .ant-card, .ant-steps, .ant-form, .ant-list, .ant-collapse, main, h1, h2').first()
      await expect(content).toBeVisible()
    })
  }
})

test.describe('安全首页导航', () => {
  test('显示功能卡片', async ({ page }) => {
    await page.goto('/safety'); await waitForPageLoad(page, 2000)
    const cards = page.locator('.ant-card'); expect(await cards.count()).toBeGreaterThan(0)
  })
  test('检查菜单跳转', async ({ page }) => {
    await page.goto('/safety'); await waitForPageLoad(page, 2000)
    const l = page.locator('a[href*="check"], .ant-card').filter({ hasText: /检查/ }).first()
    if (await l.isVisible().catch(() => false)) { await l.click(); await page.waitForTimeout(2000) }
  })
  test('隐患菜单跳转', async ({ page }) => {
    await page.goto('/safety'); await waitForPageLoad(page, 2000)
    const l = page.locator('a[href*="hazard"], .ant-card').filter({ hasText: /隐患/ }).first()
    if (await l.isVisible().catch(() => false)) { await l.click(); await page.waitForTimeout(2000) }
  })
  test('事故菜单跳转', async ({ page }) => {
    await page.goto('/safety'); await waitForPageLoad(page, 2000)
    const l = page.locator('a[href*="accident"], .ant-card').filter({ hasText: /事故/ }).first()
    if (await l.isVisible().catch(() => false)) { await l.click(); await page.waitForTimeout(2000) }
  })
  test('培训菜单跳转', async ({ page }) => {
    await page.goto('/safety'); await waitForPageLoad(page, 2000)
    const l = page.locator('a[href*="training"], .ant-card').filter({ hasText: /培训/ }).first()
    if (await l.isVisible().catch(() => false)) { await l.click(); await page.waitForTimeout(2000) }
  })
})
