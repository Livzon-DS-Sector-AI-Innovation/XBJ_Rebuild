import { test, expect } from '@playwright/test'
import { createSpecialOps, deleteSpecialOps, waitForPageLoad, expectNoApplicationError, openSelectAndPick, randomString } from './fixtures'

test.describe('特殊作业首页', () => {
  test('加载统计卡片', async ({ page }) => {
    await page.goto('/safety/special-ops'); await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page)
    const cards = page.locator('.ant-card'); expect(await cards.count()).toBeGreaterThan(0)
  })
})

test.describe('特殊作业报备列表', () => {
  test('新建报备', async ({ page }) => {
    await page.goto('/safety/special-ops'); await waitForPageLoad(page, 3000)
    const cb = page.getByRole('button').filter({ hasText: /新建|新增|报备/ }).first()
    if (await cb.isVisible().catch(() => false)) {
      await cb.click(); await page.waitForTimeout(2000)
      const inp = page.locator('input').filter({ has: page.locator('[placeholder*="编号"]') }).first()
      if (await inp.isVisible().catch(() => false)) { await inp.fill(`OPS-${randomString(6).toUpperCase()}`) }
      const ts = page.locator('.ant-select').filter({ has: page.locator('[title*="作业类型"]') }).first()
      if (await ts.isVisible().catch(() => false)) { await openSelectAndPick(page, ts, '动火作业') }
      const sb = page.getByRole('button').filter({ hasText: /保存|提交/ }).first()
      if (await sb.isVisible().catch(() => false)) { await sb.click(); await page.waitForTimeout(2000) }
    }
  })
})

test.describe('特殊作业人员', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/safety/special-ops/personnel'); await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page)
  })
  test('状态筛选', async ({ page }) => {
    await page.goto('/safety/special-ops/personnel'); await waitForPageLoad(page, 3000)
    const sel = page.locator('.ant-select').filter({ has: page.locator('[title="状态"]') }).first()
    if (await sel.isVisible().catch(() => false)) { await openSelectAndPick(page, sel, '有效') }
  })
})
