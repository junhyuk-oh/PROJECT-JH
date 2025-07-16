// Test the new realistic construction scheduling system
const { generateCompleteSchedule } = require('./lib/scheduleGenerator.ts');

// Simulate 42평 6주 리모델링 데이터
const testSpaces = [
  {
    id: 'living_room',
    name: '거실',
    estimatedArea: 10.5,
    actualArea: 10.5,
    scope: 'full',
    tasks: {
      flooring: ['laminate'],
      walls: ['paint'],
      electrical: true,
      furniture: true
    },
    priority: 1
  },
  {
    id: 'kitchen',
    name: '주방',
    estimatedArea: 3.36,
    actualArea: 3.36,
    scope: 'full',
    tasks: {
      flooring: ['tile'],
      walls: ['tile'],
      electrical: true,
      sink: 'full_replace',
      tiles: 'both'
    },
    priority: 1
  },
  {
    id: 'master_bedroom',
    name: '안방',
    estimatedArea: 6.3,
    actualArea: 6.3,
    scope: 'full',
    tasks: {
      flooring: ['laminate'],
      walls: ['wallpaper'],
      electrical: true,
      furniture: true
    },
    priority: 1
  },
  {
    id: 'small_bedroom',
    name: '작은방',
    estimatedArea: 4.2,
    actualArea: 4.2,
    scope: 'full',
    tasks: {
      flooring: ['laminate'],
      walls: ['paint'],
      electrical: true,
      furniture: true
    },
    priority: 2
  },
  {
    id: 'bathroom',
    name: '욕실',
    estimatedArea: 2.1,
    actualArea: 2.1,
    scope: 'full',
    tasks: {
      flooring: ['tile'],
      walls: ['tile'],
      electrical: true,
      renovation: 'full'
    },
    priority: 1
  }
];

const testBasicInfo = {
  totalArea: 42,
  housingType: 'apartment',
  residenceStatus: 'occupied',
  preferredStyle: 'modern',
  projectDuration: '6주',
  workPriority: 'quality'
};

const testScheduleInfo = {
  startDate: new Date('2024-03-01'),
  workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  dailyWorkHours: { start: '09:00', end: '18:00' },
  unavailablePeriods: [],
  noiseRestrictions: 'weekdays_only',
  residenceStatus: 'live_in'
};

async function testRealisticScheduling() {
  try {
    console.log('=== 42평 전체 리모델링 현실적 스케줄링 테스트 ===\n');
    
    const result = await generateCompleteSchedule(
      testSpaces,
      testBasicInfo,
      testScheduleInfo
    );
    
    console.log('📊 스케줄링 결과:');
    console.log(`- 총 작업 수: ${result.tasks.length}개`);
    console.log(`- 예상 공사 기간: ${result.totalDays}일 (${Math.round(result.totalDays/7)}주)`);
    console.log(`- 총 예상 비용: ${result.totalCost?.toLocaleString()}원`);
    console.log(`- 평당 비용: ${result.insights?.costPerPyeong?.toLocaleString()}원/평`);
    console.log(`- 중요 경로 작업: ${result.criticalPath.length}개\n`);
    
    console.log('🏗️ 주요 작업 단계별 일정:');
    const phaseGroups = {};
    result.tasks.forEach(task => {
      const phase = getPhaseFromCategory(task.category);
      if (!phaseGroups[phase]) phaseGroups[phase] = [];
      phaseGroups[phase].push(task);
    });
    
    Object.keys(phaseGroups).sort().forEach(phase => {
      console.log(`\n${phase}:`);
      phaseGroups[phase]
        .sort((a, b) => a.earlyStart - b.earlyStart)
        .slice(0, 3) // 각 단계별 첫 3개 작업만 표시
        .forEach(task => {
          console.log(`  - ${task.name}: ${task.duration}일 (${task.estimatedCost.toLocaleString()}원)`);
        });
    });
    
    console.log('\n💰 비용 분석:');
    const costByCategory = {};
    result.tasks.forEach(task => {
      if (!costByCategory[task.category]) costByCategory[task.category] = 0;
      costByCategory[task.category] += task.estimatedCost;
    });
    
    Object.entries(costByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, cost]) => {
        console.log(`  - ${getCategoryDisplayName(category)}: ${cost.toLocaleString()}원`);
      });
    
    console.log('\n⚠️ 경고사항:');
    if (result.insights?.warnings) {
      result.insights.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
    
    console.log('\n✅ 현실성 검증:');
    console.log(`  - 비용 현실성: ${result.insights?.isRealistic ? '적정' : '재검토 필요'}`);
    console.log(`  - 42평 표준 리모델링 비용: 2,500만원 ~ 8,000만원`);
    console.log(`  - 현재 예상 비용: ${result.totalCost?.toLocaleString()}원`);
    
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  }
}

function getPhaseFromCategory(category) {
  const phaseMap = {
    'demolition': '1단계: 철거',
    'electrical': '2단계: 전기/배관',
    'plumbing': '2단계: 전기/배관',
    'carpentry': '3단계: 구조/목공',
    'flooring': '4단계: 바닥',
    'painting': '5단계: 도장',
    'lighting': '6단계: 마감',
    'cleanup': '7단계: 정리'
  };
  return phaseMap[category] || '기타';
}

function getCategoryDisplayName(category) {
  const displayMap = {
    'demolition': '철거',
    'electrical': '전기',
    'plumbing': '배관',
    'carpentry': '목공',
    'flooring': '바닥',
    'painting': '도장',
    'lighting': '조명',
    'cleanup': '정리'
  };
  return displayMap[category] || category;
}

// Run the test
testRealisticScheduling();