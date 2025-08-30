import { create } from 'zustand';

interface Store {
  storeId: number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  sigun: string;
  address: string;
  industryCode: number;
  businessRegistrationNumber: number;
  avgStar: number;
  operatingHours: OperatingHours[];
  owner: Owner;
  menus: any[];
  reviews: any[];
  // 가공된 데이터 필드들
  displayName?: string;
  displayAddress?: string;
  operatingHoursText?: string;
  rating?: number;
}

interface Time {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

interface OperatingHours {
  dayOfWeek: string;
  openTime: Time;
  closeTime: Time;
}

interface Owner {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: string;
  storeId: number;
  birth: string;
}

interface ClusterMarker {
  identifier: string;
  latitude: number;
  longitude: number;
  industryCode: number;
}

interface MapState {
  // 상태
  storeList: Store[];
  clusterMarkers: ClusterMarker[];
  loading: boolean;
  error: Error | null;
  selectedStore: Store | null;
  selectedIndustryCode: number | null; // 선택된 업종 코드
  selectedTab: string | null; // 선택된 탭
  searchKeyword: string; // 검색어 추가
  
  // 액션
  setStoreList: (stores: Store[]) => void;
  setClusterMarkers: (markers: ClusterMarker[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setSelectedStore: (store: Store | null) => void;
  setSelectedIndustryCode: (industryCode: number | null) => void;
  setSelectedTab: (tab: string | null) => void;
  setSearchKeyword: (keyword: string) => void; // 검색어 설정 액션 추가
  resetMapState: () => void; // 맵 상태 초기화 액션 추가
  
  // 탭 ID를 업종 코드로 변환하는 함수
  getIndustryCodeFromTab: (tabId: string | null) => number | number[] | string | null;
  
  // Store 데이터를 ClusterMarker 형태로 변환하는 함수
  convertToClusterMarkers: (stores: Store[]) => ClusterMarker[];
  
  // 선택된 매장 정보 가져오기
  getSelectedStore: () => Store | null;
  
  // 매장 ID로 매장 정보 가져오기
  getStoreById: (storeId: number) => Store | undefined;
  
  // 선택된 업종 코드로 필터링된 매장 목록 가져오기 (메모이제이션 적용)
  getFilteredStores: () => Store[];
  
  // 선택된 업종 코드로 필터링된 클러스터 마커 가져오기
  getFilteredClusterMarkers: () => ClusterMarker[];
}

// 메모이제이션을 위한 캐시
let filteredStoresCache: Store[] | null = null;
let lastStoreListLength = 0;
let lastSelectedIndustryCode: number | null = null;
let lastStoreListHash = '';

// 스토어 리스트의 해시를 생성하는 함수
const generateStoreListHash = (stores: Store[]): string => {
  return stores.map(store => `${store.storeId}-${store.industryCode}`).join(',');
};

export const useMapStore = create<MapState>((set, get) => ({
  // 초기 상태
  storeList: [],
  clusterMarkers: [],
  loading: false,
  error: null,
  selectedStore: null,
  selectedIndustryCode: null,
  selectedTab: null,
  searchKeyword: '', // 초기 검색어 설정
  
  // 액션들
  setStoreList: (stores) => {
    console.log('mapStore - setStoreList 호출됨, 스토어 개수:', stores.length);
    console.log('mapStore - 첫 번째 스토어 데이터:', stores[0]);
    
    // 캐시 강제 초기화
    filteredStoresCache = null;
    lastStoreListLength = stores.length;
    lastStoreListHash = generateStoreListHash(stores);
    
    set({ storeList: stores });
    console.log('mapStore - storeList 저장 완료, 캐시 초기화됨');
  },
  setClusterMarkers: (markers) => set({ clusterMarkers: markers }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedStore: (store) => set({ selectedStore: store }),
  setSelectedIndustryCode: (industryCode) => {
    // 업종 코드가 변경되면 캐시 무효화
    if (industryCode !== lastSelectedIndustryCode) {
      filteredStoresCache = null;
      lastSelectedIndustryCode = industryCode;
    }
    set({ selectedIndustryCode: industryCode });
  },
  setSelectedTab: (tab) => {
    // 탭이 변경되면 캐시 무효화
    const currentState = get();
    if (tab !== currentState.selectedTab) {
      filteredStoresCache = null;
    }
    set({ selectedTab: tab });
  },
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }), // 검색어 설정 액션 추가
  resetMapState: () => {
    // 캐시 초기화
    filteredStoresCache = null;
    lastSelectedIndustryCode = null;
    
    // 선택된 상태들 초기화 (기본 파라미터만 유지)
    set({
      selectedIndustryCode: null,
      selectedTab: null,
      searchKeyword: '',
      selectedStore: null,
    });
    console.log('mapStore - 맵 상태 초기화 완료');
  },
  
  // 탭 ID를 업종 코드로 변환하는 함수
  getIndustryCodeFromTab: (tabId) => {
    if (!tabId) return null;
    
    // 탭 ID에 따른 업종 코드 매핑 (요청사항에 맞게 수정)
    const tabToIndustryCode: { [key: string]: number | number[] | string } = {
      'foodstore': [2301, 2302, 2303, 2305, 2309, 2310, 2601], // 식료품점
      'cafe': [2501, 2502], // 카페
      'retail': [5201, 5202], // 소매 상점
      'restaurant': 'others', // 식당 (나머지 모든 코드)
    };
    
    return tabToIndustryCode[tabId] || null;
  },
  
  // Store 데이터를 ClusterMarker 형태로 변환하는 함수
  convertToClusterMarkers: (stores) => {
    return stores.map(store => ({
      identifier: store.storeId.toString(),
      latitude: store.latitude,
      longitude: store.longitude,
      industryCode: store.industryCode,
    }));
  },
  
  // 선택된 매장 정보 가져오기
  getSelectedStore: () => get().selectedStore,
  
  // 매장 ID로 매장 정보 가져오기
  getStoreById: (storeId) => {
    const { storeList } = get();
    return storeList.find(store => store.storeId === storeId);
  },
  
  // 선택된 업종 코드로 필터링된 매장 목록 가져오기 (메모이제이션 적용)
  getFilteredStores: () => {
    // 항상 최신 상태를 가져오기 위해 get() 사용
    const currentState = get();
    const { storeList, selectedIndustryCode, selectedTab } = currentState;
    
    console.log('mapStore - getFilteredStores 호출됨');
    console.log('mapStore - 현재 storeList 개수:', storeList.length);
    console.log('mapStore - 현재 selectedIndustryCode:', selectedIndustryCode);
    console.log('mapStore - 현재 selectedTab:', selectedTab);
    
    // 캐시 확인
    const currentStoreListHash = generateStoreListHash(storeList);
    if (filteredStoresCache && 
        lastStoreListLength === storeList.length && 
        lastSelectedIndustryCode === selectedIndustryCode &&
        lastStoreListHash === currentStoreListHash) {
      console.log('mapStore - 캐시 사용');
      return filteredStoresCache;
    }
    
    console.log('mapStore - 캐시 무효화, 새로 계산');
    
    // 필터링 수행
    let filteredStores: Store[];
    
    // selectedTab이 있으면 탭 기반으로 필터링
    if (selectedTab) {
      const industryCodes = currentState.getIndustryCodeFromTab(selectedTab);
      console.log('mapStore - selectedTab 기반 필터링, industryCodes:', industryCodes);
      
      if (industryCodes) {
        if (Array.isArray(industryCodes)) {
          filteredStores = storeList.filter(store => industryCodes.includes(store.industryCode));
        } else if (industryCodes === 'others') {
          // 식당 탭: 나머지 모든 코드 (식료품점, 카페, 소매상점 제외)
          const excludedCodes = [2301, 2302, 2303, 2305, 2309, 2310, 2601, 2501, 2502, 5201, 5202];
          filteredStores = storeList.filter(store => !excludedCodes.includes(store.industryCode));
        } else {
          filteredStores = storeList.filter(store => store.industryCode === industryCodes);
        }
      } else {
        filteredStores = storeList;
      }
    } else if (selectedIndustryCode) {
      // selectedIndustryCode가 있으면 업종 코드로 필터링
      console.log('mapStore - selectedIndustryCode로 필터링:', selectedIndustryCode);
      filteredStores = storeList.filter(store => store.industryCode === selectedIndustryCode);
    } else {
      // 필터 없음, 전체 스토어 반환
      console.log('mapStore - 필터 없음, 전체 스토어 반환');
      filteredStores = storeList;
    }
    
    console.log('mapStore - 필터링 후 스토어 개수:', filteredStores.length);
    
    // 캐시 업데이트
    filteredStoresCache = filteredStores;
    lastStoreListLength = storeList.length;
    lastSelectedIndustryCode = selectedIndustryCode;
    lastStoreListHash = currentStoreListHash;
    
    console.log('mapStore - 최종 반환 스토어 개수:', filteredStores.length);
    return filteredStores;
  },
  
  // 선택된 탭에 따라 필터링된 클러스터 마커 가져오기
  getFilteredClusterMarkers: () => {
    const { clusterMarkers, selectedTab, getIndustryCodeFromTab } = get();
    if (!selectedTab) return clusterMarkers;
    
    const industryCodes = getIndustryCodeFromTab(selectedTab);
    if (!industryCodes) return clusterMarkers;
    
    // 배열인 경우 여러 업종 코드에 대해 필터링
    if (Array.isArray(industryCodes)) {
      return clusterMarkers.filter(marker => industryCodes.includes(marker.industryCode));
    }
    
    // 'others'인 경우 나머지 모든 코드 (식료품점, 카페, 소매상점 제외)
    if (industryCodes === 'others') {
      const excludedCodes = [2301, 2302, 2303, 2305, 2309, 2310, 2601, 2501, 2502, 5201, 5202];
      return clusterMarkers.filter(marker => !excludedCodes.includes(marker.industryCode));
    }
    
    // 숫자인 경우 단일 업종 코드에 대해 필터링
    return clusterMarkers.filter(marker => marker.industryCode === industryCodes);
  },
}));
