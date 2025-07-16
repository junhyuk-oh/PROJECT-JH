import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트는 필요할 때만 초기화
let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json()
    const { area, budget, period, style, description, customArea, customBudget, customPeriod, customStyle } = body

    // 필수 필드 검증
    if (!area || !budget || !period || !style) {
      return NextResponse.json(
        { 
          success: false, 
          error: "필수 정보가 누락되었습니다." 
        },
        { status: 400 }
      )
    }

    // 사용자 입력 데이터 정리
    const finalArea = area === "직접 입력" ? customArea : area
    const finalBudget = budget === "직접 입력" ? customBudget : budget
    const finalPeriod = period === "직접 입력" ? customPeriod : period
    const finalStyle = style === "직접 입력" ? customStyle : style

    // 간단한 목업 데이터 먼저 반환 (OpenAI 호출 전 테스트)
    const mockData = {
      totalWeeks: 4,
      totalBudget: finalBudget,
      schedule: [
        {
          week: 1,
          title: "계획 및 준비",
          tasks: ["공간 측정 및 설계", "자재 목록 작성", "업체 상담"],
          cost: "50만원",
          materials: ["측정도구", "설계도구"],
          contractor: false,
          tips: "정확한 측정이 성공의 열쇠입니다"
        },
        {
          week: 2,
          title: "철거 및 기초 작업",
          tasks: ["기존 시설 철거", "전기/배관 점검", "바닥 정리"],
          cost: "200만원",
          materials: ["철거도구", "보호장비"],
          contractor: true,
          tips: "안전을 최우선으로 작업하세요"
        },
        {
          week: 3,
          title: "시공 작업",
          tasks: ["바닥재 시공", "벽지/페인트 작업", "조명 설치"],
          cost: "300만원",
          materials: ["바닥재", "페인트", "조명"],
          contractor: true,
          tips: "환기를 충분히 하며 작업하세요"
        },
        {
          week: 4,
          title: "마무리 및 정리",
          tasks: ["가구 배치", "소품 설치", "최종 청소"],
          cost: "100만원",
          materials: ["청소도구", "소품"],
          contractor: false,
          tips: "천천히 완성도를 높여가세요"
        }
      ],
      summary: `${finalArea} 공간의 ${finalStyle} 스타일 인테리어를 ${finalPeriod} 동안 ${finalBudget} 예산으로 진행하는 맞춤 계획입니다.`
    }

    return NextResponse.json({
      success: true,
      data: mockData
    })

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "서버 처리 중 오류가 발생했습니다." 
      },
      { status: 500 }
    )
  }
}

