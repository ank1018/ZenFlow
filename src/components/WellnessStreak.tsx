import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WellnessStreakProps {
  currentStreak: number;
  bestStreak: number;
  todayProgress: number;
  unlockedAchievements: number;
  totalAchievements: number;
  onPress?: () => void;
}

const WellnessStreak: React.FC<WellnessStreakProps> = ({
  currentStreak,
  bestStreak,
  todayProgress,
  unlockedAchievements,
  totalAchievements,
  onPress,
}) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '💪';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getProgressMessage = (progress: number) => {
    if (progress >= 90) return 'Amazing! Keep it up!';
    if (progress >= 80) return 'Great progress today!';
    if (progress >= 60) return 'Good effort!';
    if (progress >= 40) return 'You can do better!';
    return "Let's get started!";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your wellness journey!';
    if (streak === 1) return 'Great start!';
    if (streak < 7) return 'Building momentum!';
    return 'Amazing streak!';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>Wellness Streak</Text>
          <Text style={styles.streakSubtitle}>
            {getStreakMessage(currentStreak)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Achievement Badge */}
          <View style={styles.achievementBadge}>
            <Icon name="trophy" size={16} color="#F59E0B" />
            <Text style={styles.achievementText}>
              {unlockedAchievements}/{totalAchievements}
            </Text>
          </View>
          <View style={styles.streakIcon}>
            <Icon name="fire" size={32} color="#F59E0B" />
          </View>
        </View>
      </View>

      <View style={styles.streakStats}>
        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current</Text>
          <Text style={styles.streakEmoji}>
            {getStreakEmoji(currentStreak)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{bestStreak}</Text>
          <Text style={styles.streakLabel}>Best</Text>
          <Icon name="trophy" size={20} color="#F59E0B" />
        </View>
      </View>

      <View style={styles.todayProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressPercentage}>{todayProgress}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${todayProgress}%`,
                backgroundColor: getProgressColor(todayProgress),
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.progressMessage,
            { color: getProgressColor(todayProgress) },
          ]}
        >
          {getProgressMessage(todayProgress)}
        </Text>
      </View>

      {/* Click indicator */}
      <View style={styles.clickIndicator}>
        <Icon name="chevron-right" size={16} color="#6B7280" />
        <Text style={styles.clickText}>View achievements</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakInfo: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  streakEmoji: {
    fontSize: 20,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  todayProgress: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  clickIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  clickText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default WellnessStreak;
