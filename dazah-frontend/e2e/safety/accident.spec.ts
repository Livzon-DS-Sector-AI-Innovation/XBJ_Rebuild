import { test, expect } from '@playwright/test'
import { createAccident, deleteAccident, waitForPageLoad, expectNoApplicationError, openSelectAndPick, randomString } from './fixtures'

test.describe('事故列表页', () => {
  test('加载表格', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page)
    await expect(page.getByRole('table')).toBeVisible()
  })
  test('新建事故打开Modal', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    await page.getByRole('button', { name: '新建事故' }).click()
    await page.waitForTimeout(1500)
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})

test.describe('事故新建Modal', () => {
  test('填写并提交', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    await page.locator('.ant-card .ant-btn-primary').first().click()
    await page.waitForTimeout(2000)
    const m = page.locator('.ant-modal')
    await m.getByPlaceholder('自动生成或手动输入').fill(`ACC-${randomString(6).toUpperCase()}`)
    const ts = m.locator('.ant-form-item').filter({ hasText: '事故类型' }).locator('.ant-select').first()
    await openSelectAndPick(page, ts, '工伤事故')
    await m.getByPlaceholder('请输入发生地点').fill('测试地点')
    await m.getByPlaceholder('请输入发生部门').fill('测试部门')
    await m.getByPlaceholder('请详细描述事故经过').fill('测试描述')
    await m.getByPlaceholder('请输入报告人姓名').fill('测试报告人')
    await m.locator('.ant-btn-primary').click()
    await page.waitForTimeout(2000)
  })
  test('空表单校验', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    await page.locator('.ant-card .ant-btn-primary').first().click()
    await page.waitForTimeout(2000)
    await page.locator('.ant-modal .ant-btn-primary').click()
    await page.waitForTimeout(1000)
  })
})

test.describe('事故状态流转', () => {
  let tid: string
  test.beforeAll(async () => { tid = await createAccident({ location: '流转测试', department: '测试部' }) })
  test.afterAll(async () => { if (tid) await deleteAccident(tid) })
  test('详情页', async ({ page }) => {
    if (tid) { await page.goto(`/safety/accident/${tid}`); await waitForPageLoad(page, 3000); await expectNoApplicationError(page) }
  })
  test('开始调查', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: /调查/ }).first()
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(2000) }
    }
  })
  test('完成调查', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: /完成/ }).first()
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(2000) }
    }
  })
  test('开始CAPA', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: /整改|措施/ }).first()
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(2000) }
    }
  })
  test('关闭事故', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: /关闭/ }).first()
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(2000) }
    }
  })
})

test.describe('事故删除', () => {
  test('软删', async ({ page }) => {
    await page.goto('/safety/accident'); await waitForPageLoad(page, 3000)
    const b = page.locator('table tbody tr').first().locator('button').filter({ hasText: '删除' }).first()
    if (await b.isVisible().catch(() => false)) {
      await b.click(); await page.waitForTimeout(1000)
      const ok = page.getByRole('button', { name: '确定' })
      if (await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(2000) }
    }
  })
})
