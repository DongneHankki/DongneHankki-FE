import React, { useCallback, useRef, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StoreInfo from './StoreInfo';
import StoreDetail from './StoreDetail';

// StoreDetail을 any로 타입 단언
const StoreDetailComponent = StoreDetail as any;
import FilterModal from './FilterModal';
import { useMapStore } from '../store/mapStore';

import { FONTS } from '../../../shared/styles/globalStyles';
import { TABS, LOCAL_CURRENCY_INFO, COLORS, ICON_SIZES } from '../constants/constants';

interface BottomSheetProps {
  children?: React.ReactNode;
  index?: number;
  onChange?: (index: number) => void;
  snapPoints?: string[];
  selectedStore?: any;
  selectedStoreDetail?: any; // 추가
  onBackToStoreList?: () => void; // 추가
  locationLoading?: boolean; // 위치 로딩 상태 추가
  onFilterChange?: (filters: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }) => void;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({
  children,
  index = 1,
  onChange,
  snapPoints = ['3%', '40%', '70%'],
  selectedStore,
  selectedStoreDetail: externalSelectedStoreDetail, // 추가
  onBackToStoreList, // 추가
  locationLoading = false, // 위치 로딩 상태 추가
  onFilterChange,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [internalSelectedStoreDetail, setInternalSelectedStoreDetail] = useState<any>(null);
  const { selectedStore: storeSelectedStore, selectedTab, getFilteredStores, setSelectedStore, selectedIndustryCode } = useMapStore();
  
  // props로 받은 selectedStore가 있으면 사용, 없으면 store에서 가져온 것 사용
  const currentSelectedStore = selectedStore || storeSelectedStore;
  
  // 외부에서 제어하는 selectedStoreDetail이 있으면 사용, 없으면 내부 상태 사용
  const selectedStoreDetail = externalSelectedStoreDetail || internalSelectedStoreDetail;

  const handleSheetChange = useCallback((i: number) => {
    if (onChange) onChange(i);
  }, [onChange]);

  const handleFilterPress = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  const handleFilterApply = useCallback((filters: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }) => {
    // 필터 적용 로직
    console.log('필터 적용:', filters);
    
    // 필터 상태를 store에 저장하고 API 재호출
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [onFilterChange]);

  const handleStorePress = useCallback((store: any) => {
    setInternalSelectedStoreDetail(store);
  }, []);

  const handleBackToStoreList = useCallback(() => {
    setInternalSelectedStoreDetail(null);
    setSelectedStore(null); // 뒤로가기 시 selectedStore도 초기화
  }, [setSelectedStore]);

  // 선택된 탭에 따라 제목 결정
  const title = (() => {
    if (selectedStoreDetail) {
      return selectedStoreDetail.name;
    }
    if (currentSelectedStore) {
      return currentSelectedStore.name;
    }
    if (selectedTab) {
      const selectedTabData = TABS.find(tab => tab.id === selectedTab);
      return selectedTabData ? selectedTabData.label : LOCAL_CURRENCY_INFO.title;
    }
    return LOCAL_CURRENCY_INFO.title;
  })();

  // 필터링된 스토어 목록
  const filteredStores = (() => {
    const stores = getFilteredStores();
    return stores;
  })();

  // FlatList 렌더 아이템 함수
  const renderStoreItem = ({ item: store }: { item: any }) => {
    return (
      <TouchableOpacity onPress={() => handleStorePress(store)}>
        <StoreInfo
          storeName={store.displayName || store.name || '매장명 없음'}
          location={store.displayAddress || store.address || '주소 정보 없음'}
          operatingHours={store.operatingHoursText || '영업 시간 정보 없음'}
          rating={store.rating || store.likeCount || 4}
          onSubscribe={() => {}}
          industryCode={store.industryCode}
        />
      </TouchableOpacity>
    );
  };

  // FlatList keyExtractor
  const keyExtractor = (item: any) => item.storeId.toString();

  // 로딩 상태 렌더링
  const loadingContent = (
    <View style={styles.loadingContainer}>
      <Icon name="location-searching" size={48} color="#666" />
      <Text style={styles.loadingText}>내 위치를 불러오는 중...</Text>
    </View>
  );

  // 데이터 없음 상태 렌더링
  const emptyContent = (
    <View style={styles.emptyContainer}>
      <Icon name="location-off" size={48} color="#ccc" />
      <Text style={styles.emptyText}>현재 위치 주변 매장 정보를 불러오는 중...</Text>
      <Text style={styles.emptySubText}>위치 권한을 허용해주세요</Text>
    </View>
  );

  // 위치 권한 없음 상태 렌더링
  const noLocationContent = (
    <View style={styles.emptyContainer}>
      <Icon name="location-off" size={48} color="#ccc" />
      <Text style={styles.emptyText}>위치 권한이 필요합니다</Text>
      <Text style={styles.emptySubText}>설정에서 위치 권한을 허용해주세요</Text>
    </View>
  );

  // 헤더 렌더링
  const headerContent = (
    <View style={styles.titleContainer}>
      <View style={styles.titleLeft}>
        <Icon name={LOCAL_CURRENCY_INFO.icon} size={ICON_SIZES.MEDIUM} color={COLORS.TEXT_PRIMARY} />
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
        <FontAwesome name="sliders" size={ICON_SIZES.MEDIUM} color={COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  // FlatList ListHeaderComponent
  const listHeaderComponent = headerContent;

  // 매장 목록 렌더링을 위한 조건부 렌더링
  const renderContent = () => {
    if (locationLoading) {
      return loadingContent;
    }
    
    if (selectedStoreDetail) {
      return (
        <StoreDetailComponent 
          store={selectedStoreDetail} 
          onBack={handleBackToStoreList}
        />
      );
    }
    
    if (currentSelectedStore) {
      return (
        <StoreDetailComponent 
          store={currentSelectedStore} 
          onBack={() => {
            setInternalSelectedStoreDetail(null);
            setSelectedStore(null);
          }}
        />
      );
    }
    
    // 데이터가 없으면 빈 상태 표시
    if (filteredStores.length === 0) {
      // 데이터가 없어도 FlatList를 렌더링 (빈 목록이라도)
      return (
        <FlatList
          data={filteredStores}
          renderItem={renderStoreItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeaderComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={3}
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
          getItemLayout={(data, index) => ({
            length: 120, // StoreInfo 컴포넌트의 예상 높이
            offset: 120 * index,
            index,
          })}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="location-searching" size={48} color="#666" />
              <Text style={styles.emptyText}>매장 정보를 불러오는 중...</Text>
              <Text style={styles.emptySubText}>잠시만 기다려주세요</Text>
            </View>
          )}
        />
      );
    }
    
    return (
      <FlatList
        data={filteredStores}
        renderItem={renderStoreItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeaderComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
        getItemLayout={(data, index) => ({
          length: 120, // StoreInfo 컴포넌트의 예상 높이
          offset: 120 * index,
          index,
        })}
        contentContainerStyle={styles.flatListContent}
      />
    );
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={index}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </BottomSheet>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </>
  );
};

// 성능 디버깅을 위한 displayName 추가
CustomBottomSheet.displayName = 'CustomBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'left',
    fontFamily: FONTS.bold,
  },
  filterButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
});

export default CustomBottomSheet;
