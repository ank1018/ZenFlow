import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';

// Custom DateTimePicker component
const CustomDateTimePicker: React.FC<{
  value: Date;
  mode: 'date' | 'time';
  onChange: (event: any, selectedValue?: Date) => void;
  display?: string;
}> = ({ value, mode, onChange, display }) => {
  const [tempValue, setTempValue] = useState(value);
  const [currentMonth, setCurrentMonth] = useState(value.getMonth());
  const [currentYear, setCurrentYear] = useState(value.getFullYear());

  const handleConfirm = () => {
    onChange({ type: 'set' }, tempValue);
  };

  const handleCancel = () => {
    onChange({ type: 'dismissed' });
  };

  const updateTime = (hours: number, minutes: number) => {
    const newTime = new Date(tempValue);
    newTime.setHours(hours, minutes, 0, 0);
    setTempValue(newTime);
  };

  const updateDate = (day: number) => {
    const newDate = new Date(tempValue);
    newDate.setFullYear(currentYear, currentMonth, day);
    setTempValue(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  if (mode === 'time') {
    const hours = tempValue.getHours();
    const minutes = tempValue.getMinutes();

    return (
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 20,
            textAlign: 'center',
            color: '#1f2937',
          }}
        >
          Select Time
        </Text>

        {/* Current selected time display */}
        <View
          style={{
            backgroundColor: '#f3f4f6',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: '#6366f1',
              fontFamily: 'monospace',
            }}
          >
            {hours.toString().padStart(2, '0')}:
            {minutes.toString().padStart(2, '0')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 4,
            }}
          >
            {hours >= 12 ? 'PM' : 'AM'}
          </Text>
        </View>

        {/* Time picker */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: '#374151',
              }}
            >
              Hour
            </Text>
            <ScrollView style={{ height: 150, width: 80 }}>
              {Array.from({ length: 24 }).map((_, h) => (
                <TouchableOpacity
                  key={h}
                  style={{
                    padding: 12,
                    backgroundColor: hours === h ? '#6366f1' : '#f9fafb',
                    borderRadius: 8,
                    marginVertical: 2,
                    borderWidth: 1,
                    borderColor: hours === h ? '#6366f1' : '#e5e7eb',
                  }}
                  onPress={() => updateTime(h, minutes)}
                >
                  <Text
                    style={{
                      color: hours === h ? 'white' : '#374151',
                      textAlign: 'center',
                      fontWeight: hours === h ? '600' : '500',
                    }}
                  >
                    {h.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: '#374151',
              }}
            >
              Minute
            </Text>
            <ScrollView style={{ height: 150, width: 80 }}>
              {Array.from({ length: 60 }).map((_, m) => (
                <TouchableOpacity
                  key={m}
                  style={{
                    padding: 12,
                    backgroundColor: minutes === m ? '#6366f1' : '#f9fafb',
                    borderRadius: 8,
                    marginVertical: 2,
                    borderWidth: 1,
                    borderColor: minutes === m ? '#6366f1' : '#e5e7eb',
                  }}
                  onPress={() => updateTime(hours, m)}
                >
                  <Text
                    style={{
                      color: minutes === m ? 'white' : '#374151',
                      textAlign: 'center',
                      fontWeight: minutes === m ? '600' : '500',
                    }}
                  >
                    {m.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: '#6b7280',
              borderRadius: 8,
              minWidth: 80,
            }}
            onPress={handleCancel}
          >
            <Text
              style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: '#6366f1',
              borderRadius: 8,
              minWidth: 80,
            }}
            onPress={handleConfirm}
          >
            <Text
              style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Date picker with calendar view
  const calendarDays = getCalendarDays();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <View style={{ padding: 20 }}>
      {/* <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 20,
          textAlign: 'center',
          color: '#1f2937',
        }}
      >
        Select Date - 2
      </Text> */}

      {/* Current selected date display */}
      <View
        style={{
          backgroundColor: '#f3f4f6',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#6366f1',
          }}
        >
          {tempValue.getDate()}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#6b7280',
            marginTop: 4,
          }}
        >
          {monthNames[tempValue.getMonth()]} {tempValue.getFullYear()}
        </Text>
      </View>

      {/* Month/Year navigation */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
          }}
          onPress={() => changeMonth(-1)}
        >
          <Icon name="chevron-left" size={20} color="#374151" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#374151',
          }}
        >
          {monthNames[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
          }}
          onPress={() => changeMonth(1)}
        >
          <Icon name="chevron-right" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Calendar grid */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        {/* Day headers */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 8,
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View
              key={day}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#6b7280',
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 2,
              }}
              onPress={() => day && updateDate(day)}
              disabled={!day}
            >
              {day && (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      tempValue.getDate() === day &&
                      tempValue.getMonth() === currentMonth &&
                      tempValue.getFullYear() === currentYear
                        ? '#6366f1'
                        : 'transparent',
                    borderWidth: 1,
                    borderColor:
                      tempValue.getDate() === day &&
                      tempValue.getMonth() === currentMonth &&
                      tempValue.getFullYear() === currentYear
                        ? '#6366f1'
                        : '#e5e7eb',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color:
                        tempValue.getDate() === day &&
                        tempValue.getMonth() === currentMonth &&
                        tempValue.getFullYear() === currentYear
                          ? 'white'
                          : '#374151',
                    }}
                  >
                    {day}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#6b7280',
            borderRadius: 8,
            minWidth: 80,
          }}
          onPress={handleCancel}
        >
          <Text
            style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#6366f1',
            borderRadius: 8,
            minWidth: 80,
          }}
          onPress={handleConfirm}
        >
          <Text
            style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}
          >
            OK
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTodos } from '../../contexts/TodoContext';
import { Todo } from '../../types';
import { formatTimeOfDay } from '../../utils/helpers';
import CalendarSyncButton from '../../components/CalendarSyncButton';
import GoogleCalendarService from '../../services/GoogleCalendarService';
import { styles } from './TodoScreen.style';
import {
  getGreeting,
  getPriorityIcon,
  getFilterIcon,
  getTaskTimeInfo,
  isSameDay,
  humanDate,
  withTime,
  startOf,
  endOf,
  todosForDate,
  sortTodos,
  sortTodosByNextTask,
} from './helper-functions';
import TimelineView from './TimelineView';
import { ListView } from './ListView';

const TodoScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const {
    todos,
    loading,
    error,
    updateTodo,
    deleteTodo,
    addTodo,
    refresh,
    syncWithGoogleCalendar,
  } = useTodos() as any;

  // Debug logging for todos state changes (only when count changes significantly)
  useEffect(() => {}, [todos.length]); // Only log when count changes, not every render

  const [filter, setFilter] = useState<'all' | 'today' | 'high'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [isViewModeChanging, setIsViewModeChanging] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Day / calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date/Time picker states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>(
    'start',
  );

  // Current time indicator
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(i);
  }, []);

  // Auto-sync calendar events on component mount (only once)
  useEffect(() => {
    let hasAutoSynced = false;

    const autoSyncCalendar = async () => {
      if (hasAutoSynced) {
        return;
      }

      try {
        const isSignedIn = await GoogleCalendarService.isSignedIn();
        if (isSignedIn) {
          const calendarTodos =
            await GoogleCalendarService.syncGoogleCalendarToTodos();

          if (calendarTodos.length > 0) {
            const syncedCount = await syncWithGoogleCalendar(calendarTodos);

            hasAutoSynced = true;
          } else {
            hasAutoSynced = true;
          }
        } else {
          hasAutoSynced = true;
        }
      } catch (error) {
        console.warn('Auto-sync failed:', error);
        hasAutoSynced = true;
      }
    };

    // Delay auto-sync to ensure authentication state is fully established
    const timer = setTimeout(autoSyncCalendar, 3000);
    return () => clearTimeout(timer);
  }, []); // Remove dependencies to prevent multiple runs

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Add / Edit modal
  const emptyForm = {
    id: undefined as string | undefined,
    title: '',
    priority: 'medium' as Todo['priority'],
    date: new Date(),
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60 * 1000),
  };
  const [form, setForm] = useState(emptyForm);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    setForm(f => ({
      ...f,
      date: selectedDate,
      start: withTime(selectedDate, f.start),
      end: withTime(selectedDate, f.end),
    }));
  }, [selectedDate]);

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t: Todo) => t.id === id);
    if (todo) {
      await updateTodo(id, {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : undefined,
      });
    }
  };

  const handleViewModeChange = (newViewMode: 'timeline' | 'list') => {
    if (newViewMode !== viewMode) {
      setIsViewModeChanging(true);
      setViewMode(newViewMode);
      // Clear loading state after a short delay to allow for smooth transition
      setTimeout(() => setIsViewModeChanging(false), 300);
    }
  };

  // Memoized filtered and sorted todos for better performance
  const filteredTodos = useMemo(() => {
    const startTime = performance.now();

    let filtered;
    switch (filter) {
      case 'today':
        filtered = todosForDate(todos, new Date());
        break;
      case 'high':
        filtered = todos.filter((todo: Todo) => todo.priority === 'high');
        break;
      default:
        filtered = todos;
    }

    // Sort the filtered todos based on view mode
    let result;
    if (viewMode === 'list') {
      // For list view, show next task closest to current time
      result = sortTodosByNextTask(filtered);
    } else {
      // For timeline view, use chronological sorting
      result = sortTodos(filtered);
    }

    const endTime = performance.now();

    return result;
  }, [todos, filter, viewMode]);

  const todosForSelectedDay = useMemo(() => {
    const filtered = todosForDate(todos, selectedDate);
    return sortTodos(filtered);
  }, [todos, selectedDate]);
  // Memoized completion stats
  const { completedCount, totalCount, completionPercentage } = useMemo(() => {
    const completed = todos.filter((t: Todo) => t.completed).length;
    const total = todos.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return {
      completedCount: completed,
      totalCount: total,
      completionPercentage: percentage,
    };
  }, [todos]);

  // Loading state with improved animation
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
              Loading your tasks...
            </Text>
            <Text
              style={[styles.loadingSubtext, isDarkMode && styles.darkSubtext]}
            >
              Syncing with your calendar
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry functionality
  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Icon name="cloud-off-outline" size={64} color="#ef4444" />
            <Text style={[styles.errorTitle, isDarkMode && styles.darkText]}>
              Something went wrong
            </Text>
            <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refresh()}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, isDarkMode && styles.darkText]}>
                {getGreeting()}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[
                  styles.todayButton,
                  isDarkMode && styles.darkTodayButton,
                  isSameDay(selectedDate, new Date()) &&
                    styles.activeTodayButton,
                  isSameDay(selectedDate, new Date()) &&
                    isDarkMode &&
                    styles.darkActiveTodayButton,
                ]}
                onPress={() => setSelectedDate(new Date())}
              >
                <Icon
                  name="calendar-today"
                  size={14}
                  color={
                    isSameDay(selectedDate, new Date()) ? '#ffffff' : '#6366f1'
                  }
                />
                <Text
                  style={[
                    styles.todayButtonText,
                    isSameDay(selectedDate, new Date()) &&
                      styles.activeTodayButtonText,
                  ]}
                >
                  Today
                </Text>
              </TouchableOpacity>
              <CalendarSyncButton />
              {/* <TouchableOpacity
                style={[
                  styles.notificationButton,
                  isDarkMode && styles.darkNotificationButton,
                ]}
                onPress={() => {
                  // Notification settings removed
                }}
              >
                <Icon name="bell-outline" size={20} color="#6366f1" />
              </TouchableOpacity> */}
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, isDarkMode && styles.darkText]}>
              {completedCount} of {totalCount} tasks completed
            </Text>
            <Text
              style={[styles.progressPercentage, isDarkMode && styles.darkText]}
            >
              {Math.round(completionPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>
        </View> */}

        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => shiftDay(-1)}
              style={styles.navBtn}
            >
              <Icon
                name="chevron-left"
                size={20}
                color={isDarkMode ? '#e5e7eb' : '#374151'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePill, isDarkMode && styles.darkDatePill]}
            >
              <Icon name="calendar" size={16} color="#6366f1" />
              <Text
                style={[styles.datePillText, isDarkMode && styles.darkText]}
              >
                {humanDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => shiftDay(1)} style={styles.navBtn}>
              <Icon
                name="chevron-right"
                size={20}
                color={isDarkMode ? '#e5e7eb' : '#374151'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.viewToggle,
                viewMode === 'timeline' && styles.activeViewToggle,
              ]}
              onPress={() => handleViewModeChange('timeline')}
            >
              <Icon
                name="timeline-clock"
                size={18}
                color={viewMode === 'timeline' ? '#6366f1' : '#6b7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggle,
                viewMode === 'list' && styles.activeViewToggle,
              ]}
              onPress={() => handleViewModeChange('list')}
            >
              <Icon
                name="format-list-bulleted"
                size={18}
                color={viewMode === 'list' ? '#6366f1' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Sync Integration */}
        {/* CalendarSyncButton is now in the header */}

        {/* Content based on view mode */}
        {viewMode === 'timeline' ? (
          <TimelineView
            todosForSelectedDay={todosForSelectedDay}
            selectedDate={selectedDate}
            now={now}
            onTaskPress={openEdit}
            onTimelineClick={handleTimelineClick}
            isDarkMode={isDarkMode}
          />
        ) : (
          <>
            {isViewModeChanging && (
              <View style={styles.viewModeLoadingContainer}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text
                  style={[
                    styles.viewModeLoadingText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  Loading list view...
                </Text>
              </View>
            )}
            <ListView
              filteredTodos={filteredTodos}
              filter={filter}
              setFilter={setFilter}
              onTaskPress={toggleTodo}
              onTaskLongPress={openEdit}
              isDarkMode={isDarkMode}
            />
          </>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, isDarkMode && styles.darkFab]}
          onPress={() => openEdit()}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Modals remain the same but with enhanced styling */}
      {renderModals()}
    </SafeAreaView>
  );

  // Helper functions
  function shiftDay(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  }

  function openEdit(todo?: Todo, specificTime?: Date) {
    if (todo) {
      const s = startOf(todo) || withTime(selectedDate, new Date());
      const e = endOf(todo) || new Date(s.getTime() + 30 * 60 * 1000);
      setForm({
        id: todo.id,
        title: todo.title,
        priority: todo.priority,
        date: selectedDate,
        start: s,
        end: e,
      });
    } else {
      const startTime = specificTime || withTime(selectedDate, new Date());
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      setForm({
        ...emptyForm,
        date: selectedDate,
        start: startTime,
        end: endTime,
      });
    }
    setShowEdit(true);
  }

  function handleTimelineClick(time: Date) {
    openEdit(undefined, time);
  }

  function renderModals() {
    return (
      <>
        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            transparent
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[styles.modalCard, isDarkMode && styles.darkModalCard]}
              >
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  Select Date - t
                </Text>
                <Text
                  style={[styles.modalRowText, isDarkMode && styles.darkText]}
                >
                  {humanDate(selectedDate)}
                </Text>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.saveText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Task Date Picker */}
        {showTaskDatePicker && (
          <Modal
            transparent
            animationType="fade"
            visible={showTaskDatePicker}
            onRequestClose={() => setShowTaskDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[styles.modalCard, isDarkMode && styles.darkModalCard]}
              >
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  Select Task Date
                </Text>
                <CustomDateTimePicker
                  value={form.date}
                  mode="date"
                  onChange={(event, selectedDate) => {
                    if (event.type === 'set' && selectedDate) {
                      setForm({
                        ...form,
                        date: selectedDate,
                        start: withTime(selectedDate, form.start),
                        end: withTime(selectedDate, form.end),
                      });
                    }
                    setShowTaskDatePicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Start Time Picker */}
        {showStartTimePicker && (
          <Modal
            transparent
            animationType="fade"
            visible={showStartTimePicker}
            onRequestClose={() => setShowStartTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[styles.modalCard, isDarkMode && styles.darkModalCard]}
              >
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  Select Start Time
                </Text>
                <CustomDateTimePicker
                  value={form.start}
                  mode="time"
                  onChange={(event, selectedTime) => {
                    if (event.type === 'set' && selectedTime) {
                      const newStart = withTime(form.date, selectedTime);
                      const newEnd = new Date(
                        newStart.getTime() + 30 * 60 * 1000,
                      );
                      setForm({
                        ...form,
                        start: newStart,
                        end: newEnd,
                      });
                    }
                    setShowStartTimePicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* End Time Picker */}
        {showEndTimePicker && (
          <Modal
            transparent
            animationType="fade"
            visible={showEndTimePicker}
            onRequestClose={() => setShowEndTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[styles.modalCard, isDarkMode && styles.darkModalCard]}
              >
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  Select End Time
                </Text>
                <CustomDateTimePicker
                  value={form.end}
                  mode="time"
                  onChange={(event, selectedTime) => {
                    if (event.type === 'set' && selectedTime) {
                      const newEnd = withTime(form.date, selectedTime);
                      setForm({
                        ...form,
                        end: newEnd,
                      });
                    }
                    setShowEndTimePicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Add/Edit Modal - Enhanced */}
        <Modal
          transparent
          animationType="slide"
          visible={showEdit}
          onRequestClose={() => setShowEdit(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                styles.editModalCard,
                isDarkMode && styles.darkModalCard,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, isDarkMode && styles.darkText]}
                >
                  {form.id ? 'Edit Task' : 'Create New Task'}
                </Text>
                <TouchableOpacity onPress={() => setShowEdit(false)}>
                  <Icon
                    name="close"
                    size={24}
                    color={isDarkMode ? '#e5e7eb' : '#374151'}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text
                      style={[styles.inputLabel, isDarkMode && styles.darkText]}
                    >
                      Task Title
                    </Text>
                    <TextInput
                      placeholder="Enter task title..."
                      placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                      value={form.title}
                      onChangeText={t => setForm({ ...form, title: t })}
                      style={[styles.input, isDarkMode && styles.darkInput]}
                      autoFocus
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text
                      style={[styles.inputLabel, isDarkMode && styles.darkText]}
                    >
                      Priority Level
                    </Text>
                    <View style={styles.priorityContainer}>
                      {(['low', 'medium', 'high'] as const).map(p => (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setForm({ ...form, priority: p })}
                          style={[
                            styles.priorityPill,
                            form.priority === p && styles.activePriorityPill,
                            isDarkMode && styles.darkPriorityPill,
                            form.priority === p &&
                              isDarkMode &&
                              styles.darkActivePriorityPill,
                          ]}
                        >
                          <Icon
                            name={getPriorityIcon(p)}
                            size={16}
                            color={
                              form.priority === p
                                ? '#fff'
                                : isDarkMode
                                ? '#e5e7eb'
                                : '#6b7280'
                            }
                          />
                          <Text
                            style={[
                              styles.priorityPillText,
                              form.priority === p &&
                                styles.activePriorityPillText,
                              isDarkMode && styles.darkText,
                              form.priority === p && { color: '#fff' },
                            ]}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text
                      style={[styles.inputLabel, isDarkMode && styles.darkText]}
                    >
                      Date
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.timeDisplay,
                        isDarkMode && styles.darkTimeDisplay,
                      ]}
                      onPress={() => setShowTaskDatePicker(true)}
                    >
                      <Icon name="calendar" size={16} color="#6366f1" />
                      <Text
                        style={[styles.timeText, isDarkMode && styles.darkText]}
                      >
                        {humanDate(form.date)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeSection}>
                    <Text
                      style={[styles.inputLabel, isDarkMode && styles.darkText]}
                    >
                      Time Schedule
                    </Text>
                    <View style={styles.timeRow}>
                      <View style={styles.timeInput}>
                        <Text
                          style={[
                            styles.timeLabel,
                            isDarkMode && styles.darkText,
                          ]}
                        >
                          Start
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.timeDisplay,
                            isDarkMode && styles.darkTimeDisplay,
                          ]}
                          onPress={() => {
                            setTimePickerMode('start');
                            setShowStartTimePicker(true);
                          }}
                        >
                          <Icon
                            name="clock-outline"
                            size={16}
                            color="#6366f1"
                          />
                          <Text
                            style={[
                              styles.timeText,
                              isDarkMode && styles.darkText,
                            ]}
                          >
                            {formatTimeOfDay(form.start)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.timeInput}>
                        <Text
                          style={[
                            styles.timeLabel,
                            isDarkMode && styles.darkText,
                          ]}
                        >
                          End
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.timeDisplay,
                            isDarkMode && styles.darkTimeDisplay,
                          ]}
                          onPress={() => {
                            setTimePickerMode('end');
                            setShowEndTimePicker(true);
                          }}
                        >
                          <Icon
                            name="clock-outline"
                            size={16}
                            color="#6366f1"
                          />
                          <Text
                            style={[
                              styles.timeText,
                              isDarkMode && styles.darkText,
                            ]}
                          >
                            {formatTimeOfDay(form.end)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                {form.id && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={async () => {
                      await deleteTodo(form.id as string);
                      setShowEdit(false);
                    }}
                  >
                    <Icon name="trash-can-outline" size={18} color="#ef4444" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={async () => {
                    const start = withTime(selectedDate, form.start);
                    const end = withTime(selectedDate, form.end);
                    if (!form.title.trim()) {
                      Alert.alert(
                        'Title Required',
                        'Please enter a task title.',
                      );
                      return;
                    }
                    if (end <= start) {
                      Alert.alert(
                        'Invalid Time',
                        'End time must be after start time.',
                      );
                      return;
                    }

                    const payload: Partial<Todo & any> = {
                      title: form.title.trim(),
                      priority: form.priority,
                      startAt: start,
                      endAt: end,
                      dueDate: end,
                      completed: false,
                    };

                    if (form.id) {
                      await updateTodo(form.id, payload);
                    } else if (addTodo) {
                      await addTodo(payload);
                    }
                    setShowEdit(false);
                  }}
                >
                  <Icon name="check" size={18} color="#fff" />
                  <Text style={styles.saveText}>
                    {form.id ? 'Update Task' : 'Create Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }
};

export default TodoScreen;
