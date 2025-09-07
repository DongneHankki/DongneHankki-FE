import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeeklyStats } from '../services/AnalyticsAPI';

interface HeatmapChartProps {
  data: WeeklyStats[];
  dataType: 'viewStoreCount' | 'viewPostCount';
  title: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, dataType, title }) => {
  // 요일 순서 정의
  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 데이터를 요일 순서대로 정렬
  const sortedData = dayOrder.map(day => 
    data.find(item => item.dayOfWeek === day)
  ).filter(Boolean) as WeeklyStats[];

  // 최대값 계산 (색상 강도 결정용)
  const maxValue = Math.max(
    ...sortedData.flatMap(day => 
      day.hourlyStats.map(hour => hour[dataType])
    )
  );

  // 색상 계산 함수
  const getColorIntensity = (value: number) => {
    if (maxValue === 0) return 0;
    return Math.min(value / maxValue, 1);
  };

  // 색상 생성 함수
  const getColor = (intensity: number) => {
    if (intensity === 0) return '#f0f0f0';
    
    // 연한 주황색에서 진한 주황색으로 (FBA542 계열)
    const r = Math.floor(255 - (255 - 251) * intensity);
    const g = Math.floor(248 - (248 - 165) * intensity);
    const b = Math.floor(240 - (240 - 66) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {/* 히트맵 그리드 */}
        <View style={styles.grid}>
          {sortedData.map((day, dayIndex) => (
            <View key={day.dayOfWeek} style={styles.dayRow}>
              {/* 요일 라벨 */}
              <Text style={styles.dayLabel}>{dayLabels[dayIndex]}</Text>
              
              {/* 시간별 셀 */}
              {day.hourlyStats.map((hour, hourIndex) => {
                const value = hour[dataType];
                const intensity = getColorIntensity(value);
                const color = getColor(intensity);
                
                return (
                  <View
                    key={hourIndex}
                    style={[
                      styles.cell,
                      { backgroundColor: color }
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
      
      {/* 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>낮음</Text>
        <View style={styles.legendColors}>
          {Array.from({ length: 5 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.legendColor,
                { backgroundColor: getColor(i / 4) }
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>높음</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayLabel: {
    fontSize: 12,
    color: '#333',
    width: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'column',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cell: {
    width: 12,
    height: 12,
    marginRight: 1,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
  },
  legendColors: {
    flexDirection: 'row',
    gap: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

export default HeatmapChart;
