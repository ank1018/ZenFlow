// Timeline View Component
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Todo } from '../../types';
import { getPriorityColor, formatTimeOfDay } from '../../utils/helpers';
import { styles, HOUR_HEIGHT, MINUTE_HEIGHT } from './TodoScreen.style';
import {
  isSameDay,
  minutesFromMidnight,
  formatHour,
  blockPosition,
  startOf,
  endOf,
} from './helper-functions';

const TimelineView: React.FC<{
  todosForSelectedDay: Todo[];
  selectedDate: Date;
  now: Date;
  onTaskPress: (todo: Todo) => void;
  onTimelineClick: (time: Date) => void;
  isDarkMode: boolean;
}> = ({
  todosForSelectedDay,
  selectedDate,
  now,
  onTaskPress,
  onTimelineClick,
  isDarkMode,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current time when timeline loads
  useEffect(() => {
    if (isSameDay(selectedDate, now) && scrollViewRef.current) {
      const currentTimeMinutes = minutesFromMidnight(now);
      const scrollPosition = Math.max(
        0,
        currentTimeMinutes * MINUTE_HEIGHT - 200,
      ); // Center with offset

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate, now]);

  return (
    <View
      style={[
        styles.timelineContainer,
        isDarkMode && styles.darkTimelineContainer,
      ]}
    >
      {/* Timeline hint */}
      {/* <View style={styles.timelineHint}>
        <Text style={styles.timelineHintText}>Tap to add task</Text>
      </View> */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ height: HOUR_HEIGHT * 24 }}>
          {/* hour grid */}
          {Array.from({ length: 24 }).map((_, h) => (
            <View key={h} style={[styles.hourRow, { top: h * HOUR_HEIGHT }]}>
              <Text
                style={[styles.hourLabel, isDarkMode && styles.darkHourLabel]}
              >
                {formatHour(h)}
              </Text>
              <View
                style={[styles.hourLine, isDarkMode && styles.darkHourLine]}
              />
              {/* Clickable hour slot */}
              <TouchableOpacity
                style={styles.hourClickArea}
                onPress={() => {
                  const clickTime = new Date(selectedDate);
                  clickTime.setHours(h, 0, 0, 0);
                  onTimelineClick(clickTime);
                }}
                activeOpacity={0.3}
              />
            </View>
          ))}

          {/* current time line (only for today) */}
          {isSameDay(selectedDate, now) && (
            <View
              style={[
                styles.nowLine,
                { top: minutesFromMidnight(now) * MINUTE_HEIGHT },
              ]}
            >
              <View style={styles.nowDot} />
              <Text style={styles.nowText}>{formatTimeOfDay(now)}</Text>
            </View>
          )}

          {/* Task blocks - Improved visibility for conflicts */}
          {todosForSelectedDay.map((t, index) => {
            const { top, height } = blockPosition(t);
            return (
              <TouchableOpacity
                key={`${t.id}-${index}`}
                activeOpacity={0.8}
                onPress={() => onTaskPress(t)}
                style={[
                  styles.taskBlock,
                  {
                    top,
                    height: Math.max(height, 34), // Reduced minimum height
                    borderColor: getPriorityColor(t.priority),
                    backgroundColor:
                      t.source === 'google' ? '#f0f8ff' : '#f8fafc',
                  },
                  isDarkMode && styles.darkTaskBlock,
                ]}
              >
                <View style={styles.taskBlockContent}>
                  <View style={styles.taskBlockHeader}>
                    <Text
                      style={[
                        styles.taskTitle,
                        isDarkMode && styles.darkTaskTitle,
                        t.completed && styles.completedTaskTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    {t.source === 'google' && (
                      <Icon name="google" size={12} color="#4285F4" />
                    )}
                  </View>
                  <View style={styles.taskTimeContainer}>
                    <Text
                      style={[
                        styles.taskTime,
                        isDarkMode && styles.darkTaskTime,
                      ]}
                      numberOfLines={1}
                    >
                      {startOf(t) && endOf(t)
                        ? `${formatTimeOfDay(startOf(t)!)} — ${formatTimeOfDay(
                            endOf(t)!,
                          )}`
                        : 'No time set'}
                    </Text>
                    {t.location && (
                      <Text
                        style={[
                          styles.taskLocation,
                          isDarkMode && styles.darkTaskTime,
                        ]}
                        numberOfLines={1}
                      >
                        📍 {t.location}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Scroll to Now button (only for today) */}
      {isSameDay(selectedDate, now) && (
        <TouchableOpacity
          style={[
            styles.scrollToNowButton,
            isDarkMode && styles.darkScrollToNowButton,
          ]}
          onPress={() => {
            const currentTimeMinutes = minutesFromMidnight(now);
            const scrollPosition = Math.max(
              0,
              currentTimeMinutes * MINUTE_HEIGHT - 200,
            );
            scrollViewRef.current?.scrollTo({
              y: scrollPosition,
              animated: true,
            });
          }}
        >
          <Icon name="clock-outline" size={16} color="#6366f1" />
          <Text style={styles.scrollToNowText}>Now</Text>
        </TouchableOpacity>
      )}

      {/* Empty state */}
      {todosForSelectedDay.length === 0 && (
        <View style={styles.timelineEmptyState}>
          <Icon name="calendar-blank" size={48} color="#d1d5db" />
          <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>
            No tasks scheduled
          </Text>
          <Text
            style={[
              styles.emptyStateSubtitle,
              isDarkMode && styles.darkSubtext,
            ]}
          >
            Tap anywhere on the timeline to create a task, or use the + button
          </Text>
        </View>
      )}
    </View>
  );
};

export default TimelineView;
