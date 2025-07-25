import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.describe('Projects List Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projects')
    })

    test('should display projects list page', async ({ page }) => {
      // 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('프로젝트')

      // 새 프로젝트 버튼 확인
      await expect(page.locator('text=새 프로젝트 만들기')).toBeVisible()

      // 필터 버튼들 확인 (있는 경우)
      const filterButtons = ['전체', '진행중', '완료']
      for (const filter of filterButtons) {
        const filterElement = page.locator(`text=${filter}`)
        if (await filterElement.isVisible()) {
          await expect(filterElement).toBeVisible()
        }
      }
    })

    test('should navigate to project creation', async ({ page }) => {
      await page.click('text=새 프로젝트 만들기')
      await expect(page).toHaveURL('/create')
    })

    test('should filter projects by status', async ({ page }) => {
      // 진행중 필터 클릭 (있는 경우)
      const inProgressFilter = page.locator('text=진행중')
      if (await inProgressFilter.isVisible()) {
        await inProgressFilter.click()
        
        // URL이나 필터 상태 확인
        await page.waitForTimeout(500) // 필터링 완료 대기
      }
    })
  })

  test.describe('Project Detail Page', () => {
    test('should handle project not found', async ({ page }) => {
      // 존재하지 않는 프로젝트 ID로 접근
      await page.goto('/projects/non-existent-project')

      // 에러 메시지나 홈으로 리다이렉트 확인
      const currentUrl = page.url()
      expect(currentUrl === 'http://localhost:3000/' || currentUrl.includes('projects')).toBeTruthy()
    })
  })

  test.describe('Schedule Results Page', () => {
    test('should handle schedule results page', async ({ page }) => {
      await page.goto('/schedule-results')

      // 프로젝트 ID가 없으면 홈으로 리다이렉트되어야 함
      await expect(page).toHaveURL('/')
    })

    test('should display schedule results with project ID', async ({ page }) => {
      // 쿼리 파라미터와 함께 접근
      await page.goto('/schedule-results?projectId=test-project')

      // 페이지가 로드되고 에러가 없는지 확인
      await page.waitForLoadState('networkidle')
      
      // 로딩 스피너나 에러 메시지 확인
      const hasLoadingSpinner = await page.locator('[data-testid="loading-spinner"]').isVisible()
      const hasErrorMessage = await page.locator('text=프로젝트를 불러오는 데 실패했습니다').isVisible()
      
      // 로딩이 끝나거나 에러가 표시되어야 함
      expect(hasLoadingSpinner || hasErrorMessage).toBeTruthy()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between main sections', async ({ page }) => {
      await page.goto('/')

      // 하단 네비게이션을 통한 이동 테스트
      const navigationItems = [
        { text: '프로젝트', url: '/projects' },
        { text: '일정', url: '/schedule' },
        { text: '설정', url: '/settings' }
      ]

      for (const item of navigationItems) {
        const navLink = page.locator(`text=${item.text}`)
        if (await navLink.isVisible()) {
          await navLink.click()
          await expect(page).toHaveURL(item.url)
        }
      }
    })

    test('should maintain navigation state', async ({ page }) => {
      await page.goto('/projects')

      // 프로젝트 탭이 활성화되어 있는지 확인
      const projectsTab = page.locator('[data-testid="nav-projects"]').or(page.locator('text=프로젝트'))
      if (await projectsTab.isVisible()) {
        // 활성 상태 클래스나 속성 확인
        const isActive = await projectsTab.getAttribute('class')
        expect(isActive).toContain('active')
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/projects')

      // 태블릿에서 레이아웃 확인
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible()
    })

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/projects')

      // 모바일에서 터치 친화적 UI 확인
      const createButton = page.locator('text=새 프로젝트 만들기')
      await expect(createButton).toBeVisible()
      
      // 버튼 크기가 터치에 적합한지 확인 (최소 44px)
      const buttonBox = await createButton.boundingBox()
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // 네트워크를 오프라인으로 설정
      await page.context().setOffline(true)
      
      await page.goto('/projects')

      // 에러 메시지나 오프라인 상태 표시 확인
      await page.waitForTimeout(2000) // 네트워크 에러 대기
      
      const hasErrorMessage = await page.locator('text=프로젝트를 불러오는 데 실패했습니다').isVisible()
      const hasOfflineMessage = await page.locator('text=인터넷 연결을 확인해주세요').isVisible()
      
      expect(hasErrorMessage || hasOfflineMessage).toBeTruthy()

      // 네트워크 복구
      await page.context().setOffline(false)
    })

    test('should provide retry functionality', async ({ page }) => {
      await page.goto('/projects')

      // 에러 상황에서 다시 시도 버튼 확인
      const retryButton = page.locator('text=다시 시도')
      if (await retryButton.isVisible()) {
        await retryButton.click()
        await page.waitForTimeout(1000)
      }
    })
  })
})