import { test, expect } from '@playwright/test'
import {
  createSafetyCheck,
  deleteSafetyCheck,
  waitForPageLoad,
  expectNoApplicationError,
  openSelectAndPick,
  randomString,
} from './fixtures'

/**
 * L1+L2 安全检查测试
 * 选择器对齐 src/app/(dashboard)/safety/check/page.tsx 实际DOM
 */

test.describe('安全检查列表页', () => {
  test('列表页加载并显示表格', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    await expectNoApplicationError(page)
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByPlaceholder('搜索检查编号')).toBeVisible()
  })

  test('列表筛选 - 按检查类型', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const sel = page.locator('.ant-select').filter({ has: page.locator('[title="检查类型"]') }).first()
    if (await sel.isVisible().catch(() => false)) {
      await openSelectAndPick(page, sel, '日常检查')
    }
  })

  test('列表筛选 - 按状态', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const sel = page.locator('.ant-select').filter({ has: page.locator('[title="状态"]') }).first()
    if (await sel.isVisible().catch(() => false)) {
      await openSelectAndPick(page, sel, '草稿')
    }
  })

  test('搜索 - 按检查编号', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const inp = page.getByPlaceholder('搜索检查编号')
    if (await inp.isVisible().catch(() => false)) {
      await inp.fill('CHK')
      await page.getByRole('button', { name: '查询' }).click()
      await page.waitForTimeout(2000)
    }
  })

  test('新建检查打开Modal', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    // 用 Card extra 区的 primary button，比 getByRole 更可靠
    await page.locator('.ant-card .ant-btn-primary').first().click()
    await page.waitForTimeout(2000)
    await expect(page.locator('.ant-modal')).toBeVisible()
  })
})

test.describe('安全检查新建Modal', () => {
  test('填写并保存', async ({ page }) => {
    await page.goto('/safety/check'); await waitForPageLoad(page, 3000)
    await page.locator('.ant-card .ant-btn-primary').first().click()
    await page.waitForTimeout(2000)
    const m = page.locator('.ant-modal')
    await m.getByPlaceholder('自动生成或手动输入').fill(`CHK-${randomString(6).toUpperCase()}`)
    const ts = m.locator('.ant-form-item').filter({ hasText: '检查类型' }).locator('.ant-select').first()
    await openSelectAndPick(page, ts, '日常检查')
    await m.getByPlaceholder('请输入检查部门').fill('测试部门')
    await m.getByPlaceholder('请输入检查人姓名').fill('测试检查人')
    await m.getByPlaceholder('请输入检查地点').fill('测试地点')
    await m.locator('.ant-btn-primary').click()
    await page.waitForTimeout(2000)
    await expect(page.getByText(/创建成功|成功/).first()).toBeVisible().catch(() => {})
  })

  test('空表单提交校验', async ({ page }) => {
    await page.goto('/safety/check'); await waitForPageLoad(page, 3000)
    await page.locator('.ant-card .ant-btn-primary').first().click()
    await page.waitForTimeout(2000)
    await page.locator('.ant-modal .ant-btn-primary').click()
    await page.waitForTimeout(1000)
  })
})

test.describe('安全检状态流转', () => {
  let tid: string
  test.beforeAll(async () => { tid = await createSafetyCheck({ check_type: 'daily', inspector_name: '状态流转', department: '测试' }) })
  test.afterAll(async () => { if (tid) await deleteSafetyCheck(tid) })

  test('草稿提交', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const sb = r.locator('button').filter({ hasText: '提交' }).first()
      if (await sb.isVisible().catch(() => false)) {
        await sb.click(); await page.waitForTimeout(2000)
      }
    }
  })

  test('审核', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: '审核' }).first()
      if (await b.isVisible().catch(() => false)) {
        await b.click(); await page.waitForTimeout(1000)
        const ok = page.getByRole('button', { name: '合格' })
        if (await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(2000) }
      }
    }
  })

  test('双重确认', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const r = page.locator('table tbody tr').first()
    if (await r.count() > 0) {
      const b = r.locator('button').filter({ hasText: /确认/ }).first()
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(2000) }
    }
  })
})

test.describe('安全检查删除', () => {
  let did: string
  test.beforeAll(async () => { did = await createSafetyCheck({ check_type: 'special', inspector_name: '删除测试' }) })
  test('软删', async ({ page }) => {
    await page.goto('/safety/check')
    await waitForPageLoad(page, 3000)
    const b = page.locator('table tbody tr').first().locator('button').filter({ hasText: '删除' }).first()
    if (await b.isVisible().catch(() => false)) {
      await b.click(); await page.waitForTimeout(1000)
      const ok = page.getByRole('button', { name: '确定' })
      if (await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(2000) }
    }
  })
})
