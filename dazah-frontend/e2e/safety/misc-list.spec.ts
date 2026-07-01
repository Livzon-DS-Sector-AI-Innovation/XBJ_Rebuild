import { test, expect } from '@playwright/test'
import { waitForPageLoad, expectNoApplicationError, openSelectAndPick } from './fixtures'

const listPages = [
  { url: '/safety/contractor', name: '承包商', opts: [{ sel: '资质', pick: '甲级' }] },
  { url: '/safety/regulation', name: '法规', opts: [{ sel: '类型', pick: '国家标准' }] },
  { url: '/safety/knowledge-base', name: '知识库', opts: [{ sel: '分类', pick: '法律法规' }] },
  { url: '/safety/ehs-change', name: 'EHS变更', opts: [{ sel: '类型', pick: '工艺技术变更' }, { sel: '状态', pick: '草稿' }] },
  { url: '/safety/occupational-health', name: '职业健康', opts: [{ sel: '体检', pick: '上岗前' }] },
  { url: '/safety/risk-reporting', name: '风险报备', opts: [{ sel: '等级', pick: '一级' }] },
  { url: '/safety/ai-workflow-config', name: 'AI配置', opts: [] },
]

for (const p of listPages) {
  test.describe(p.name, () => {
    test('页面加载', async ({ page }) => {
      await page.goto(p.url); await waitForPageLoad(page, 3000)
      await expectNoApplicationError(page)
    })
    for (const o of p.opts.slice(0, 2)) {
      test(`筛选-${o.sel}`, async ({ page }) => {
        await page.goto(p.url); await waitForPageLoad(page, 3000)
        const sel = page.locator('.ant-select').filter({ hasText: o.sel }).first()
        if (await sel.isVisible().catch(() => false)) { await openSelectAndPick(page, sel, o.pick) }
      })
    }
  })
}
