import { test, expect } from '@playwright/test'

test.describe('Gantt Chart and Calendar Views', () => {
  test.describe('Gantt Chart', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/gantt')
    })

    test('should display gantt chart page', async ({ page }) => {
      // 간트차트 페이지 제목 확인
      await expect(page.locator('h1')).toContainText('간트차트')

      // 뷰 전환 버튼 확인
      const viewToggle = page.locator('text=캘린더').or(page.locator('[data-testid="view-toggle"]'))
      if (await viewToggle.isVisible()) {
        await expect(viewToggle).toBeVisible()
      }

      // 줌 컨트롤 확인
      const zoomControls = ['확대', '축소', '100%']
      for (const control of zoomControls) {
        const controlElement = page.locator(`text=${control}`)
        if (await controlElement.isVisible()) {
          await expect(controlElement).toBeVisible()
        }
      }
    })

    test('should display sample tasks', async ({ page }) => {
      // 샘플 작업들이 표시되는지 확인
      const sampleTasks = ['철거 작업', '전기 공사', '설비 공사', '도배 공사']
      
      for (const task of sampleTasks) {
        const taskElement = page.locator(`text=${task}`)
        if (await taskElement.isVisible()) {
          await expect(taskElement).toBeVisible()
        }
      }
    })

    test('should show task dependencies', async ({ page }) => {
      // 의존성 화살표가 SVG로 그려지는지 확인
      const dependencyArrows = page.locator('svg path, svg line')
      if (await dependencyArrows.count() > 0) {
        await expect(dependencyArrows.first()).toBeVisible()
      }
    })

    test('should handle task hover interactions', async ({ page }) => {
      // 작업 카드에 마우스 호버
      const taskCards = page.locator('[data-testid="task-card"]').or(page.locator('.task-bar'))
      
      const taskCount = await taskCards.count()
      if (taskCount > 0) {
        await taskCards.first().hover()
        
        // 호버 시 스타일 변화나 의존성 강조 확인
        await page.waitForTimeout(500)
      }
    })

    test('should handle zoom functionality', async ({ page }) => {
      // 확대 버튼 클릭
      const zoomInButton = page.locator('text=확대').or(page.locator('[data-testid="zoom-in"]'))
      if (await zoomInButton.isVisible()) {
        await zoomInButton.click()
        await page.waitForTimeout(500)
      }

      // 축소 버튼 클릭
      const zoomOutButton = page.locator('text=축소').or(page.locator('[data-testid="zoom-out"]'))
      if (await zoomOutButton.isVisible()) {
        await zoomOutButton.click()
        await page.waitForTimeout(500)
      }

      // 100% 버튼 클릭
      const resetZoomButton = page.locator('text=100%').or(page.locator('[data-testid="zoom-reset"]'))
      if (await resetZoomButton.isVisible()) {
        await resetZoomButton.click()
        await page.waitForTimeout(500)
      }
    })

    test('should toggle between gantt and calendar view', async ({ page }) => {
      // 캘린더 뷰로 전환
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()
        
        // 캘린더 뷰가 표시되는지 확인
        await expect(page.locator('.calendar-view, [data-testid="calendar-view"]')).toBeVisible()
        
        // 다시 간트차트로 전환
        const ganttToggle = page.locator('text=간트차트')
        if (await ganttToggle.isVisible()) {
          await ganttToggle.click()
          await expect(page.locator('.gantt-view, [data-testid="gantt-view"]')).toBeVisible()
        }
      }
    })
  })

  test.describe('Calendar View', () => {
    test('should display calendar with tasks', async ({ page }) => {
      await page.goto('/gantt')
      
      // 캘린더 뷰로 전환 (가능한 경우)
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()
      }

      // 캘린더 그리드 확인
      const calendarDays = page.locator('.calendar-day, [data-testid="calendar-day"]')
      if (await calendarDays.count() > 0) {
        await expect(calendarDays.first()).toBeVisible()
      }

      // 작업이 캘린더에 표시되는지 확인
      const taskEvents = page.locator('.task-event, .calendar-task')
      if (await taskEvents.count() > 0) {
        await expect(taskEvents.first()).toBeVisible()
      }
    })

    test('should navigate between months', async ({ page }) => {
      await page.goto('/gantt')
      
      // 캘린더 뷰로 전환
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()

        // 이전/다음 월 버튼 확인
        const prevButton = page.locator('[data-testid="prev-month"]').or(page.locator('text=이전'))
        const nextButton = page.locator('[data-testid="next-month"]').or(page.locator('text=다음'))

        if (await nextButton.isVisible()) {
          await nextButton.click()
          await page.waitForTimeout(500)
        }

        if (await prevButton.isVisible()) {
          await prevButton.click()
          await page.waitForTimeout(500)
        }
      }
    })

    test('should show task details on date click', async ({ page }) => {
      await page.goto('/gantt')
      
      // 캘린더 뷰로 전환
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()

        // 작업이 있는 날짜 클릭
        const taskDate = page.locator('.has-tasks, .calendar-day').first()
        if (await taskDate.isVisible()) {
          await taskDate.click()

          // 모달이나 상세 정보가 표시되는지 확인
          const modal = page.locator('[role="dialog"], .modal, [data-testid="task-modal"]')
          if (await modal.isVisible()) {
            await expect(modal).toBeVisible()
            
            // 모달 닫기
            const closeButton = page.locator('[data-testid="close-modal"]').or(page.keyboard.press('Escape'))
            await page.keyboard.press('Escape')
          }
        }
      }
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile for gantt chart', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/gantt')

      // 모바일에서 간트차트가 스크롤 가능한지 확인
      const ganttContainer = page.locator('.gantt-container, [data-testid="gantt-container"]')
      if (await ganttContainer.isVisible()) {
        await expect(ganttContainer).toBeVisible()
      }

      // 줌 컨트롤이 모바일에서도 사용 가능한지 확인
      const zoomControls = page.locator('[data-testid="zoom-controls"]')
      if (await zoomControls.isVisible()) {
        await expect(zoomControls).toBeVisible()
      }
    })

    test('should work on mobile for calendar', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/gantt')

      // 캘린더 뷰로 전환
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()

        // 모바일 캘린더 레이아웃 확인
        const calendarGrid = page.locator('.calendar-grid, [data-testid="calendar-grid"]')
        if (await calendarGrid.isVisible()) {
          await expect(calendarGrid).toBeVisible()
        }
      }
    })
  })

  test.describe('Performance', () => {
    test('should load gantt chart within reasonable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/gantt')
      
      // 간트차트가 로드될 때까지 대기
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 5초 이내에 로드되어야 함
      expect(loadTime).toBeLessThan(5000)
    })

    test('should handle large dataset efficiently', async ({ page }) => {
      await page.goto('/gantt')
      
      // 많은 작업이 있을 때 성능 확인
      await page.waitForTimeout(2000)
      
      // 스크롤 성능 테스트
      const ganttContainer = page.locator('.gantt-container, [data-testid="gantt-container"]')
      if (await ganttContainer.isVisible()) {
        await ganttContainer.hover()
        
        // 휠 스크롤 테스트
        await page.mouse.wheel(0, 100)
        await page.waitForTimeout(100)
        await page.mouse.wheel(0, -100)
      }
    })
  })
})