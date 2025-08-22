// List View Component
import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Todo } from '../../types';
import { getPriorityColor, formatDate } from '../../utils/helpers';
import { styles } from './TodoScreen.style';
import { getFilterIcon, getTaskTimeInfo } from './helper-functions';

export const ListView: React.FC<{
  filteredTodos: Todo[];
  filter: string;
  setFilter: (filter: 'all' | 'today' | 'high') => void;
  onTaskPress: (id: string) => void;
  onTaskLongPress: (todo: Todo) => void;
  isDarkMode: boolean;
}> = React.memo(
  ({
    filteredTodos,
    filter,
    setFilter,
    onTaskPress,
    onTaskLongPress,
    isDarkMode,
  }) => {
    // Find the next upcoming task - memoized to prevent recalculation
    const nextTask = useMemo(() => {
      const now = new Date();
      return filteredTodos.find(todo => {
        const startTime = todo.startAt ? new Date(todo.startAt) : null;
        return startTime && startTime > now && !todo.completed;
      });
    }, [filteredTodos]);

    // Debug logging
    useEffect(() => {
      if (nextTask) {
        console.log('📅 Next task found:', {
          title: nextTask.title,
          startTime: nextTask.startAt,
          timeUntil: nextTask.startAt
            ? new Date(nextTask.startAt).getTime() - new Date().getTime()
            : 'N/A',
        });
      }
    }, [nextTask]);

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
      >
        {/* Next Task Indicator */}
        {/* {nextTask && (
          <View style={styles.nextTaskIndicator}>
            <View style={styles.nextTaskIconContainer}>
              <Icon name="clock-outline" size={16} color="#0ea5e9" />
            </View>
            <View style={styles.nextTaskInfo}>
              <Text style={styles.nextTaskLabel}>Next up</Text>
              <Text style={styles.nextTaskTitle} numberOfLines={1}>
                {nextTask.title}
              </Text>
              <Text style={styles.nextTaskTime}>
                {getTaskTimeInfo(nextTask)}
              </Text>
            </View>
          </View>
        )} */}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'today', 'high'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                filter === f && styles.activeFilterTab,
                isDarkMode && styles.darkFilterTab,
                filter === f && isDarkMode && styles.darkActiveFilterTab,
              ]}
              onPress={() => setFilter(f)}
            >
              <Icon
                name={getFilterIcon(f)}
                size={16}
                color={
                  filter === f ? '#fff' : isDarkMode ? '#9ca3af' : '#6b7280'
                }
              />
              <Text
                style={[
                  styles.filterTabText,
                  filter === f && styles.activeFilterTabText,
                  isDarkMode && styles.darkText,
                  filter === f && { color: '#fff' },
                ]}
              >
                {f === 'high'
                  ? 'High Priority'
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        <View style={styles.todoList}>
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo: Todo, index: number) => (
              <Animated.View
                key={todo.id}
                style={[
                  styles.todoItemWrapper,
                  {
                    opacity: 1,
                    transform: [{ translateY: 0 }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.todoItem,
                    isDarkMode && styles.darkTodoItem,
                    todo.completed && styles.completedTodo,
                    { borderLeftColor: getPriorityColor(todo.priority) },
                    todo.source === 'google' && styles.googleTodoItem,
                    // Highlight next upcoming task
                    nextTask && todo.id === nextTask.id && styles.nextTaskItem,
                  ]}
                  onPress={() => onTaskPress(todo.id)}
                  onLongPress={() => onTaskLongPress(todo)}
                >
                  <View style={styles.todoContent}>
                    <View style={styles.todoLeft}>
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            todo.completed && styles.checkedBox,
                            isDarkMode && styles.darkCheckbox,
                            todo.completed &&
                              isDarkMode &&
                              styles.darkCheckedBox,
                          ]}
                        >
                          {todo.completed && (
                            <Icon name="check" size={14} color="#ffffff" />
                          )}
                        </View>
                      </View>
                      <View style={styles.todoTextContent}>
                        <View style={styles.todoHeader}>
                          <Text
                            style={[
                              styles.todoTitle,
                              isDarkMode && styles.darkText,
                              todo.completed && styles.completedText,
                            ]}
                            numberOfLines={2}
                          >
                            {todo.title}
                          </Text>
                          <View style={styles.todoMeta}>
                            {todo.source === 'google' && (
                              <Icon name="google" size={14} color="#4285F4" />
                            )}
                            {nextTask && todo.id === nextTask.id && (
                              <Icon
                                name="clock-outline"
                                size={14}
                                color="#0ea5e9"
                              />
                            )}
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.todoSubtitle,
                            isDarkMode && styles.darkSubtext,
                          ]}
                        >
                          {getTaskTimeInfo(todo)}
                          {nextTask && todo.id === nextTask.id && (
                            <Text
                              style={{ color: '#0ea5e9', fontWeight: '600' }}
                            >
                              {' • Next up'}
                            </Text>
                          )}
                        </Text>
                        {/* Show date prominently for Google Calendar events */}
                        {/* {todo.source === 'google' && todo.startAt && (
                      <Text
                        style={[
                          styles.todoDate,
                          isDarkMode && styles.darkSubtext,
                        ]}
                      >
                        📅 {formatDate(new Date(todo.startAt))}
                      </Text>
                    )} */}
                        {(todo.location ||
                          (todo.attendees && todo.attendees.length > 0)) && (
                          <View style={styles.todoExtras}>
                            {todo.location && (
                              <Text
                                style={[
                                  styles.todoExtraText,
                                  isDarkMode && styles.darkSubtext,
                                ]}
                                numberOfLines={1}
                              >
                                📍 {todo.location}
                              </Text>
                            )}
                            {todo.attendees && todo.attendees.length > 0 && (
                              <Text
                                style={[
                                  styles.todoExtraText,
                                  isDarkMode && styles.darkSubtext,
                                ]}
                              >
                                👥 {todo.attendees.length} attendee
                                {todo.attendees.length > 1 ? 's' : ''}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={64} color="#d1d5db" />
              <Text
                style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}
              >
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  isDarkMode && styles.darkSubtext,
                ]}
              >
                {filter === 'all'
                  ? 'Create your first task to get started'
                  : `You don't have any ${filter} tasks at the moment`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  },
);
