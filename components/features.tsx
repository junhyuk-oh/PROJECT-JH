import { Search, Calendar, Building, DollarSign, FileText, ClipboardList } from "lucide-react"

const features = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "🔍 AI 맞춤 분석",
    description: "평수, 예산, 기간 입력 시 최적 공정표 자동 생성",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "📅 스마트 일정 관리",
    description: "공정별 알림과 자동 일정 조정",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Building className="h-8 w-8" />,
    title: "🏢 검증된 업체 매칭",
    description: "지역별, 전문성별 AI 자동 추천",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: <ClipboardList className="h-8 w-8" />,
    title: "📋 작업지시서 생성",
    description: "공정별 명확한 작업지시서로 분쟁 예방",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: "💰 실시간 예산 관리",
    description: "지출 추적 및 예산 초과 시 대안 제시",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "🎨 공정별 추천 디자인",
    description: "각 공정에 최적화된 디자인 가이드 제공 (3D 미리보기 추후 지원)",
    color: "from-indigo-500 to-purple-500",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-20 bg-white/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              핵심 기능
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            복잡한 반셀프인테리어를 AI가 체계적으로 관리해주는 6가지 핵심 기능
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-amber-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
