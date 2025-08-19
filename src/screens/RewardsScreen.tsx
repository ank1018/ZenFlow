import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { formatTime } from '../utils/helpers';
import { useUserStats, useTimerSessions } from '../hooks/useData';
import { useTodos } from '../contexts/TodoContext';

const RewardsScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { stats } = useUserStats();
  const { todos } = useTodos();
  const { todayFocusTime } = useTimerSessions();

  // Use real data instead of mock data
  const forestLevel = Math.floor((stats?.sleepStreak || 0) / 7) + 1;
  const cityLevel = Math.floor((stats?.totalFocusTime || 0) / 240) + 1; // 4 hours per level
  const sleepStreak = stats?.sleepStreak || 0;
  const focusTime = stats?.totalFocusTime || 0;
  const screenTime = stats?.currentScreenTime || 0;
  const tasksCompleted = stats?.completedTasks || 0;
  const totalTasks = stats?.totalTasks || 0;

  const renderForest = () => {
    const trees = [];
    for (let i = 0; i < forestLevel * 2; i++) {
      trees.push(
        <View
          key={i}
          style={[
            styles.tree,
            {
              left: 30 + i * 50,
              height: 30 + Math.random() * 20,
            },
          ]}
        />,
      );
    }
    return trees;
  };

  const renderCity = () => {
    const buildings = [];
    for (let i = 0; i < cityLevel * 2; i++) {
      buildings.push(
        <View
          key={i}
          style={[
            styles.building,
            {
              left: 40 + i * 60,
              height: 60 + Math.random() * 60,
            },
          ]}
        />,
      );
    }
    return buildings;
  };

  const getNextReward = () => {
    if (sleepStreak >= 7) {
      return 'New tree in 2 more good sleep days!';
    } else if (focusTime >= 240) {
      return 'New building in 1 more focus session!';
    } else {
      return 'Complete more tasks to unlock rewards!';
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              Your Progress
            </Text>
            <Text style={styles.subtitle}>Building healthy habits</Text>
          </View>

          {/* Level Cards */}
          <View style={styles.levelCards}>
            <LinearGradient
              colors={['#ecfdf5', '#d1fae5']}
              style={styles.levelCard}
            >
              <View style={styles.levelContent}>
                <Text style={styles.levelEmoji}>🌲</Text>
                <Text style={styles.levelTitle}>Forest</Text>
                <Text style={styles.levelNumber}>Level {forestLevel}</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['#eff6ff', '#dbeafe']}
              style={styles.levelCard}
            >
              <View style={styles.levelContent}>
                <Text style={styles.levelEmoji}>🏙️</Text>
                <Text style={styles.levelTitle}>City</Text>
                <Text style={styles.levelNumber}>Level {cityLevel}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Forest Visualization */}
          <View style={styles.forestContainer}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.forestArea}
            >
              {renderForest()}
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="sleep" size={20} color="#10b981" />
              <Text style={styles.statLabel}>Sleep Streak</Text>
              <Text style={styles.statValue}>{sleepStreak} days</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="timer" size={20} color="#4f46e5" />
              <Text style={styles.statLabel}>Focus Time</Text>
              <Text style={styles.statValue}>{formatTime(focusTime)}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="cellphone" size={20} color="#f59e0b" />
              <Text style={styles.statLabel}>Screen Limit</Text>
              <Text style={styles.statValue}>Under 4h</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="checkbox-marked" size={20} color="#10b981" />
              <Text style={styles.statLabel}>Tasks Done</Text>
              <Text style={styles.statValue}>
                {tasksCompleted}/{totalTasks}
              </Text>
            </View>
          </View>

          {/* Progress Bars */}
          <View style={styles.progressSection}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Sleep Goal</Text>
                <Text style={styles.progressValue}>5/7 days</Text>
              </View>
              <ProgressBar
                progress={(sleepStreak / 7) * 100}
                height={6}
                gradientColors={['#10b981', '#059669']}
              />
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Focus Goal</Text>
                <Text style={styles.progressValue}>
                  {formatTime(focusTime)}/4h
                </Text>
              </View>
              <ProgressBar
                progress={(focusTime / (4 * 60)) * 100}
                height={6}
                gradientColors={['#4f46e5', '#7c3aed']}
              />
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Screen Time</Text>
                <Text style={styles.progressValue}>
                  {formatTime(screenTime)}/4h
                </Text>
              </View>
              <ProgressBar
                progress={(screenTime / (4 * 60)) * 100}
                height={6}
                gradientColors={['#f59e0b', '#d97706']}
              />
            </View>
          </View>

          {/* City Visualization */}
          <View style={styles.cityContainer}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.cityArea}
            >
              {renderCity()}
            </LinearGradient>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Icon name="star" size={20} color="#f59e0b" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Early Bird</Text>
                <Text style={styles.achievementDesc}>
                  Woke up before 7 AM for 5 days in a row
                </Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Icon name="target" size={20} color="#10b981" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Focus Master</Text>
                <Text style={styles.achievementDesc}>
                  Completed 10 focus sessions this week
                </Text>
              </View>
            </View>
          </View>

          {/* Next Reward */}
          <LinearGradient
            colors={['#fefce8', '#fef3c7']}
            style={styles.rewardCard}
          >
            <View style={styles.rewardContent}>
              <Icon name="gift" size={24} color="#a16207" />
              <Text style={styles.rewardText}>
                🏆 Next reward: {getNextReward()}
              </Text>
            </View>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="trophy" size={20} color="#4f46e5" />
              <Text style={styles.actionText}>View All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share" size={20} color="#4f46e5" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#1f2937',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  darkText: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  levelCards: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  levelCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  levelTitle: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
    marginBottom: 2,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  forestContainer: {
    marginBottom: 20,
  },
  forestArea: {
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tree: {
    position: 'absolute',
    bottom: 20,
    width: 20,
    backgroundColor: '#065f46',
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressSection: {
    marginBottom: 25,
  },
  progressItem: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  cityContainer: {
    marginBottom: 25,
  },
  cityArea: {
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  building: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    backgroundColor: '#1e40af',
    borderRadius: 2,
  },
  achievementsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  rewardCard: {
    borderRadius: 12,
    marginBottom: 25,
  },
  rewardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardText: {
    flex: 1,
    fontSize: 16,
    color: '#a16207',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
});

export default RewardsScreen;
