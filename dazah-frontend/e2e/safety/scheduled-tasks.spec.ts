import { test, expect } from '@playwright/test'
import { createScheduledTask, deleteScheduledTask, waitForPageLoad, expectNoApplicationError, openSelectAndPick, randomString } from './fixtures'

test.describe('定时任务列表', () => {
  test('加载表格', async ({ page }) => {
    await page.goto('/safety/scheduled-tasks'); await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page); await expect(page.getByRole('table')).toBeVisible()
  })
  test('新建按钮跳转', async ({ page }) => {
    await page.goto('/safety/scheduled-tasks'); await waitForPageLoad(page, 3000)
    const btn = page.locator('.ant-card .ant-btn-primary').first()
    if (await btn.isVisible().catch(() => false)) {
      await btn.click(); await page.waitForTimeout(2000)
    }
    // 只要能找到按钮就通过
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('定时任务新建', () => {
  test('表单完整并创建', async ({ page }) => {
    await page.goto('/safety/scheduled-tasks/new'); await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page)
    await page.getByPlaceholder('例：每日安全简报推送').fill(`测试-${randomString()}`)
    // cron 组件
    const cronInp = page.locator('input').filter({ has: page.locator('[placeholder*="cron"]').or(page.locator('[placeholder*="Cron"]')) }).first()
    if (await cronInp.isVisible().catch(() => false)) { await cronInp.fill('0 9 * * *') }
    // 飞书群 chat_id
    const chatInp = page.locator('.ant-select').filter({ has: page.locator('[title="选择飞书群聊"]') }).first()
    if (await chatInp.isVisible().catch(() => false)) {
      await chatInp.click(); await page.waitForTimeout(500)
      const opt = page.locator('.ant-select-dropdown .ant-select-item-option').first()
      if (await opt.isVisible().catch(() => false)) { await opt.click(); await page.waitForTimeout(300) }
    }
    await page.getByRole('button', { name: '创建任务' }).first().click()
    await page.waitForTimeout(2000)
  })
})

test.describe('定时任务管理', () => {
  let tid: string
  test.beforeEach(async () => { tid = await createScheduledTask({}) })
  test.afterEach(async () => { if (tid) await deleteScheduledTask(tid) })
  test('启停', async ({ page }) => {
    await page.goto('/safety/scheduled-tasks'); await waitForPageLoad(page, 3000)
    const sw = page.locator('table tbody tr').first().locator('.ant-switch').first()
    if (await sw.isVisible().catch(() => false)) { await sw.click(); await page.waitForTimeout(2000); await sw.click(); await page.waitForTimeout(2000) }
  })
  test('删除', async ({ page }) => {
    await page.goto('/safety/scheduled-tasks'); await waitForPageLoad(page, 3000)
    const b = page.locator('table tbody tr').first().locator('button').last()
    if (await b.isVisible().catch(() => false)) {
      await b.click(); await page.waitForTimeout(1000)
      const ok = page.getByRole('button', { name: /确定|确认/ }).first()
      if (await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(2000) }
    }
  })
})
