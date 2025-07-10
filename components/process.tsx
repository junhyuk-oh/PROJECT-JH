import { FileText, Bot, Target } from "lucide-react"

const steps = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: "📝 정보 입력",
    description: "평수, 예산, 희망사항 입력 후 AI 즉시 분석",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: "🤖 AI 분석",
    description: "맞춤형 공정표, 예산 계획, 업체 추천 자동 생성",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "🎯 실행 관리",
    description: "일정 알림부터 품질 체크까지 스마트 관리",
    color: "from-green-500 to-emerald-500",
  },
]

export default function Process() {
  return (
    <section id="process" className="py-20 bg-white/60">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              진행 과정
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">복잡한 반셀프인테리어를 3단계로 간단하게</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-orange-300 to-amber-300 transform -translate-y-1/2" />
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-orange-300 to-amber-300 transform -translate-y-1/2" />

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl text-center">
                  <div
                    className={`inline-flex p-4 rounded-full bg-gradient-to-r ${step.color} text-white mb-6 mx-auto`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>

                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
