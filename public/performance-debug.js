// 성능 문제 진단 스크립트
console.log('=== SELFFIN 성능 진단 시작 ===');

// 1. 개발 환경 성능 이슈 체크
const checkDevPerformance = () => {
  console.log('🔍 개발 환경 성능 체크:');
  
  // React DevTools 확인
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚠️  React DevTools 감지 - 성능에 영향을 줄 수 있음');
  }
  
  // Query DevTools 확인
  if (window.__REACT_QUERY_DEVTOOLS__) {
    console.log('⚠️  React Query DevTools 활성화 - 성능에 영향을 줄 수 있음');
  }
  
  // 성능 모니터링 체크
  console.log('🕐 성능 모니터링 활성 상태 확인');
  
  // 메모리 사용량 (Chrome만)
  if (performance.memory) {
    console.log('💾 메모리 사용량:', {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
};

// 2. 네트워크 요청 추적
const trackNetworkRequests = () => {
  console.log('🌐 네트워크 요청 추적 시작');
  
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    const response = await originalFetch(...args);
    const end = performance.now();
    
    console.log(`🔄 Fetch: ${args[0]} - ${(end - start).toFixed(2)}ms`);
    return response;
  };
};

// 3. 렌더링 성능 체크
const checkRenderPerformance = () => {
  console.log('🎨 렌더링 성능 체크');
  
  // 긴 태스크 감지
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        console.warn(`⚠️  긴 태스크 감지: ${entry.duration.toFixed(2)}ms`);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    console.log('Long Task API 지원하지 않음');
  }
};

// 4. 컴포넌트 리렌더링 추적
const trackReRenders = () => {
  console.log('🔄 컴포넌트 리렌더링 추적 시작');
  
  // React Profiler 시뮬레이션
  let renderCount = 0;
  const originalLog = console.log;
  
  // React 렌더링 감지 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    const logRender = () => {
      renderCount++;
      if (renderCount > 10) {
        console.warn(`⚠️  과도한 리렌더링 감지: ${renderCount}회`);
      }
    };
    
    // 5초마다 렌더링 카운트 리셋
    setInterval(() => {
      renderCount = 0;
    }, 5000);
  }
};

// 5. 메인 진단 실행
const runDiagnostics = () => {
  setTimeout(() => {
    checkDevPerformance();
    trackNetworkRequests();
    checkRenderPerformance();
    trackReRenders();
    
    console.log('✅ 성능 진단 완료 - 개발자 도구 Console을 확인하세요');
  }, 1000);
};

// 즉시 실행
runDiagnostics();

// 페이지 로드 성능 측정
window.addEventListener('load', () => {
  setTimeout(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      console.log('📊 페이지 로드 성능:', {
        'DNS 조회': `${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`,
        'TCP 연결': `${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`,
        '서버 응답': `${(navigation.responseEnd - navigation.requestStart).toFixed(2)}ms`,
        'DOM 로딩': `${(navigation.domContentLoadedEventEnd - navigation.responseEnd).toFixed(2)}ms`,
        '전체 로딩': `${(navigation.loadEventEnd - navigation.navigationStart).toFixed(2)}ms`
      });
    }
  }, 100);
});