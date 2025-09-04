import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ReviewItemProps {
  shopName: string;
  reviewText: string;
  date: string;
}

const ReviewItem = ({ shopName, reviewText, date }: ReviewItemProps) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <View style={styles.starContainer}>
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.shopName}>{shopName}</Text>
      </View>
    </View>
    <View style={styles.reviewContent}>
      <View style={styles.reviewTextContainer}>
        <Text style={styles.reviewText}>{reviewText}</Text>
        <Text style={styles.reviewDate}>{date}</Text>
      </View>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.cameraIcon}>📷</Text>
      </View>
    </View>
  </View>
);

export default function FollowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const reviews = [
    {
      id: 1,
      shopName: "가게1",
      reviewText: "오늘도 정상영업합니다! 마카롱 많도 순두부찌개가 대표메뉴입니다 추천드립니다~ ...",
      date: "25.8.17.목"
    },
    {
      id: 2,
      shopName: "가게2", 
      reviewText: "8월 말까지 이벤트를 진행합니다! 50,000원 이상 구매 시 두루마리 휴지 무료 증정!",
      date: "25.8.17.목"
    },
    {
      id: 3,
      shopName: "가게3",
      reviewText: "다들 기다려주셔서 감사합니다! 여름 휴가를 마치고 재오픈 하였습니다!",
      date: "25.8.17.목"
    },
    {
      id: 4,
      shopName: "가게4",
      reviewText: "다들 기다려주셔서 감사합니다! 여름 휴가를 마치고 재오픈 하였습니다!",
      date: "25.8.17.목"
    }
  ];

  // 검색 기능 구현
  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // 실제 API 호출 대신 임시 데이터로 검색 시뮬레이션
      const mockStores = [
        { id: 1, name: "가게1", storeId: 14, type: "restaurant" },
        { id: 2, name: "가게2", storeId: 102, type: "cafe" },
        { id: 3, name: "가게3", storeId: 103, type: "restaurant" },
        { id: 4, name: "가게4", storeId: 104, type: "cafe" },
        { id: 5, name: "맛있는 치킨집", storeId: 105, type: "restaurant" },
        { id: 6, name: "스타벅스 강남점", storeId: 106, type: "cafe" },
      ];

      const filtered = mockStores.filter(store => 
        store.name.toLowerCase().includes(text.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreSelect = (store: any) => {
    // 특정 Owner의 FeedScreen으로 이동
    navigation.navigate('OwnerFeed', { 
      storeId: store.storeId,
      storeName: store.name,
      userType: 'customer' // customer가 owner 화면을 보는 것임을 표시
    });
    
    // 검색창 초기화
    setSearchText('');
    setSearchResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FBA542" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="가게 이름으로 검색"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          {/* 검색 결과 표시 */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.searchResultItem}
                  onPress={() => handleStoreSelect(store)}
                >
                  <Icon 
                    name={store.type === 'restaurant' ? 'restaurant' : 'local-cafe'} 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.searchResultText}>{store.name}</Text>
                  <Icon name="chevron-right" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>팔로우</Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              shopName={review.shopName}
              reviewText={review.reviewText}
              date={review.date}
            />
          ))}
        </ScrollView>
      </View>

             {/* Floating Action Button */}
       <TouchableOpacity 
         style={styles.fab}
         onPress={() => navigation.navigate('CustomerPost')}
       >
         <Icon name="edit" size={24} color="#FFF" />
       </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3C35B',
  },
      header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#F3C35B',
    },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoStar: {
    fontSize: 20,
    color: '#FFF',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 80,
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  reviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 15,
    backgroundColor: '#FBA542',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTab: {
    color: '#000',
    fontWeight: '600',
  },
 });