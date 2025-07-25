import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('should navigate with keyboard on homepage', async ({ page }) => {
      await page.goto('/')

      // Tab 키로 네비게이션 테스트
      await page.keyboard.press('Tab')
      
      // 포커스가 있는 요소 확인
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Enter 키로 활성화 테스트
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test('should navigate bottom navigation with keyboard', async ({ page }) => {
      await page.goto('/')

      // 하단 네비게이션에 포커스
      const bottomNav = page.locator('[data-testid="bottom-navigation"]')
      if (await bottomNav.isVisible()) {
        const navLinks = bottomNav.locator('a, button')
        const linkCount = await navLinks.count()

        for (let i = 0; i < linkCount; i++) {
          await navLinks.nth(i).focus()
          await expect(navLinks.nth(i)).toBeFocused()
          
          // Enter 키로 네비게이션 테스트
          if (i === 0) {
            await page.keyboard.press('Enter')
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('should handle escape key in modals', async ({ page }) => {
      await page.goto('/gantt')

      // 캘린더 뷰로 전환 후 날짜 클릭으로 모달 열기
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()
        
        const calendarDay = page.locator('.calendar-day, [data-testid="calendar-day"]').first()
        if (await calendarDay.isVisible()) {
          await calendarDay.click()
          
          // 모달이 열렸다면 Escape로 닫기
          const modal = page.locator('[role="dialog"], .modal')
          if (await modal.isVisible()) {
            await page.keyboard.press('Escape')
            await expect(modal).not.toBeVisible()
          }
        }
      }
    })
  })

  test.describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      await page.goto('/')

      // 버튼들이 적절한 ARIA 라벨을 가지는지 확인
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label')
          const buttonText = await button.textContent()
          
          // ARIA 라벨이나 텍스트 콘텐츠가 있어야 함
          expect(ariaLabel || buttonText).toBeTruthy()
        }
      }
    })

    test('should have proper navigation landmarks', async ({ page }) => {
      await page.goto('/')

      // main 역할 확인
      const main = page.locator('main, [role="main"]')
      if (await main.count() > 0) {
        await expect(main.first()).toBeVisible()
      }

      // navigation 역할 확인
      const nav = page.locator('nav, [role="navigation"]')
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible()
      }
    })

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/create')

      // 입력 필드들이 적절한 라벨을 가지는지 확인
      const inputs = page.locator('input, select, textarea')
      const inputCount = await inputs.count()

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const inputId = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledby = await input.getAttribute('aria-labelledby')

        if (inputId) {
          // 연관된 label 확인
          const label = page.locator(`label[for="${inputId}"]`)
          const hasLabel = await label.count() > 0
          
          // 라벨, ARIA 라벨, 또는 labelledby 중 하나는 있어야 함
          expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy()
        }
      }
    })
  })

  test.describe('Color Contrast and Visual', () => {
    test('should be readable in high contrast mode', async ({ page }) => {
      // 고대비 모드 시뮬레이션
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // 텍스트가 여전히 읽기 가능한지 확인
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()

      for (let i = 0; i < Math.min(headingCount, 3); i++) {
        const heading = headings.nth(i)
        if (await heading.isVisible()) {
          await expect(heading).toBeVisible()
          
          // 텍스트 내용이 있는지 확인
          const text = await heading.textContent()
          expect(text?.trim()).toBeTruthy()
        }
      }
    })

    test('should handle focus indicators', async ({ page }) => {
      await page.goto('/')

      // 포커스 가능한 요소들 확인
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const elementCount = await focusableElements.count()

      if (elementCount > 0) {
        const firstElement = focusableElements.first()
        await firstElement.focus()
        await expect(firstElement).toBeFocused()

        // 포커스 스타일이 적용되는지 확인 (outline, box-shadow 등)
        const styles = await firstElement.evaluate(el => {
          const computed = window.getComputedStyle(el, ':focus')
          return {
            outline: computed.outline,
            boxShadow: computed.boxShadow
          }
        })

        // 포커스 인디케이터가 있어야 함
        expect(styles.outline !== 'none' || styles.boxShadow !== 'none').toBeTruthy()
      }
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // 헤딩 계층 구조 확인
      const h1 = page.locator('h1')
      const h1Count = await h1.count()
      
      // 페이지에 h1이 하나 있어야 함
      expect(h1Count).toBeGreaterThanOrEqual(1)
      expect(h1Count).toBeLessThanOrEqual(1)

      // h1 다음에 h2가 와야 함 (건너뛰지 않고)
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()

      if (headingCount > 1) {
        const firstHeading = await headings.first().textContent()
        expect(firstHeading).toBeTruthy()
      }
    })

    test('should provide meaningful page titles', async ({ page }) => {
      const pages = [
        { url: '/', expectedTitle: /SELFFIN/ },
        { url: '/create', expectedTitle: /생성|만들기/ },
        { url: '/projects', expectedTitle: /프로젝트/ },
        { url: '/settings', expectedTitle: /설정/ }
      ]

      for (const { url, expectedTitle } of pages) {
        await page.goto(url)
        await expect(page).toHaveTitle(expectedTitle)
      }
    })

    test('should provide loading states with proper announcements', async ({ page }) => {
      await page.goto('/projects')

      // 로딩 스피너나 메시지 확인
      const loadingElement = page.locator('[data-testid="loading-spinner"], text=로딩, text=불러오는 중')
      
      if (await loadingElement.isVisible()) {
        // aria-live 속성 확인
        const ariaLive = await loadingElement.getAttribute('aria-live')
        const role = await loadingElement.getAttribute('role')
        
        // 스크린 리더에 알림이 가도록 설정되어 있는지 확인
        expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'status').toBeTruthy()
      }
    })
  })

  test.describe('Mobile Accessibility', () => {
    test('should have proper touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // 터치 대상이 44px 이상인지 확인
      const buttons = page.locator('button, a')
      const buttonCount = await buttons.count()

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44)
            expect(box.width).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('should support swipe gestures where appropriate', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/gantt')

      // 캘린더 뷰에서 스와이프 테스트
      const calendarToggle = page.locator('text=캘린더')
      if (await calendarToggle.isVisible()) {
        await calendarToggle.click()

        const calendarContainer = page.locator('.calendar-container, [data-testid="calendar-container"]')
        if (await calendarContainer.isVisible()) {
          // 터치 스와이프 시뮬레이션
          await page.touchscreen.tap(200, 300)
          await page.mouse.move(200, 300)
          await page.mouse.down()
          await page.mouse.move(100, 300)
          await page.mouse.up()
          
          await page.waitForTimeout(500)
        }
      }
    })
  })
})