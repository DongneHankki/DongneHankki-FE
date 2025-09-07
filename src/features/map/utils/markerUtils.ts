// industryCode에 따라 마커 이미지를 결정하는 함수

export const getMarkerImage = (industryCode: string | number): any => {

  const code = String(industryCode);

  if (code === '2501' || code === '2502') {
    return require('../assets/images/coffee.png');
  }

  if (code === '5201' || code === '5202') {
    return require('../assets/images/retail.png');
  }
  
  if (code === '2301' || code === '2302' || code === '2303' || code === '2305' || code === '2309' || code === '2310' || code === '2601') {
    return require('../assets/images/store.png');
  }
  return require('../assets/images/restaurant.png');
};

// 선택된 탭에 따라 매장을 필터링하는 함수
export const filterStoresByTab = (stores: any[], selectedTab: string | null): any[] => {
  if (!selectedTab) {
    return stores; // 탭이 선택되지 않았으면 모든 매장 반환
  }

  return stores.filter(store => {
    const code = String(store.industryCode);
    
    switch (selectedTab) {
      case 'foodstore':
        // 식료품점: 2301, 2302, 2303, 2305, 2309, 2310, 2601
        return ['2301', '2302', '2303', '2305', '2309', '2310', '2601'].includes(code);
      
      case 'cafe':
        // 카페: 2501, 2502
        return ['2501', '2502'].includes(code);
      
      case 'retail':
        // 소매 상점: 5201, 5202
        return ['5201', '5202'].includes(code);
      
      case 'restaurant':
        // 식당: 나머지 모든 코드
        return !['2301', '2302', '2303', '2305', '2309', '2310', '2601', '2501', '2502', '5201', '5202'].includes(code);
      
      default:
        return true;
    }
  });
};