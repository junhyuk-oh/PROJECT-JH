"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"

interface MobileContainerProps {
  children: ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
}

export function MobileContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName
}: MobileContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  return (
    <div
      className={cn(
        className,
        isMobile && mobileClassName,
        isTablet && tabletClassName,
        isDesktop && desktopClassName
      )}
    >
      {children}
    </div>
  )
}