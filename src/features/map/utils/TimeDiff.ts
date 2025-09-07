/**
 * 시간 차이를 계산하여 사용자 친화적인 문자열로 반환하는 유틸리티
 */

export const formatTimeDiff = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // 날짜만 비교 (시간 제외)
  const reviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const diffTime = today.getTime() - reviewDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 24시간 이내인지 확인
  const timeDiff = now.getTime() - date.getTime();
  const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
  const diffMinutes = Math.floor(timeDiff / (1000 * 60));
  
  console.log('날짜 계산:', {
    reviewDate: reviewDate.toISOString(),
    today: today.toISOString(),
    yesterday: yesterday.toISOString(),
    diffDays,
    diffHours,
    diffMinutes,
    originalDate: dateString
  });
  
  if (diffDays === 0) {
    // 오늘 작성된 경우
    if (diffHours < 1) {
      if (diffMinutes < 1) return '방금 전';
      return `${diffMinutes}분 전`;
    }
    if (diffHours < 24) return `${diffHours}시간 전`;
    return '오늘';
  }
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return date.toLocaleDateString('ko-KR');
};

/**
 * 두 날짜 간의 차이를 밀리초 단위로 반환
 */
export const getTimeDiff = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  return now.getTime() - date.getTime();
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  
  const reviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return reviewDate.getTime() === today.getTime();
};

/**
 * 날짜가 어제인지 확인
 */
export const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  
  const reviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return reviewDate.getTime() === yesterday.getTime();
};
