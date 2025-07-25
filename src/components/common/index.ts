/**
 * 공통 컴포넌트 모음 - ESM 스타일 export
 */

import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'

export { LoadingSpinner } from './LoadingSpinner'
export { ErrorMessage } from './ErrorMessage'
export { EmptyState } from './EmptyState'

// 기본 export 추가 (2025 ESM 트렌드)
const CommonComponents = {
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
}

export default CommonComponents