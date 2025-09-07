import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface FoodItem {
  id: number;
  name: string;
  image?: any; // 로컬 이미지 (선택적)
  imageUrl?: string; // 실제 이미지 URL (선택적)
  postId?: number; // 게시글 ID 추가
}

interface FoodGridProps {
  foodItems: FoodItem[];
  onItemPress?: (item: FoodItem) => void;
}

const FoodGrid: React.FC<FoodGridProps> = ({ foodItems, onItemPress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleItemPress = (item: FoodItem) => {
    // onItemPress가 있으면 먼저 호출
    if (onItemPress) {
      onItemPress(item);
    }
    
    // postId가 있으면 PostDetail로 이동
    if (item.postId) {
      navigation.navigate('PostDetail', {
        post: {
          postId: item.postId,
          content: `${item.name} 관련 게시글`,
          storeId: 0,
          storeName: '음식 카테고리',
          userId: 0,
          userNickname: '시스템',
          uploderRole: 'CUSTOMER' as const,
          images: [],
          hashtags: [`#${item.name}`],
          likeCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          liked: false
        },
        type: 'post'
      });
    }
  };

  return (
    <View style={styles.gridContainer}>
      {foodItems.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.gridItem}
          onPress={() => handleItemPress(item)}
        >
          <Image 
            source={item.imageUrl ? { uri: item.imageUrl } : item.image} 
            style={styles.foodImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 3,
    gap: 3,
  },
  gridItem: {
    width: '32%',
    marginBottom: 3,
    alignItems: 'center',
  },
  foodImage: {
    width: 123,
    height: 179,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
});

export default FoodGrid;
