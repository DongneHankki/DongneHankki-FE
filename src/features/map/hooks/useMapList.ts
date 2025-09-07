import { useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getMapData } from '../services/MapsAPI';
import { useMapStore } from '../store/mapStore';

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
}

interface GetMapResponse {
  status: string;
  code: string;
  message: string;
  data: Store[];
}

export const useMapList = (
  latitude: number | null, 
  longitude: number | null, 
  zoomLevel: number = 5, 
  keyword?: string,
  filters?: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }
) => {
  const navigation = useNavigation();
  const hasInitialized = useRef(false);
  const {
    storeList,
    clusterMarkers,
    loading,
    error,
    setStoreList,
    setClusterMarkers,
    setLoading,
    setError,
    convertToClusterMarkers,
  } = useMapStore();

  const fetchData = useCallback(async () => {
      // 위치 정보가 없으면 API 호출하지 않음
      if (!latitude || !longitude) {
        console.log('위치 정보가 없어서 API 호출을 건너뜁니다.');
        return;
      }

      console.log('API 호출 시작:', { latitude, longitude, zoomLevel, keyword });
      
      setLoading(true);
      setError(null);
      
      try {
        // industryCode는 null로 고정하여 모든 데이터를 가져옴, keyword와 filters 추가
        const data: GetMapResponse = await getMapData(latitude, longitude, zoomLevel, null, keyword, filters);

        const rawStores = data.data || [];
        console.log('API 응답 받음, 스토어 개수:', rawStores.length);
        console.log('API 응답 받은 스토어 데이터:', rawStores);
        
        // API 응답이 비어있는 경우 처리
        if (rawStores.length === 0) {
          console.log('API에서 데이터가 없음');
          setStoreList([]);
          setClusterMarkers([]);
          return;
        }
        
        // 첫 번째 스토어 데이터 구조 확인
        if (rawStores.length > 0) {
          console.log('첫 번째 스토어 원본 데이터:', rawStores[0]);
          console.log('첫 번째 스토어 name:', rawStores[0].name);
          console.log('첫 번째 스토어 address:', rawStores[0].address);
          console.log('첫 번째 스토어 industryCode:', rawStores[0].industryCode);
        }
        
        // StoreInfo에 맞게 데이터 가공
        const processedStores = rawStores.map(store => {
          // console.log('개별 스토어 데이터 가공:', store);
          
          return {
            ...store,
            // StoreInfo에서 사용할 수 있는 형태로 데이터 변환
            displayName: store.name && store.name.length > 20 ? `${store.name.substring(0, 20)}...` : (store.name || '매장명 없음'),
            displayAddress: store.address && store.address.length > 30 ? `${store.address.substring(0, 30)}...` : (store.address || '주소 정보 없음'),
            // 영업시간 정보 가공
            operatingHoursText: store.operatingHours && store.operatingHours.length > 0 
              ? `영업 시간 : ${store.operatingHours[0]?.openTime?.hour || '09'}:${store.operatingHours[0]?.openTime?.minute || '00'} ~ ${store.operatingHours[0]?.closeTime?.hour || '18'}:${store.operatingHours[0]?.closeTime?.minute || '00'}`
              : '영업 시간 : 09:00 ~ 18:00',
            // 별점 정보 가공 (avgStar가 있으면 사용, 없으면 기본값)
            rating: store.avgStar || 4,
            // 좋아요 수 (likeCount가 있으면 사용, 없으면 기본값)
            likeCount: store.likeCount || 0,
          };
        });
        
        console.log('데이터 가공 완료, 가공된 스토어 개수:', processedStores.length);
        console.log('가공된 스토어 데이터:', processedStores);
        
        console.log('useMapList - setStoreList 호출 전');
        setStoreList(processedStores);
        console.log('useMapList - setStoreList 호출 후');
        
        const markers = convertToClusterMarkers(processedStores);
        console.log('마커 변환 완료, 마커 개수:', markers.length);
        
        setClusterMarkers(markers);
        hasInitialized.current = true;
      } catch (err: any) {
        console.error('API 에러:', err);
        
        // 401 에러인 경우 LoginScreen으로 네비게이션
        if (err.response?.status === 401 || err.navigateToLogin) {
          console.log('401 에러 발생 - LoginScreen으로 네비게이션');
          navigation.navigate('LoginScreen' as never);
          return;
        }
        
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, [latitude, longitude, zoomLevel, keyword, filters, setStoreList, setClusterMarkers, setLoading, setError, convertToClusterMarkers]);

  useEffect(() => {

    // 위치가 있을 때만 API 호출
    if (latitude && longitude) {
      fetchData();
    }
  }, [fetchData]);

  const refetch = () => {
    if (latitude && longitude) {
      fetchData();
    }
  };

  return { storeList, clusterMarkers, loading, error, refetch };
};
