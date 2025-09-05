import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAuthStore } from '../../../shared/store/authStore';
import FoodGrid from '../components/FoodGrid';

const RecommendScreen: React.FC = () => {
  const { getLoginId } = useAuthStore();
  const loginId = getLoginId() || '사용자';

  const foodItems = [
    { id: 1, name: '국수', image: require('../../../shared/images/food.png') },
    { id: 2, name: '라면', image: require('../../../shared/images/food.png') },
    { id: 3, name: '김치찌개', image: require('../../../shared/images/food.png') },
    { id: 4, name: '비빔밥', image: require('../../../shared/images/food.png') },
    { id: 5, name: '냉면', image: require('../../../shared/images/food.png') },
    { id: 6, name: '된장찌개', image: require('../../../shared/images/food.png') },
    { id: 7, name: '순두부찌개', image: require('../../../shared/images/food.png') },
    { id: 8, name: '반찬', image: require('../../../shared/images/food.png') },
    { id: 9, name: '삼겹살', image: require('../../../shared/images/food.png') },
    { id: 10, name: '갈비찜', image: require('../../../shared/images/food.png') },
    { id: 11, name: '닭볶음탕', image: require('../../../shared/images/food.png') },
    { id: 12, name: '불고기', image: require('../../../shared/images/food.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={styles.title}>오늘의 추천</Text>
          <Text style={styles.subtitle}>✨{loginId}님 이런 매장은 어때요?</Text>
          <View style={styles.divider} />
        </View>

        {/* 음식 그리드 */}
        <FoodGrid 
          foodItems={foodItems}
          onItemPress={(item) => {
            console.log('선택된 음식:', item.name);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  divider: {
    height: 2,
    backgroundColor: '#FF6B35',
    width: '100%',
  },

  placeholderContainer: {
    padding: 20,
    paddingTop: 0,
  },
  placeholder: {
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecommendScreen;
