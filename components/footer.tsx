import Link from "next/link"
import { Bot, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* 브랜드 정보 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                인테리어AI
              </span>
            </Link>
            <p className="text-gray-200 mb-6 max-w-md">
              복잡한 셀프인테리어를 AI가 체계적으로 관리해주는 개인 전문가 서비스
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400" />
                <span className="text-gray-200">contact@interiorai.co.kr</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400" />
                <span className="text-gray-200">1588-0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-orange-400" />
                <span className="text-gray-200">서울시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-lg font-semibold mb-6">서비스</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-200 hover:text-orange-400 transition-colors">
                  AI 맞춤 분석
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-200 hover:text-orange-400 transition-colors">
                  스마트 일정 관리
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-200 hover:text-orange-400 transition-colors">
                  업체 매칭
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-200 hover:text-orange-400 transition-colors">
                  현장 AI 분석
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-lg font-semibold mb-6">고객지원</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-200 hover:text-purple-400 transition-colors">
                  이용가이드
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-200 hover:text-purple-400 transition-colors">
                  자주묻는질문
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-200 hover:text-purple-400 transition-colors">
                  1:1 문의
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-200 hover:text-purple-400 transition-colors">
                  공지사항
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 소셜 미디어 & 하단 정보 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-300">
              <Link href="#" className="hover:text-purple-400 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                이용약관
              </Link>
              <span>© 2025 인테리어AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
