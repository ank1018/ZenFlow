import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppUsage } from '../hooks/useAppUsage';
import AppUsageService from '../services/AppUsageService';

const DigitalWellnessScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const { usageData, isTracking } = useAppUsage();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [usageData]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const appUsageService = AppUsageService.getInstance();
      const healthInsights =
        await appUsageService.getHealthAndProductivityInsights();
      setInsights(healthInsights);
    } catch (error) {
      console.log('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real data from usageData
  const totalUsage = usageData.reduce((sum, app) => sum + app.usageTime, 0);
  const healthyUsage = usageData
    .filter(app => app.category === 'health')
    .reduce((sum, app) => sum + app.usageTime, 0);
  const wellnessScore =
    totalUsage > 0 ? Math.round((healthyUsage / totalUsage) * 100) : 0;

  // Group apps by category
  const categoryData = [
    {
      name: 'Health & Wellness',
      value: usageData
        .filter(app => app.category === 'health')
        .reduce((sum, app) => sum + app.usageTime, 0),
      color: '#10b981',
      icon: '💚',
    },
    {
      name: 'Productivity',
      value: usageData
        .filter(app => app.category === 'productivity')
        .reduce((sum, app) => sum + app.usageTime, 0),
      color: '#3b82f6',
      icon: '💼',
    },
    {
      name: 'Social Media',
      value: usageData
        .filter(app => app.category === 'social')
        .reduce((sum, app) => sum + app.usageTime, 0),
      color: '#f59e0b',
      icon: '📱',
    },
    {
      name: 'Entertainment',
      value: usageData
        .filter(app => app.category === 'entertainment')
        .reduce((sum, app) => sum + app.usageTime, 0),
      color: '#8b5cf6',
      icon: '🎮',
    },
    {
      name: 'Other',
      value: usageData
        .filter(app => app.category === 'other')
        .reduce((sum, app) => sum + app.usageTime, 0),
      color: '#6b7280',
      icon: '⚙️',
    },
  ].filter(category => category.value > 0); // Only show categories with usage

  // Helper functions
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health':
        return '#10b981';
      case 'productivity':
        return '#3b82f6';
      case 'social':
        return '#f59e0b';
      case 'entertainment':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'health':
        return 'Wellness';
      case 'productivity':
        return 'Productivity';
      case 'social':
        return 'Social';
      case 'entertainment':
        return 'Entertainment';
      default:
        return 'Other';
    }
  };

  const getWellnessLevel = (score: number) => {
    if (score >= 70)
      return { level: 'Excellent', color: '#10b981', emoji: '🌟' };
    if (score >= 50) return { level: 'Good', color: '#f59e0b', emoji: '🌱' };
    return { level: 'Needs Focus', color: '#ef4444', emoji: '🎯' };
  };

  const wellness = getWellnessLevel(wellnessScore);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Digital Wellbeing</Text>
          <Text style={styles.subtitle}>Your mindful usage today</Text>
        </View>
        <View style={styles.headerIcon}>
          <Icon name="leaf" size={24} color="#ffffff" />
        </View>
      </View>

      {/* Wellness Score Card */}
      <View style={styles.wellnessCard}>
        <View style={styles.wellnessHeader}>
          <View style={styles.wellnessInfo}>
            <Text style={styles.wellnessEmoji}>{wellness.emoji}</Text>
            <View>
              <Text style={styles.wellnessTitle}>Wellness Score</Text>
              <Text style={styles.wellnessSubtitle}>
                Based on mindful usage
              </Text>
            </View>
          </View>
          <View style={styles.wellnessScore}>
            <Text style={[styles.scoreValue, { color: wellness.color }]}>
              {wellnessScore}
            </Text>
            <Text style={[styles.scoreLevel, { color: wellness.color }]}>
              {wellness.level}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${wellnessScore}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>Perfect Balance</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statIcon}>
              <Icon name="clock" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.statLabel}>Screen Time</Text>
              <Text style={styles.statValue}>1h 20m</Text>
            </View>
          </View>
          <View style={styles.statTrend}>
            <Icon name="trending-up" size={16} color="#10b981" />
            <Text style={styles.trendText}>12% less than yesterday</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statIcon}>
              <Icon name="heart" size={20} color="#8b5cf6" />
            </View>
            <View>
              <Text style={styles.statLabel}>Wellness Apps</Text>
              <Text style={styles.statValue}>59m</Text>
            </View>
          </View>
          <View style={styles.statTrend}>
            <Icon name="trending-up" size={16} color="#10b981" />
            <Text style={styles.trendText}>Great focus!</Text>
          </View>
        </View>
      </View>

      {/* App Usage List */}
      <View style={styles.usageCard}>
        <Text style={styles.cardTitle}>📊 App Usage Breakdown</Text>

        <View style={styles.categoryList}>
          {categoryData.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryTime}>
                    {category.value} minutes
                  </Text>
                </View>
              </View>
              <Text style={styles.categoryPercent}>
                {Math.round((category.value / totalUsage) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Apps */}
      <View style={styles.usageCard}>
        <Text style={styles.cardTitle}>🏆 Today's App Usage</Text>

        <View style={styles.appList}>
          {usageData.slice(0, 5).map((app, index) => (
            <View key={index} style={styles.appItem}>
              <View
                style={[
                  styles.appIcon,
                  { backgroundColor: getCategoryColor(app.category) },
                ]}
              >
                <Text style={styles.appIconText}>{index + 1}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.appName}</Text>
                <View style={styles.appDetails}>
                  <Text style={styles.appTime}>{app.usageTime}m</Text>
                  <View
                    style={[
                      styles.appCategory,
                      {
                        backgroundColor:
                          app.category === 'health' ? '#dcfce7' : '#f3f4f6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.appCategoryText,
                        {
                          color:
                            app.category === 'health' ? '#166534' : '#6b7280',
                        },
                      ]}
                    >
                      {getCategoryName(app.category)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.appPercent}>
                {Math.round((app.usageTime / totalUsage) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>✨ Today's Wellness Insights</Text>

        {insights?.digitalWellbeing?.recommendations
          ?.slice(0, 2)
          .map((recommendation: string, index: number) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightEmoji}>
                {index === 0 ? '🌟' : '💡'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>
                  {index === 0 ? 'Wellness Insight' : 'Smart Tip'}
                </Text>
                <Text style={styles.insightText} numberOfLines={3}>
                  {recommendation}
                </Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wellnessCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wellnessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wellnessEmoji: {
    fontSize: 32,
  },
  wellnessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  wellnessSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  wellnessScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  usageCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  categoryTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appList: {
    gap: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  appDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  appTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  appCategory: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  appCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightsCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  insightEmoji: {
    fontSize: 24,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default DigitalWellnessScreen;
