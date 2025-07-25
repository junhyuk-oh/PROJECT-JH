import { test, expect } from '@playwright/test'

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create')
  })

  test('should display project creation form', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('새 프로젝트 생성')

    // 필수 입력 필드들 확인
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('select, [role="combobox"]')).toBeVisible() // 프로젝트 타입 선택
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await expect(page.locator('input[name="budget"]')).toBeVisible()
    await expect(page.locator('input[name="area"]')).toBeVisible()

    // 제출 버튼 확인
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // 빈 폼으로 제출 시도
    await page.click('button[type="submit"]')

    // 에러 메시지나 필드 validation 확인
    // Note: 실제 validation 메시지는 구현에 따라 다를 수 있음
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toBeFocused()
  })

  test('should create project with valid data', async ({ page }) => {
    // 프로젝트 정보 입력
    await page.fill('input[name="name"]', '테스트 아파트 리모델링')
    
    // 프로젝트 타입 선택 (구현에 따라 다를 수 있음)
    const typeSelector = page.locator('select, [role="combobox"]').first()
    await typeSelector.click()
    await page.click('text=주거공간 전체')

    // 시작일 설정
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateString)

    // 예산 입력
    await page.fill('input[name="budget"]', '30000000')

    // 면적 입력
    await page.fill('input[name="area"]', '25')

    // 현재 상태 선택
    await page.fill('textarea, input[name="currentState"]', '벽지 제거 완료')

    // 폼 제출
    await page.click('button[type="submit"]')

    // 결과 페이지로 이동 확인
    await expect(page).toHaveURL(/\/schedule-results/)
    
    // 생성된 프로젝트 정보 확인
    await expect(page.locator('text=테스트 아파트 리모델링')).toBeVisible()
  })

  test('should show budget formatting', async ({ page }) => {
    const budgetInput = page.locator('input[name="budget"]')
    
    // 숫자 입력
    await budgetInput.fill('30000000')
    await budgetInput.blur()

    // 포맷된 값 확인 (구현에 따라 다를 수 있음)
    const formattedBudget = await budgetInput.inputValue()
    expect(formattedBudget).toMatch(/30,000,000|3000만/)
  })

  test('should toggle risk assessment section', async ({ page }) => {
    // 리스크 평가 토글 버튼 찾기
    const riskToggle = page.locator('text=리스크 평가').or(page.locator('[data-testid="risk-toggle"]'))
    
    if (await riskToggle.isVisible()) {
      await riskToggle.click()

      // 리스크 평가 섹션 확인
      await expect(page.locator('text=날씨 민감도').or(page.locator('text=공사 복잡도'))).toBeVisible()
    }
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    // 폼이 모바일에서도 잘 보이는지 확인
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // 스크롤 가능한지 확인
    await page.locator('button[type="submit"]').scrollIntoViewIfNeeded()
    await expect(page.locator('button[type="submit"]')).toBeInViewport()
  })
})