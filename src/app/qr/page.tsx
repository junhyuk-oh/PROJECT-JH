'use client'

import { useEffect, useState } from 'react'

export default function QRPage() {
  const [networkUrl, setNetworkUrl] = useState('')

  useEffect(() => {
    // 네트워크 URL 설정
    const url = 'http://172.30.1.87:3000'
    setNetworkUrl(url)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">모바일에서 접속하기</h1>
        
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">네트워크 주소:</p>
          <p className="font-mono text-lg break-all">{networkUrl}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📱 접속 방법</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>모바일과 PC가 같은 Wi-Fi에 연결되어 있는지 확인</li>
              <li>모바일 브라우저에서 위 주소 입력</li>
              <li>홈 화면에 추가하여 앱처럼 사용 가능</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">💡 PWA 설치</h3>
            <p className="text-sm text-green-800">
              Chrome/Safari에서 접속 후 메뉴 → &ldquo;홈 화면에 추가&rdquo;를 선택하면 
              네이티브 앱처럼 사용할 수 있습니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigator.clipboard.writeText(networkUrl)}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          주소 복사하기
        </button>
      </div>
    </div>
  )
}