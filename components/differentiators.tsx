import { FileText, Scale, Building2, ClipboardCheck, Users } from "lucide-react"

export default function Differentiators() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              차별화 포인트
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            반셀프인테리어계의 테슬라, 인테리어AI만의 특별한 기술
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 킬러 기능 강조 */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 md:p-8 lg:p-12 text-white mb-8 md:mb-12 text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-white/20 p-3 md:p-4 rounded-full">
                <FileText className="h-8 w-8 md:h-12 md:w-12" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl lg:text-4xl font-bold mb-3 md:mb-4">📋 킬러 기능</h3>
            <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-6">AI가 생성하는 완벽한 계약서 & 작업지시서</p>
            <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-3xl mx-auto">
              복잡한 계약서 검토부터 공정별 작업지시서까지, AI가 법적 리스크를 미리 분석하고 완벽한 문서를 자동
              생성합니다.
            </p>
          </div>

          {/* 핵심 차별화 기능 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white inline-flex mb-4 md:mb-6">
                <Scale className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">⚖️ 계약서 AI 분석</h3>
              <p className="text-sm md:text-base text-gray-600">
                계약서를 OCR로 분석하여 유리한 조건과 위험 요소를 자동 검토
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl text-white inline-flex mb-4 md:mb-6">
                <ClipboardCheck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">📋 작업지시서 자동생성</h3>
              <p className="text-sm md:text-base text-gray-600">
                공정별 명확한 작업지시서로 업체와의 분쟁을 사전에 방지
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-xl text-white inline-flex mb-4 md:mb-6">
                <Building2 className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">🏢 아파트 민원 관리</h3>
              <p className="text-sm md:text-base text-gray-600">아파트 제출 서류와 민원 관리를 AI가 자동으로 정리</p>
            </div>
          </div>

          {/* 추가 혜택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200">
              <div className="flex items-center mb-4 md:mb-6">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mr-3" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">📄 계약서 양식 제공</h3>
              </div>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-600">
                <li>• 업체별 맞춤 계약서 양식 자동 생성</li>
                <li>• 법적 검토를 거친 안전한 조항 포함</li>
                <li>• 분쟁 예방을 위한 세부 조건 명시</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200">
              <div className="flex items-center mb-4 md:mb-6">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mr-3" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">🏘️ 관리사무소 연동</h3>
              </div>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-600">
                <li>• 공사 신고서 자동 작성 및 제출</li>
                <li>• 이웃 민원 예방 가이드 제공</li>
                <li>• 공사 시간 및 소음 관리 알림</li>
              </ul>
            </div>
          </div>

          {/* 성과 지표 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 text-gray-800">🏆 검증된 성과</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1 md:mb-2">95%</div>
                <div className="text-xs md:text-sm text-gray-600">계약서 분석 정확도</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-1 md:mb-2">80%</div>
                <div className="text-xs md:text-sm text-gray-600">분쟁 예방 효과</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1 md:mb-2">99%</div>
                <div className="text-xs md:text-sm text-gray-600">서류 처리 자동화</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">4.8/5</div>
                <div className="text-xs md:text-sm text-gray-600">사용자 만족도</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
