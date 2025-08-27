// 탭 상수
export const TABS = [
    { id: 'restaurant', label: '식당', icon: 'restaurant', iconType: 'material' },
    { id: 'cafe', label: '카페', icon: 'local-cafe', iconType: 'material' },
    { id: 'foodstore', label: '식료품점', icon: 'store', iconType: 'material' },
    { id: 'retail', label: '소매 상점', icon: 'shopping-basket', iconType: 'material' },
  ];
  
  // 별점 상수
  export const RATING_OPTIONS = [
    { value: 5, label: '5점 이상' },
    { value: 4, label: '4점 이상' },
    { value: 3, label: '3점 이상' },
    { value: 2, label: '2점 이상' },
    { value: 1, label: '1점 이상' },
  ];
  
  // 요일 상수
  export const DAY_OPTIONS = [
    { value: 'monday', label: '월' },
    { value: 'tuesday', label: '화' },
    { value: 'wednesday', label: '수' },
    { value: 'thursday', label: '목' },
    { value: 'friday', label: '금' },
    { value: 'saturday', label: '토' },
    { value: 'sunday', label: '일' },
  ];

  // 시간 상수
  export const TIME_RANGE_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'morning', label: '오전 (06:00-12:00)' },
    { value: 'afternoon', label: '오후 (12:00-18:00)' },
    { value: 'evening', label: '저녁 (18:00-24:00)' },
    { value: 'night', label: '새벽 (00:00-06:00)' },
  ];
  
  // 매장 카테고리 상수
  export const STORE_CATEGORIES = [
    { id: 'restaurant', name: '식당', icon: 'restaurant' },
    { id: 'cafe', name: '카페', icon: 'local-cafe' },
    { id: 'foodstore', name: '식료품점', icon: 'store' },
    { id: 'retail', name: '소매 상점', icon: 'store' },
    { id: 'convenience', name: '편의점', icon: 'store' },
    { id: 'bakery', name: '베이커리', icon: 'cake' },
    { id: 'pharmacy', name: '약국', icon: 'local-pharmacy' },
    { id: 'beauty', name: '미용실', icon: 'content-cut' },
  ];
  
  // 지역 화폐 관련 상수
  export const LOCAL_CURRENCY_INFO = {
    title: '지역 화폐 사용 가능 매장',
    description: '지역 화폐로 결제 가능한 매장을 찾아보세요',
    icon: 'handshake-outline',
  };
  
  // 필터 관련 상수
  export const FILTER_TYPES = {
    RATING: 'rating',
    TIME_RANGE: 'timeRange',
    CATEGORY: 'category',
    DISTANCE: 'distance',
  };
  
  // 거리 옵션 상수
  export const DISTANCE_OPTIONS = [
    { value: 0.5, label: '500m 이내' },
    { value: 1, label: '1km 이내' },
    { value: 2, label: '2km 이내' },
    { value: 5, label: '5km 이내' },
    { value: 10, label: '10km 이내' },
  ];
  
  // 색상 상수
  export const COLORS = {
    PRIMARY: '#2E1404',
    SECONDARY: '#4A4A4A',
    BACKGROUND: '#FFFFFF',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    BORDER: '#E0E0E0',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    TRANSPARENT_WHITE: 'rgba(255, 255, 255, 0.95)',
    TRANSPARENT_PRIMARY: 'rgba(46, 20, 4, 0.9)',
  };
  
  // 아이콘 크기 상수
  export const ICON_SIZES = {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
    XLARGE: 32,
  };
  
  // 애니메이션 상수
  export const ANIMATION_DURATION = {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  }; 