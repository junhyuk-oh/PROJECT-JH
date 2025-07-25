import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // 페이지가 로드되고 제목이 있는지 확인
    await expect(page.locator('h1')).toBeVisible()
    
    // 기본 텍스트 확인
    await expect(page.locator('text=SELFFIN')).toBeVisible()
  })

  test('create page loads successfully', async ({ page }) => {
    await page.goto('/create')
    
    // 프로젝트 생성 페이지가 로드되는지 확인
    await expect(page.locator('h1')).toBeVisible()
  })

  test('projects page loads successfully', async ({ page }) => {
    await page.goto('/projects')
    
    // 프로젝트 목록 페이지가 로드되는지 확인
    await expect(page.locator('h1')).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    await page.goto('/')
    
    // 홈에서 프로젝트로 이동
    const projectLink = page.locator('text=프로젝트').first()
    if (await projectLink.isVisible()) {
      await projectLink.click()
      await expect(page).toHaveURL(/\/projects/)
    }
  })
})