import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface FoodItem {
  id: number;
  name: string;
  image: any;
}

interface FoodGridProps {
  foodItems: FoodItem[];
  onItemPress?: (item: FoodItem) => void;
}

const FoodGrid: React.FC<FoodGridProps> = ({ foodItems, onItemPress }) => {
  return (
    <View style={styles.gridContainer}>
      {foodItems.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.gridItem}
          onPress={() => onItemPress?.(item)}
        >
          <Image 
            source={item.image} 
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
