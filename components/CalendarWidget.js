// components/CalendarWidget.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CalendarWidget = ({ navigation, tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);

  // Simple theme and font sizes (temporarily without context)
  const theme = {
    primary: '#2e7d32',
    background: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    card: '#ffffff',
    surface: '#f5f5f5',
    border: '#e0e0e0',
  };

  const fontSizes = {
    small: 12,
    medium: 16,
    large: 18,
    title: 20
  };

  useEffect(() => {
    generateCalendarData();
  }, [generateCalendarData]);

  const generateCalendarData = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const today = new Date();
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        
        // Check if there are tasks for this date
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => 
          task.data && task.data.startsWith(dateStr)
        );
        
        weekDays.push({
          date,
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          hasTasks: dayTasks.length > 0,
          tasksCount: dayTasks.length
        });
      }
      calendar.push(weekDays);
    }
    
    setCalendarData(calendar);
  }, [currentDate, tasks]);

  const onDatePress = (dateData) => {
    setSelectedDate(dateData.date);
    const dateStr = dateData.date.toISOString().split('T')[0];
    navigation?.navigate('CalendarioAgendamentos', { 
      selectedDate: dateStr,
      initialDate: dateStr 
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <LinearGradient 
      colors={['#ffffff', '#f8f9fa']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
          style={styles.navButton}
        >
          <Feather name="chevron-left" size={20} color="#2e7d32" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation?.navigate('CalendarioAgendamentos')}
          style={styles.monthTitle}
        >
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={goToNextMonth}
          style={styles.navButton}
        >
          <Feather name="chevron-right" size={20} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Day Labels */}
      <View style={styles.dayLabels}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {calendarData.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((dateData, dayIndex) => {
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    !dateData.isCurrentMonth && styles.otherMonth,
                    dateData.isToday && styles.today,
                    dateData.isSelected && styles.selected,
                  ]}
                  onPress={() => onDatePress(dateData)}
                >
                  <Text style={[
                    styles.dayText,
                    !dateData.isCurrentMonth && styles.otherMonthText,
                    dateData.isToday && styles.todayText,
                    dateData.isSelected && styles.selectedText,
                  ]}>
                    {dateData.day}
                  </Text>
                  {dateData.hasTasks && (
                    <View style={styles.taskIndicator}>
                      <Text style={styles.taskCount}>{dateData.tasksCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Footer */}
      <TouchableOpacity 
        style={styles.footer}
        onPress={() => navigation?.navigate('CalendarioAgendamentos')}
      >
        <Text style={styles.footerText}>Ver calendário completo</Text>
        <Feather name="external-link" size={16} color="#2e7d32" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
    letterSpacing: 0.5,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  calendar: {
    marginBottom: 20,
  },
  week: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  otherMonth: {
    opacity: 0.4,
    backgroundColor: '#f8f9fa',
  },
  otherMonthText: {
    color: '#adb5bd',
  },
  today: {
    backgroundColor: '#2e7d32',
    borderColor: '#1b5e20',
    elevation: 2,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
  selected: {
    backgroundColor: '#4caf50',
    borderColor: '#2e7d32',
    transform: [{ scale: 1.05 }],
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff5722',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  taskCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 4,
  },
  footerText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.3,
  },
});

export default CalendarWidget;
