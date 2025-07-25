import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display homepage with project overview', async ({ page }) => {
    await page.goto('/')

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/SELFFIN/)

    // 메인 헤더 확인
    await expect(page.locator('h1')).toContainText('SELFFIN')
    
    // 기본 설명 텍스트 확인
    await expect(page.locator('text=AI 기반 인테리어 프로젝트 일정 관리 시스템')).toBeVisible()

    // 새 프로젝트 만들기 버튼 확인
    await expect(page.locator('text=새 프로젝트 만들기')).toBeVisible()
  })

  test('should navigate to project creation page', async ({ page }) => {
    await page.goto('/')

    // 새 프로젝트 만들기 버튼 클릭
    await page.click('text=새 프로젝트 만들기')

    // 프로젝트 생성 페이지로 이동 확인
    await expect(page).toHaveURL('/create')
    await expect(page.locator('h1')).toContainText('새 프로젝트 생성')
  })

  test('should show empty state when no projects exist', async ({ page }) => {
    await page.goto('/')

    // 빈 상태 메시지 확인
    const emptyStateText = ['아직 프로젝트가 없습니다', '진행 중인 프로젝트가 없습니다']
    const hasEmptyState = await Promise.all(
      emptyStateText.map(text => page.locator(`text=${text}`).isVisible())
    )
    
    // 적어도 하나의 빈 상태 메시지가 표시되어야 함
    expect(hasEmptyState.some(Boolean)).toBeTruthy()
  })

  test('should display bottom navigation', async ({ page }) => {
    await page.goto('/')

    // 하단 네비게이션 확인
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible()
    
    // 네비게이션 탭들 확인
    await expect(page.locator('text=홈')).toBeVisible()
    await expect(page.locator('text=프로젝트')).toBeVisible()
    await expect(page.locator('text=일정')).toBeVisible()
    await expect(page.locator('text=설정')).toBeVisible()
  })

  test('should be responsive for mobile viewport', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 모바일 헤더 확인
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible()
    
    // 하단 네비게이션이 모바일에서도 보이는지 확인
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible()
  })
})