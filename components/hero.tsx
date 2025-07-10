import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-orange-300/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-amber-300/20 blur-[80px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-orange-700 mb-8 border border-orange-200">
          <Sparkles className="h-4 w-4" />
          <span>AI가 관리하는 반셀프인테리어</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
            🤖 AI가 관리하는
          </span>
          <br />
          <span className="text-gray-800">반셀프인테리어</span>
        </h1>

        <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          복잡한 공정표부터 업체 매칭까지, AI가 모든 것을 똑똑하게 관리해드립니다.
          <br />
          <span className="font-semibold text-orange-700">인테리어 초보도 3주 만에 전문가처럼 성공하는 AI 파트너</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
          >
            📋 내 공정표 만들기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-transparent"
          >
            <Play className="mr-2 h-5 w-5" />🎯 기능 살펴보기
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-amber-200">
            <div className="text-xl md:text-2xl font-bold text-orange-600 mb-2">3주</div>
            <div className="text-gray-600">평균 완성 기간</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-amber-200">
            <div className="text-xl md:text-2xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-600">고객 만족도</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-amber-200">
            <div className="text-xl md:text-2xl font-bold text-orange-600 mb-2">30%</div>
            <div className="text-gray-600">비용 절약</div>
          </div>
        </div>
      </div>
    </section>
  )
}
