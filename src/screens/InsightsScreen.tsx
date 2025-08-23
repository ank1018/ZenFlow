import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppUsage } from '../hooks/useAppUsage';
import AppUsageService from '../services/AppUsageService';
import UsageGraph from '../components/UsageGraph';
import PrivacyInfo from '../components/PrivacyInfo';
import InsightsShimmer from '../components/InsightsShimmer';
import ShimmerLoader from '../components/ShimmerLoader';
import WellnessStreak from '../components/WellnessStreak';
import AchievementCard from '../components/AchievementCard';
import InsightCard from '../components/InsightCard';
import WellnessService, {
  Achievement,
  WellnessInsight,
  WellnessStats,
} from '../services/WellnessService';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [wellnessStats, setWellnessStats] = useState<WellnessStats>({
    currentStreak: 0,
    bestStreak: 0,
    todayProgress: 0,
    totalAchievements: 6, // Initialize with total count
    unlockedAchievements: 0,
    weeklyGoal: 80,
    weeklyProgress: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [wellnessInsights, setWellnessInsights] = useState<WellnessInsight[]>(
    [],
  );
  const [showAchievements, setShowAchievements] = useState(false);

  const {
    usageData,
    isTracking,
    requestPermissions,
    checkPermissions,
    loading,
    loadUsageData,
    silentRefreshData,
  } = useAppUsage();
  const [insights, setInsights] = useState<any>(null);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    console.log('🔄 InsightsScreen useEffect triggered:', {
      usageDataLength: usageData.length,
      hasUsageData: usageData.length > 0,
    });

    if (usageData.length > 0) {
      console.log('📊 Loading wellness data...');
      loadWellnessData();
    } else {
      console.log('⚠️ No usage data available yet');
    }
  }, [usageData]);

  // Load usage data on mount
  useEffect(() => {
    loadUsageData(7, () => setHasLoadedOnce(true)); // Load 7 days for the graph
  }, []);

  // Initialize wellness service even without usage data
  useEffect(() => {
    const initializeWellness = async () => {
      try {
        const wellnessService = WellnessService.getInstance();

        // Get initial achievements (even if empty)
        const achievementList = wellnessService.getAchievements();
        setAchievements(achievementList);

        console.log('🎯 Wellness service initialized:', {
          achievements: achievementList.length,
          achievementList: achievementList.map(a => ({
            id: a.id,
            unlocked: a.unlocked,
            progress: a.progress,
          })),
        });

        // Update stats with current achievement count
        setWellnessStats(prev => ({
          ...prev,
          totalAchievements: achievementList.length,
          unlockedAchievements: achievementList.filter(a => a.unlocked).length,
        }));
      } catch (error) {
        console.log('Error initializing wellness service:', error);
      }
    };

    initializeWellness();
  }, []);

  // Periodic refresh to check for real data availability (silent refresh)
  useEffect(() => {
    if (permissionStatus?.hasPermissions && hasLoadedOnce) {
      const interval = setInterval(async () => {
        try {
          console.log('🔄 Silent refresh checking for real data...');
          // Silent refresh - don't show loading state
          await silentRefreshData(7);
        } catch (error) {
          console.error('❌ Error in silent refresh:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [permissionStatus?.hasPermissions, hasLoadedOnce, silentRefreshData]);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const status = await checkPermissions();
        setPermissionStatus(status);
      } catch (error) {
        console.log('Error checking permissions:', error);
      }
    };
    checkPermissionStatus();
  }, [checkPermissions]);

  const openDeviceSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
      Alert.alert(
        'Settings',
        'Please manually open your device settings and grant the required permissions for this app.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert(
          'Success',
          'Permissions granted! Phone usage tracking is now active.',
          [{ text: 'OK' }],
        );
        const status = await checkPermissions();
        setPermissionStatus(status);

        // Auto-refresh data after permissions are granted
        console.log('🔄 Auto-refreshing data after permissions granted...');
        setTimeout(async () => {
          try {
            await loadUsageData(7);
            console.log('✅ Data refreshed after permissions granted');
          } catch (error) {
            console.error('❌ Error refreshing data after permissions:', error);
          }
        }, 2000); // Wait 2 seconds for system to update
      } else {
        Alert.alert(
          '🔒 Privacy-First Permission Request',
          `ZenFlow needs access to your app usage data to provide personalized wellness insights.\n\n` +
            `📱 **What we need:**\n` +
            `• App usage statistics (which apps you use and for how long)\n\n` +
            `🛡️ **Your Privacy is Protected:**\n` +
            `✅ **100% Local Storage** - All data stays on your device\n` +
            `✅ **No Internet Required** - Works completely offline\n` +
            `✅ **No Data Sharing** - We never see your personal data\n` +
            `✅ **No Analytics** - Your usage patterns stay private\n` +
            `✅ **No Cloud Storage** - Nothing is uploaded to servers\n\n` +
            `🎯 **What you get:**\n` +
            `• Personalized wellness insights\n` +
            `• Screen time analysis\n` +
            `• Digital wellbeing recommendations\n` +
            `• Usage pattern tracking\n\n` +
            `Your data is processed locally and never leaves your device.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: '🔒 Grant Permission', onPress: openDeviceSettings },
          ],
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert(
        'Error',
        'Failed to request permissions. Please try opening settings manually.',
        [
          { text: 'Cancel' },
          { text: 'Open Settings', onPress: openDeviceSettings },
        ],
      );
    }
  };

  const loadWellnessData = async () => {
    try {
      const wellnessService = WellnessService.getInstance();

      // Update wellness stats
      const stats = await wellnessService.updateStats(usageData);
      setWellnessStats(stats);

      // Get achievements
      const achievementList = wellnessService.getAchievements();
      setAchievements(achievementList);

      // Generate insights
      const wellnessInsightList = await wellnessService.generateInsights(
        usageData,
      );
      setWellnessInsights(wellnessInsightList);

      console.log('🎯 Wellness data loaded:', {
        stats,
        achievements: achievementList.length,
        insights: wellnessInsightList.length,
      });
    } catch (error) {
      console.log('Error loading wellness data:', error);
    }
  };

  // Process and aggregate usage data for today only
  const processedUsageData = useMemo(() => {
    const appMap = new Map<
      string,
      { appName: string; usageTime: number; category: string }
    >();

    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Processing data for today:', today);

    // Only process today's data for stats
    usageData.forEach(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      if (itemDate === today) {
        const key = item.appName;
        if (appMap.has(key)) {
          const existing = appMap.get(key)!;
          existing.usageTime += item.usageTime;
        } else {
          appMap.set(key, {
            appName: item.appName,
            usageTime: item.usageTime,
            category: item.category,
          });
        }
      }
    });

    const result = Array.from(appMap.values());
    const totalToday = result.reduce((sum, app) => sum + app.usageTime, 0);
    console.log(
      `📊 Today's processed data: ${
        result.length
      } apps, total usage: ${totalToday} minutes (${(totalToday / 60).toFixed(
        1,
      )} hours)`,
    );

    return result;
  }, [usageData]);

  // Calculate real data from processed usage data
  const totalUsage = processedUsageData.reduce(
    (
      sum: number,
      app: { appName: string; usageTime: number; category: string },
    ) => sum + app.usageTime,
    0,
  );
  const healthyUsage = processedUsageData
    .filter(
      (app: { appName: string; usageTime: number; category: string }) =>
        app.category === 'health',
    )
    .reduce(
      (
        sum: number,
        app: { appName: string; usageTime: number; category: string },
      ) => sum + app.usageTime,
      0,
    );
  const wellnessScore =
    totalUsage > 0 ? Math.round((healthyUsage / totalUsage) * 100) : 0;

  // Group apps by category with enhanced data
  const categoryData = [
    {
      name: 'Health & Wellness',
      value: processedUsageData
        .filter(app => app.category === 'health')
        .reduce(
          (
            sum: number,
            app: { appName: string; usageTime: number; category: string },
          ) => sum + app.usageTime,
          0,
        ),
      color: '#34D399',
      gradient: ['#34D399', '#10B981'],
      icon: 'heart-pulse',
      description: 'Mind & body care',
    },
    {
      name: 'Productivity',
      value: processedUsageData
        .filter(app => app.category === 'productivity')
        .reduce(
          (
            sum: number,
            app: { appName: string; usageTime: number; category: string },
          ) => sum + app.usageTime,
          0,
        ),
      color: '#60A5FA',
      gradient: ['#60A5FA', '#3B82F6'],
      icon: 'rocket-launch',
      description: 'Work & learning',
    },
    {
      name: 'Social Media',
      value: processedUsageData
        .filter(app => app.category === 'social')
        .reduce(
          (
            sum: number,
            app: { appName: string; usageTime: number; category: string },
          ) => sum + app.usageTime,
          0,
        ),
      color: '#FBBF24',
      gradient: ['#FBBF24', '#F59E0B'],
      icon: 'account-group',
      description: 'Social connections',
    },
    {
      name: 'Entertainment',
      value: processedUsageData
        .filter(app => app.category === 'entertainment')
        .reduce(
          (
            sum: number,
            app: { appName: string; usageTime: number; category: string },
          ) => sum + app.usageTime,
          0,
        ),
      color: '#A78BFA',
      gradient: ['#A78BFA', '#8B5CF6'],
      icon: 'movie-play',
      description: 'Fun & games',
    },
    {
      name: 'Other',
      value: processedUsageData
        .filter(app => app.category === 'other')
        .reduce(
          (
            sum: number,
            app: { appName: string; usageTime: number; category: string },
          ) => sum + app.usageTime,
          0,
        ),
      color: '#9CA3AF',
      gradient: ['#9CA3AF', '#6B7280'],
      icon: 'apps',
      description: 'Utilities & more',
    },
  ].filter(category => category.value > 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health':
        return '#34D399';
      case 'productivity':
        return '#60A5FA';
      case 'social':
        return '#FBBF24';
      case 'entertainment':
        return '#A78BFA';
      default:
        return '#9CA3AF';
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
      return {
        level: 'Excellent',
        color: '#10B981',
        emoji: '🌟',
        message: 'Amazing balance!',
      };
    if (score >= 50)
      return {
        level: 'Good',
        color: '#F59E0B',
        emoji: '🌱',
        message: 'Great progress!',
      };
    return {
      level: 'Needs Focus',
      color: '#EF4444',
      emoji: '🎯',
      message: 'Room to improve',
    };
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const wellness = getWellnessLevel(wellnessScore);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', emoji: '🌅' };
    if (hour < 17) return { greeting: 'Good afternoon', emoji: '☀️' };
    return { greeting: 'Good evening', emoji: '🌙' };
  };

  const timeGreeting = getTimeGreeting();

  if (loading && !hasLoadedOnce) {
    return <InsightsShimmer />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Permission Banner */}

        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {timeGreeting.emoji} {timeGreeting.greeting}
            </Text>
            <Text style={styles.title}>Digital Wellness</Text>
            <Text style={styles.subtitle}>Your mindful journey continues</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <Icon name="leaf" size={28} color="#FFFFFF" />
            </View>
            <TouchableOpacity
              style={styles.privacyInfoButton}
              onPress={() => setShowPrivacyInfo(true)}
              activeOpacity={0.7}
            >
              <Icon name="shield-information" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Graph with enhanced styling */}
        {categoryData.length > 0 && (
          <View style={styles.graphSection}>
            <UsageGraph data={usageData} />
          </View>
        )}

        {/* No refresh indicator - we want seamless updates */}

        {/* Wellness Streak - Gamified Component */}
        <WellnessStreak
          currentStreak={wellnessStats.currentStreak}
          bestStreak={wellnessStats.bestStreak}
          todayProgress={wellnessStats.todayProgress}
          unlockedAchievements={wellnessStats.unlockedAchievements}
          totalAchievements={wellnessStats.totalAchievements}
          onPress={() => setShowAchievements(true)}
        />

        {/* Enhanced Empty State */}
        {processedUsageData.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="chart-line-variant" size={80} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>No Usage Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Enable phone usage tracking to unlock your digital wellness
              insights and start your mindful journey
            </Text>

            {/* Privacy Assurance */}
            <View style={styles.privacyAssurance}>
              <Icon name="shield-check" size={16} color="#10B981" />
              <Text style={styles.privacyAssuranceText}>
                Your data stays 100% private on your device
              </Text>
            </View>

            {permissionStatus && !permissionStatus.hasPermissions && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleRequestPermissions}
                activeOpacity={0.8}
              >
                <Icon
                  name="shield-lock"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.enableButtonText}>
                  🔒 Start Private Tracking
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Enhanced Wellness Score Card */}
        {totalUsage > 0 && (
          <View style={styles.wellnessCard}>
            <View style={styles.wellnessHeader}>
              <View style={styles.wellnessInfo}>
                <View style={styles.wellnessEmojiContainer}>
                  <Text style={styles.wellnessEmoji}>{wellness.emoji}</Text>
                </View>
                <View style={styles.wellnessTextContainer}>
                  <Text style={styles.wellnessTitle}>Wellness Score</Text>
                  <Text style={styles.wellnessMessage}>{wellness.message}</Text>
                </View>
              </View>
              <View style={styles.wellnessScoreContainer}>
                <Text style={[styles.scoreValue, { color: wellness.color }]}>
                  {wellnessScore}
                </Text>
                <Text style={[styles.scoreLevel, { color: wellness.color }]}>
                  {wellness.level}
                </Text>
              </View>
            </View>

            {/* Enhanced Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${wellnessScore}%`,
                      backgroundColor: wellness.color,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.progressGlow,
                    { backgroundColor: wellness.color + '20' },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Needs Work</Text>
                <Text style={styles.progressLabel}>Excellent</Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Stats Grid */}
        {totalUsage > 0 && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryStatCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="clock-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Today's Screen Time</Text>
                <Text style={styles.statValue}>{formatTime(totalUsage)}</Text>
                <Text style={styles.statSubtext}>Total usage today</Text>
              </View>
              <View style={styles.statIndicator}>
                <Icon name="trending-up" size={16} color="#10B981" />
              </View>
            </View>

            <View style={[styles.statCard, styles.secondaryStatCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="heart" size={24} color="#10B981" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Today's Wellness Time</Text>
                <Text style={styles.statValue}>{formatTime(healthyUsage)}</Text>
                <Text style={styles.statSubtext}>
                  {Math.round((healthyUsage / totalUsage) * 100)}% of today's
                  time
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Category Breakdown */}
        {categoryData.length > 0 && (
          <View style={styles.categoryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Usage Breakdown</Text>
              <Text style={styles.cardSubtitle}>
                How you spent your time today
              </Text>
            </View>

            <View style={styles.categoryList}>
              {categoryData.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: category.color + '20' },
                      ]}
                    >
                      <Icon
                        name={category.icon}
                        size={20}
                        color={category.color}
                      />
                    </View>
                    <View style={styles.categoryDetails}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryDescription}>
                        {category.description}
                      </Text>
                      <Text style={styles.categoryTime}>
                        {formatTime(category.value)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text
                      style={[
                        styles.categoryPercent,
                        { color: category.color },
                      ]}
                    >
                      {Math.round((category.value / totalUsage) * 100)}%
                    </Text>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${(category.value / totalUsage) * 100}%`,
                            backgroundColor: category.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Enhanced Top Apps */}
        {processedUsageData.length > 0 && (
          <View style={styles.appsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Top Apps</Text>
              <Text style={styles.cardSubtitle}>
                Your most used applications today
              </Text>
            </View>

            <View style={styles.appsList}>
              {processedUsageData
                .sort((a, b) => b.usageTime - a.usageTime)
                .slice(0, 5)
                .map((app, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.appItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.appRank}>
                      <Text style={styles.appRankText}>#{index + 1}</Text>
                    </View>

                    <View
                      style={[
                        styles.appIconContainer,
                        { backgroundColor: getCategoryColor(app.category) },
                      ]}
                    >
                      <Text style={styles.appIconText}>
                        {app.appName.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.appDetails}>
                      <Text style={styles.appName} numberOfLines={1}>
                        {app.appName}
                      </Text>
                      <Text style={styles.appTime}>
                        {formatTime(app.usageTime)}
                      </Text>
                      <View style={styles.appCategoryContainer}>
                        <View
                          style={[
                            styles.appCategory,
                            {
                              backgroundColor:
                                getCategoryColor(app.category) + '20',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.appCategoryText,
                              { color: getCategoryColor(app.category) },
                            ]}
                          >
                            {getCategoryName(app.category)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.appUsageIndicator}>
                      <Text
                        style={[
                          styles.appPercent,
                          { color: getCategoryColor(app.category) },
                        ]}
                      >
                        {Math.round((app.usageTime / totalUsage) * 100)}%
                      </Text>
                      <View style={styles.appUsageBar}>
                        <View
                          style={[
                            styles.appUsageBarFill,
                            {
                              width: `${(app.usageTime / totalUsage) * 100}%`,
                              backgroundColor: getCategoryColor(app.category),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Wellness Insights */}
        {wellnessInsights.length > 0 && (
          <View style={styles.insightsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Insights</Text>
              <Text style={styles.sectionSubtitle}>
                Personalized recommendations
              </Text>
            </View>
            {wellnessInsights.slice(0, 3).map(insight => (
              <InsightCard
                key={insight.id}
                title={insight.title}
                description={insight.description}
                icon={insight.icon}
                color={insight.color}
                type={insight.type}
                actionText={insight.actionText}
                onActionPress={() => {
                  // Handle insight action
                  console.log('Insight action pressed:', insight.id);
                }}
              />
            ))}
          </View>
        )}

        {/* Enhanced Insights */}
        {insights?.digitalWellbeing?.recommendations && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>Wellness Insights</Text>
              <Text style={styles.insightsSubtitle}>Personalized for you</Text>
            </View>

            {insights.digitalWellbeing.recommendations
              .slice(0, 2)
              .map((recommendation: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.insightItem}
                  activeOpacity={0.8}
                >
                  <View style={styles.insightIconContainer}>
                    <Text style={styles.insightEmoji}>
                      {index === 0 ? '💡' : '🎯'}
                    </Text>
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>
                      {index === 0 ? 'Smart Recommendation' : 'Focus Tip'}
                    </Text>
                    <Text style={styles.insightText} numberOfLines={3}>
                      {recommendation}
                    </Text>
                  </View>
                  <View style={styles.insightArrow}>
                    <Icon
                      name="chevron-right"
                      size={16}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Privacy Info Modal */}
      <PrivacyInfo
        isVisible={showPrivacyInfo}
        onClose={() => setShowPrivacyInfo(false)}
      />

      {/* Achievements Modal */}
      {showAchievements && (
        <View style={styles.modalOverlay}>
          <View style={styles.achievementsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Achievements</Text>
              <TouchableOpacity
                onPress={() => setShowAchievements(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.achievementsList}
              showsVerticalScrollIndicator={false}
            >
              {achievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => {
                    // Handle achievement press
                    console.log('Achievement pressed:', achievement.id);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 16,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerIconContainer: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyInfoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsSection: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
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
  achievementsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  achievementsList: {
    padding: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  graphSection: {
    marginBottom: 16,
  },
  wellnessCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  wellnessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wellnessEmojiContainer: {
    marginRight: 16,
  },
  wellnessEmoji: {
    fontSize: 40,
  },
  wellnessTextContainer: {
    flex: 1,
  },
  wellnessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  wellnessMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  wellnessScoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  scoreLevel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 8,
    zIndex: -1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryStatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  secondaryStatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  categoryTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryRight: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  categoryPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  appsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appsList: {
    gap: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  appRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  appIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  appTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  appCategoryContainer: {
    flexDirection: 'row',
  },
  appCategory: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  appCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  appUsageIndicator: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  appPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appUsageBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  appUsageBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightsCard: {
    backgroundColor: '#1F2937',
    margin: 16,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  insightsHeader: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightIconContainer: {
    marginRight: 16,
  },
  insightEmoji: {
    fontSize: 28,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  insightArrow: {
    marginLeft: 12,
  },
  permissionBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIconContainer: {
    marginRight: 16,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  permissionText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  enableButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  privacyAssuranceText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default InsightsScreen;
