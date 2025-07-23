/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 노션 스타일 색상 시스템
        notion: {
          // 기본 배경색
          bg: '#ffffff',
          'bg-secondary': '#f7f7f5',
          'bg-hover': '#f1f1ef',
          'bg-selected': '#e9e9e7',
          
          // 다크모드 배경색
          'dark-bg': '#191919',
          'dark-bg-secondary': '#202020',
          'dark-bg-hover': '#2f2f2f',
          'dark-bg-selected': '#383838',
          
          // 텍스트 색상
          text: '#37352f',
          'text-secondary': '#787774',
          'text-tertiary': '#9b9a97',
          'text-disabled': '#e9e9e7',
          
          // 다크모드 텍스트
          'dark-text': '#ffffffcf',
          'dark-text-secondary': '#ffffff71',
          'dark-text-tertiary': '#ffffff40',
          
          // 액센트 색상
          blue: '#0b6e99',
          'blue-bg': '#e7f3f8',
          red: '#e03e3e',
          'red-bg': '#fbe4e4',
          yellow: '#dfab01',
          'yellow-bg': '#fbf3db',
          green: '#0f7b6c',
          'green-bg': '#ddedea',
          purple: '#6940a5',
          'purple-bg': '#eae4f2',
          pink: '#ad1a72',
          'pink-bg': '#f4dfeb',
          
          // 테두리
          border: '#e9e9e7',
          'dark-border': '#383838',
        }
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Apple Color Emoji',
          'Arial',
          'sans-serif',
          'Segoe UI Emoji',
          'Segoe UI Symbol'
        ],
      },
      fontSize: {
        'notion-xs': ['11px', '16px'],
        'notion-sm': ['14px', '20px'],
        'notion-base': ['16px', '24px'],
        'notion-lg': ['18px', '26px'],
        'notion-xl': ['22px', '30px'],
        'notion-2xl': ['26px', '34px'],
        'notion-3xl': ['30px', '38px'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'notion-sm': 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px',
        'notion-md': 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
        'notion-lg': 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}