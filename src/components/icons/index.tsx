import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const CalendarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
)

export const GanttIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="6" width="10" height="3" rx="1" fill="currentColor"/>
    <rect x="7" y="11" width="12" height="3" rx="1" fill="currentColor"/>
    <rect x="5" y="16" width="8" height="3" rx="1" fill="currentColor"/>
    <path d="M3 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const AIIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M12 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18.364 5.636L15.536 8.464" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8.464 15.536L5.636 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5.636 5.636L8.464 8.464" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15.536 15.536L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ChevronLeft: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const SettingsIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19.4 15C19.1044 15.6301 19.2583 16.3849 19.7693 16.8558L19.8558 16.9423C20.2515 17.338 20.4756 17.8756 20.4756 18.4365C20.4756 18.9975 20.2515 19.5351 19.8558 19.9308C19.4601 20.3265 18.9225 20.5506 18.3615 20.5506C17.8006 20.5506 17.263 20.3265 16.8673 19.9308L16.7808 19.8442C16.3099 19.3332 15.5551 19.1794 14.925 19.475C14.3058 19.7593 13.8897 20.3774 13.8385 21.0769L13.8269 21.2308C13.8269 22.3773 12.9004 23.3077 11.75 23.3077C10.5996 23.3077 9.67308 22.3773 9.67308 21.2308L9.66154 21.0769C9.63365 20.7027 9.47266 20.3541 9.21106 20.0962C8.94947 19.8384 8.60572 19.6891 8.24615 19.675C7.61608 19.3794 6.86119 19.5332 6.39034 20.0442L6.30384 20.1308C5.90815 20.5265 5.37054 20.7506 4.80957 20.7506C4.2486 20.7506 3.71099 20.5265 3.3153 20.1308C2.91961 19.7351 2.69549 19.1975 2.69549 18.6365C2.69549 18.0756 2.91961 17.538 3.3153 17.1423L3.40184 17.0558C3.91282 16.5849 4.06664 15.8301 3.77105 15.2C3.48693 14.5808 2.86881 14.1647 2.16923 14.1135L2.01538 14.1019C0.868923 14.1019 -0.0615385 13.1715 -0.0615385 12.025C-0.0615385 10.8785 0.868923 9.94808 2.01538 9.94808L2.16923 9.93654C2.54346 9.90865 2.89205 9.74766 3.14991 9.48606C3.40778 9.22447 3.55703 8.88072 3.57115 8.52115C3.86674 7.89108 3.71292 7.13619 3.20192 6.66534L3.11538 6.57884C2.71969 6.18315 2.49558 5.64554 2.49558 5.08457C2.49558 4.5236 2.71969 3.98599 3.11538 3.5903C3.51107 3.19461 4.04868 2.9705 4.60965 2.9705C5.17062 2.9705 5.70823 3.19461 6.10392 3.5903L6.19042 3.67684C6.66127 4.18782 7.41616 4.34164 8.04623 4.04605V4.04605C8.66535 3.76193 9.08147 3.14381 9.13269 2.44423L9.14423 2.29038C9.14423 1.14392 10.0747 0.213461 11.2212 0.213461C12.3676 0.213461 13.2981 1.14392 13.2981 2.29038L13.3096 2.44423C13.3609 3.14381 13.777 3.76193 14.3961 4.04605C15.0262 4.34164 15.7811 4.18782 16.2519 3.67684L16.3385 3.5903C16.7341 3.19461 17.2718 2.9705 17.8327 2.9705C18.3937 2.9705 18.9313 3.19461 19.327 3.5903C19.7227 3.98599 19.9468 4.5236 19.9468 5.08457C19.9468 5.64554 19.7227 6.18315 19.327 6.57884L19.2404 6.66534C18.7295 7.13619 18.5756 7.89108 18.8712 8.52115C19.1554 9.14027 19.7735 9.55639 20.4731 9.60761L20.6269 9.61915C21.7734 9.61915 22.7038 10.5496 22.7038 11.6961C22.7038 12.8426 21.7734 13.773 20.6269 13.773L20.4731 13.7846C19.7735 13.8358 19.1554 14.2519 18.8712 14.871V14.871Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)