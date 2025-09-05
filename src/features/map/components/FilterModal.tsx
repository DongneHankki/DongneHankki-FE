import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from '../../../shared/styles/globalStyles';
import { DAY_OPTIONS } from '../constants/constants';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }) => void;
}

type FilterTab = 'rating' | 'day' | 'time';

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('rating');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('08:00:00');
  const [endTime, setEndTime] = useState<string>('20:00:00');
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [startTimeDate, setStartTimeDate] = useState<Date>(new Date(2024, 0, 1, 8, 0));
  const [endTimeDate, setEndTimeDate] = useState<Date>(new Date(2024, 0, 1, 20, 0));

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartTimeDate(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const seconds = selectedDate.getSeconds().toString().padStart(2, '0');
      setStartTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndTimeDate(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const seconds = selectedDate.getSeconds().toString().padStart(2, '0');
      setEndTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  const handleStartTimeConfirm = () => {
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = () => {
    setShowEndTimePicker(false);
  };

  const handleStartTimeCancel = () => {
    setShowStartTimePicker(false);
    // 원래 시간으로 되돌리기
    const originalDate = new Date(2024, 0, 1, 8, 0);
    setStartTimeDate(originalDate);
    setStartTime('08:00:00');
  };

  const handleEndTimeCancel = () => {
    setShowEndTimePicker(false);
    // 원래 시간으로 되돌리기
    const originalDate = new Date(2024, 0, 1, 20, 0);
    setEndTimeDate(originalDate);
    setEndTime('20:00:00');
  };

  const showStartTimePickerModal = () => {
    setShowStartTimePicker(true);
  };

  const showEndTimePickerModal = () => {
    setShowEndTimePicker(true);
  };

  const handleApply = () => {
    const filters: {
      scope?: number;
      days?: string;
      startAt?: string;
      endAt?: string;
    } = {};

    // 평점 필터 (scope)
    if (selectedRating > 0) {
      filters.scope = selectedRating;
    }

    // 요일 필터 (days)
    if (selectedDay.length > 0) {
      filters.days = selectedDay.join(',');
    }

    // 시간 필터 (startAt, endAt)
    if (startTime && endTime) {
      filters.startAt = startTime;
      filters.endAt = endTime;
    }

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    if (activeTab === 'rating') {
      setSelectedRating(0);
    } else if (activeTab === 'day') {
      setSelectedDay([]);
    } else if (activeTab === 'time') {
      setStartTime('08:00:00');
      setEndTime('20:00:00');
      setStartTimeDate(new Date(2024, 0, 1, 8, 0));
      setEndTimeDate(new Date(2024, 0, 1, 20, 0));
    }
  };

  const getResetButtonText = () => {
    switch (activeTab) {
      case 'rating':
        return '평점 재설정';
      case 'day':
        return '요일 재설정';
      case 'time':
        return '시간 재설정';
      default:
        return '재설정';
    }
  };

  const renderRatingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.instruction}>원하는 평점을 설정해보세요</Text>
      <Text style={styles.description}>선택한 평점 이상의 매장만 확인할 수 있어요</Text>
      
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingSelect(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= selectedRating ? "star" : "star-outline"}
              size={40}
              color={star <= selectedRating ? "#FFD700" : "#E0E0E0"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDayTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.instruction}>원하는 운영 요일을 설정해보세요</Text>
      <Text style={styles.description}>선택한 요일의 매장만 확인할 수 있어요</Text>
      
      <View style={styles.dayOptions}>
        {DAY_OPTIONS.map((day) => (
          <TouchableOpacity
            key={day.value}
            onPress={() => handleDaySelect(day.value)}
            style={[
              styles.dayOption,
              selectedDay.includes(day.value) && styles.dayOptionSelected
            ]}
          >
            <Text style={[
              styles.dayOptionText,
              selectedDay.includes(day.value) && styles.dayOptionTextSelected
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.instruction}>원하는 운영시간을 설정해보세요</Text>
      <Text style={styles.description}>설정된 시간대에 운영하는 매장만 확인할 수 있어요</Text>
      
      <View style={styles.timeInputContainer}>
        <View style={styles.timeInputRow}>
          <Text style={styles.timeInputLabel}>시작 시간</Text>
          <TouchableOpacity style={styles.timePickerButton} onPress={showStartTimePickerModal}>
            <Text style={styles.timePickerText}>{startTime}</Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeInputDivider} />
        
        <View style={styles.timeInputRow}>
          <Text style={styles.timeInputLabel}>마감 시간</Text>
          <TouchableOpacity style={styles.timePickerButton} onPress={showEndTimePickerModal}>
            <Text style={styles.timePickerText}>{endTime}</Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          activeTab === 'time' && styles.timeModalContainer
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'rating' && styles.tabButtonActive]}
                onPress={() => setActiveTab('rating')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'rating' && styles.tabButtonTextActive]}>
                  평점
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'day' && styles.tabButtonActive]}
                onPress={() => setActiveTab('day')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'day' && styles.tabButtonTextActive]}>
                  요일
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'time' && styles.tabButtonActive]}
                onPress={() => setActiveTab('time')}
              >
                <Text style={[styles.tabButtonText, activeTab === 'time' && styles.tabButtonTextActive]}>
                  시간
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {activeTab === 'rating' && renderRatingTab()}
            {activeTab === 'day' && renderDayTab()}
            {activeTab === 'time' && renderTimeTab()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Icon name="refresh" size={16} color="#666" />
              <Text style={styles.resetButtonText}>{getResetButtonText()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>매장보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>시작 시간 선택</Text>
            <DateTimePicker
              value={startTimeDate}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={handleStartTimeChange}
              style={styles.timePicker}
            />
            <View style={styles.timePickerButtons}>
              <TouchableOpacity onPress={handleStartTimeCancel} style={styles.timePickerCancelButton}>
                <Text style={styles.timePickerCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleStartTimeConfirm} style={styles.timePickerConfirmButton}>
                <Text style={styles.timePickerConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {showEndTimePicker && (
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>마감 시간 선택</Text>
            <DateTimePicker
              value={endTimeDate}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={handleEndTimeChange}
              style={styles.timePicker}
            />
            <View style={styles.timePickerButtons}>
              <TouchableOpacity onPress={handleEndTimeCancel} style={styles.timePickerCancelButton}>
                <Text style={styles.timePickerCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEndTimeConfirm} style={styles.timePickerConfirmButton}>
                <Text style={styles.timePickerConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
    maxHeight: '90%',
  },
  timeModalContainer: {
    maxHeight: '95%',
    minHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    minWidth: 60,
  },
  tabButtonActive: {
    backgroundColor: '#D7D7D7',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabButtonTextActive: {
    color: 'black',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  instruction: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  selectedText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  dayOption: {
    borderRadius: 20,
    borderWidth: 1,
    width: 40,
    height: 40,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOptionSelected: {
    backgroundColor: '#D7D7D7',
    borderColor: '#D7D7D7',
  },
  dayOptionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  dayOptionTextSelected: {
    color: '#333',
    fontWeight: 'bold',
  },
  timeOptions: {
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  timeOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeInputContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeInputLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeInputDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  timePicker: {
    width: 200,
    height: 200,
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timePickerCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    minWidth: 80,
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  timePickerConfirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 80,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  resetButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  applyButton: {
    width: 220,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F3C35B',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#2E1404',
    fontWeight: 'bold',
  },
});

export default FilterModal; 