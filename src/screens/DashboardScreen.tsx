import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { useUserStats, useTimerSessions, useSleepData } from '../hooks/useData';
import { useTodos } from '../contexts/TodoContext';
import { useAppUsage } from '../hooks/useAppUsage';
import { formatTime, calculateProgress } from '../utils/helpers';
import AppUsageService from '../services/AppUsageService';

const DashboardScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { stats, loading: statsLoading, calculateStats } = useUserStats();
  const { todos, loading: todosLoading } = useTodos();
  const { todayFocusTime, loading: timerLoading } = useTimerSessions();
  const { latestSleep, loading: sleepLoading } = useSleepData();
  const { startTracking, isTracking, usageData } = useAppUsage();
  const [permissionStatus, setPermissionStatus] = useState<{
    hasPermissions: boolean;
    needsPermissions: boolean;
    permissionType: string;
    availablePermissions: string[];
    isProduction: boolean;
  } | null>(null);

  useEffect(() => {
    // Calculate stats when component mounts
    calculateStats();
  }, [calculateStats]);

  // Check permission status
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const status =
          await AppUsageService.getInstance().checkPermissionsStatus();
        // console.log removed
        setPermissionStatus(status);
      } catch (error) {
        // console.log removed
      }
    };
    checkPermissions();
  }, []);

  // Start phone usage tracking when component mounts
  useEffect(() => {
    if (!isTracking) {
      startTracking().catch(error => {
        console.log(
          'Phone usage tracking not available, using fallback mode:',
          error,
        );
        // Don't show error to user, just continue with fallback
      });
    }
  }, [isTracking, startTracking]);

  // Comprehensive logging of all available data
  useEffect(() => {
    const logAllAvailableData = async () => {
      // console.log removed

      try {
        const appUsageService = AppUsageService.getInstance();

        // 1. Log permission status
        // console.log removed

        // 2. Log raw app usage data
        // console.log removed
        const rawUsageData = await appUsageService.getAppUsageForPeriod(1);
        // console.log removed

        // 3. Log phone usage impact
        // console.log removed
        const phoneImpact = await appUsageService.getPhoneUsageImpact();
        // console.log removed

        // 4. Log app usage insights
        // console.log removed
        const insights = await appUsageService.getAppUsageInsights();
        // console.log removed

        // 5. Log current tracking status
        console.log('🎯 TRACKING STATUS:', {
          isTracking,
          usageDataLength: usageData?.length || 0,
          currentUsageData: usageData,
        });

        // 6. Log all available data sources
        console.log('📋 ALL AVAILABLE DATA SOURCES:', {
          userStats: stats,
          todos: todos,
          timerSessions: { todayFocusTime },
          sleepData: { latestSleep },
          appUsage: usageData,
          permissionStatus,
        });

        // 7. Log data quality assessment
        console.log('🔍 DATA QUALITY ASSESSMENT:', {
          hasRealData:
            rawUsageData.length > 0 &&
            !rawUsageData[0]?.appName?.includes('WhatsApp'), // Check if it's not demo data
          dataSource:
            rawUsageData.length > 0 ? 'Real Android Usage Stats' : 'Demo Data',
          permissionGranted: permissionStatus?.hasPermissions || false,
          trackingActive: isTracking,
          dataCompleteness: {
            appUsage: rawUsageData.length,
            sleepData: latestSleep ? 'Available' : 'Not Available',
            timerData: todayFocusTime > 0 ? 'Available' : 'Not Available',
            todoData: todos.length,
          },
        });

        // console.log removed
      } catch (error) {
        console.error('❌ Error logging comprehensive data:', error);
      }
    };

    // Log data after a short delay to ensure everything is loaded
    const timer = setTimeout(logAllAvailableData, 2000);
    return () => clearTimeout(timer);
  }, [
    permissionStatus,
    isTracking,
    usageData,
    stats,
    todos,
    todayFocusTime,
    latestSleep,
  ]);

  const openDeviceSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Open app settings
        await Linking.openURL('app-settings:');
      } else {
        // Android: Open app settings
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

  const requestPermissions = async () => {
    try {
      const appUsageService = AppUsageService.getInstance();
      const hasPermissions = await appUsageService.requestPermissions();

      if (hasPermissions) {
        Alert.alert(
          'Success',
          'Permissions granted! Phone usage tracking is now active.',
          [{ text: 'OK' }],
        );
        // Refresh permission status
        const status = await appUsageService.checkPermissionsStatus();
        setPermissionStatus(status);
      } else {
        Alert.alert(
          'Permissions Required',
          `To get accurate screen time and phone usage data, this app needs:\n\n` +
            `📍 **Location Services** - Help track phone usage patterns\n` +
            `📱 **Phone Usage Tracking** - Monitor screen time and app usage\n\n` +
            `These permissions help us provide:\n` +
            `• Accurate screen time tracking\n` +
            `• Usage pattern analysis\n` +
            `• Location-based wellness insights\n` +
            `• Personalized recommendations\n\n` +
            `Your data stays private and is stored only on your device.\n\n` +
            `**Note:** In production builds, some features may use demo data.`,
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: openDeviceSettings },
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

  const showPermissionDetails = () => {
    Alert.alert(
      'Required Permissions Explained',
      `**📍 Location Services**\n` +
        `• Helps track when you're actively using your phone\n` +
        `• Provides context for screen time analysis\n` +
        `• Enables location-based wellness insights\n` +
        `• Improves accuracy of usage patterns\n\n` +
        `**📱 Phone Usage Tracking**\n` +
        `• Monitors app usage patterns\n` +
        `• Tracks screen time duration\n` +
        `• Detects usage sessions\n` +
        `• Provides usage insights\n\n` +
        `**🔒 Privacy & Security**\n` +
        `• All data stays on your device\n` +
        `• No data is sent to external servers\n` +
        `• You control all your information\n` +
        `• Permissions can be revoked anytime\n\n` +
        `**📊 How We Use This Data**\n` +
        `• Calculate daily screen time\n` +
        `• Analyze usage patterns\n` +
        `• Provide wellness recommendations\n` +
        `• Track progress over time`,
      [
        {
          text: 'Learn More',
          onPress: () => {
            Alert.alert(
              'How to Grant Permissions',
              `**Android Users:**\n` +
                `1. Tap "Open Settings"\n` +
                `2. Go to "Apps" → "ZenFlow"\n` +
                `3. Tap "Permissions"\n` +
                `4. Enable "Location" permissions\n\n` +
                `**iOS Users:**\n` +
                `1. Tap "Open Settings"\n` +
                `2. Scroll to "ZenFlow"\n` +
                `3. Enable "Location" and "Motion & Fitness"\n` +
                `4. Grant permissions when prompted\n\n` +
                `**Note:** In production builds, some permissions may be limited. The app will work with demo data if permissions are not available.`,
              [{ text: 'Got it!' }],
            );
          },
        },
        { text: 'Request Permissions', onPress: requestPermissions },
        { text: 'Cancel' },
      ],
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSleepDuration = () => {
    if (!latestSleep) return '0h 0m';
    return formatTime(latestSleep.duration);
  };

  const getScreenTime = () => {
    // Calculate real screen time from usage data
    if (usageData && usageData.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsage = usageData.filter(data => {
        const dataDate = new Date(data.date);
        dataDate.setHours(0, 0, 0, 0);
        return dataDate.getTime() === today.getTime();
      });

      const totalScreenTime = todayUsage.reduce(
        (total, data) => total + data.usageTime,
        0,
      );
      return formatTime(totalScreenTime);
    }

    // Fallback to stats if no usage data
    return stats?.currentScreenTime
      ? formatTime(stats.currentScreenTime)
      : '0h 0m';
  };

  const getTaskProgress = () => {
    if (!stats) return 0;
    return calculateProgress(stats.completedTasks, stats.totalTasks);
  };

  const getFocusProgress = () => {
    if (!stats) return 0;
    const focusGoal = 4 * 60; // 4 hours in minutes
    return calculateProgress(stats.totalFocusTime, focusGoal);
  };

  // Manual permission test for debugging
  const testPermissionRequest = async () => {
    // console.log removed
    try {
      const appUsageService = AppUsageService.getInstance();

      // Check current status
      const status = await appUsageService.checkPermissionsStatus();

      if (!status.hasPermissions && status.needsPermissions) {
        Alert.alert(
          'App Usage Tracking Permission',
          'To track your app usage and provide accurate screen time data, ZenFlow needs access to Usage Statistics.\n\n' +
            'This permission allows the app to see which apps you use and for how long, but does not access the content of your apps.\n\n' +
            'Would you like to enable this permission now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable Permission',
              onPress: async () => {
                try {
                  const granted = await appUsageService.requestPermissions();
                  if (granted) {
                    Alert.alert(
                      'Permission Granted! ✅',
                      "App usage tracking is now enabled. You'll see real data in the dashboard.",
                      [{ text: 'OK' }],
                    );
                  } else {
                    Alert.alert(
                      'Permission Required',
                      'Please enable Usage Statistics access in Settings:\n\n' +
                        'Settings → Apps → Special app access → Usage access → ZenFlow',
                      [
                        { text: 'Cancel' },
                        {
                          text: 'Open Settings',
                          onPress: () => {
                            if (Platform.OS === 'ios') {
                              Linking.openURL('app-settings:');
                            } else {
                              Linking.openSettings();
                            }
                          },
                        },
                      ],
                    );
                  }

                  // Refresh status
                  const newStatus =
                    await appUsageService.checkPermissionsStatus();
                  setPermissionStatus(newStatus);
                } catch (error) {
                  console.error('Permission request error:', error);
                  Alert.alert(
                    'Error',
                    'Failed to request permission. Please try again.',
                  );
                }
              },
            },
          ],
        );
      } else if (status.hasPermissions) {
        Alert.alert(
          'Permission Status',
          "App usage tracking is enabled! ✅\n\nYou're seeing real data from your device.",
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert(
          'App Usage Tracking',
          'This app is currently running in demo mode with sample data.\n\n' +
            'Real app usage tracking requires:\n' +
            '• Android: Usage Stats permission (enabled in Settings)\n' +
            '• iOS: Screen Time API access\n\n' +
            'For now, the app uses realistic sample data to demonstrate all features.',
          [
            { text: 'OK' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }

      // Refresh status
      setPermissionStatus(status);
    } catch (error) {
      console.error('🧪 Manual permission test error:', error);
      Alert.alert(
        'Permission Test Error',
        `Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }\n\nCheck console logs for details.`,
        [{ text: 'OK' }],
      );
    }
  };

  if (statsLoading || todosLoading || timerLoading || sleepLoading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading your data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {getGreeting()}, {stats?.userName || 'User'}!
            </Text>
            <Text style={styles.subtitle}>Let's make today productive</Text>
          </View>
        </LinearGradient>

        {/* Main Stats */}
        <View style={styles.content}>
          <StatCard
            title="Today's Focus"
            value={`${stats?.completedTasks || 0} of ${
              stats?.totalTasks || 0
            } tasks`}
            style={styles.mainStatCard}
          />
          <ProgressBar
            progress={getTaskProgress()}
            style={styles.progressBar}
          />

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Sleep"
              value={getSleepDuration()}
              color="#10b981"
              style={styles.gridCard}
            />
            <StatCard
              title="Screen Time"
              value={getScreenTime()}
              color="#f59e0b"
              style={styles.gridCard}
            />
          </View>

          {/* Permission Request Banner */}
          {permissionStatus && permissionStatus.needsPermissions && (
            <View style={styles.permissionBanner}>
              <Icon name="shield-alert" size={24} color="#f59e0b" />
              <View style={styles.permissionContent}>
                <Text
                  style={[
                    styles.permissionTitle,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  Enable Phone Usage Tracking
                </Text>
                <Text
                  style={[
                    styles.permissionText,
                    isDarkMode && { color: '#9ca3af' },
                  ]}
                >
                  Grant usage statistics permission to track your app usage and
                  provide personalized insights.
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Debug Permission Status (only in development) */}
          {__DEV__ && permissionStatus && (
            <View style={styles.debugBanner}>
              <Text style={styles.debugText}>
                Debug: hasPermissions=
                {permissionStatus.hasPermissions.toString()}, needsPermissions=
                {permissionStatus.needsPermissions.toString()}, isProduction=
                {permissionStatus.isProduction.toString()}
              </Text>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={testPermissionRequest}
              >
                <Text style={styles.debugButtonText}>
                  Test Permission Request
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.debugButton,
                  { backgroundColor: '#10b981', marginTop: 5 },
                ]}
                onPress={() => {
                  console.log(
                    '🔍 Current Permission Status:',
                    permissionStatus,
                  );
                  Alert.alert(
                    'Current Status',
                    `hasPermissions: ${permissionStatus?.hasPermissions}\n` +
                      `needsPermissions: ${permissionStatus?.needsPermissions}\n` +
                      `isProduction: ${permissionStatus?.isProduction}\n` +
                      `permissionType: ${permissionStatus?.permissionType}\n\n` +
                      `Check console for detailed logs.`,
                    [{ text: 'OK' }],
                  );
                }}
              >
                <Text style={styles.debugButtonText}>Check Current Status</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Permission Status Indicator */}
          {permissionStatus &&
            (permissionStatus.needsPermissions ||
              (!permissionStatus.isProduction &&
                !permissionStatus.hasPermissions)) && (
              <View style={styles.permissionContainer}>
                <TouchableOpacity
                  style={styles.permissionBanner}
                  onPress={requestPermissions}
                >
                  <Icon name="shield-key" size={16} color="#ffffff" />
                  <Text style={styles.permissionText}>
                    Grant permissions for accurate screen time tracking
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={showPermissionDetails}
                >
                  <Icon name="information" size={16} color="#4f46e5" />
                </TouchableOpacity>
              </View>
            )}

          {/* Production Build Indicator */}
          {permissionStatus && permissionStatus.isProduction && (
            <View style={styles.productionBanner}>
              <Icon name="package-variant" size={16} color="#6b7280" />
              <Text style={styles.productionText}>
                Production build: Using demo data for testing
              </Text>
            </View>
          )}

          {/* Demo Mode Indicator */}
          {permissionStatus && permissionStatus.needsPermissions && (
            <View style={styles.demoBanner}>
              <Icon name="test-tube" size={16} color="#f59e0b" />
              <Text style={styles.demoText}>
                Demo mode: Using sample data for testing
              </Text>
            </View>
          )}

          {/* Focus Time Card */}
          <StatCard
            title="Today's Focus Time"
            value={formatTime(todayFocusTime)}
            subtitle="Goal: 4 hours"
            color="#4f46e5"
            style={styles.focusCard}
          />
          <ProgressBar
            progress={getFocusProgress()}
            style={styles.progressBar}
            gradientColors={['#4f46e5', '#7c3aed']}
          />

          {/* Streaks */}
          <View style={styles.streaksContainer}>
            <View style={styles.streakCard}>
              <Icon name="sleep" size={24} color="#10b981" />
              <Text style={styles.streakNumber}>{stats?.sleepStreak || 0}</Text>
              <Text style={styles.streakLabel}>Sleep Streak</Text>
            </View>
            <View style={styles.streakCard}>
              <Icon name="timer" size={24} color="#4f46e5" />
              <Text style={styles.streakNumber}>{stats?.focusStreak || 0}</Text>
              <Text style={styles.streakLabel}>Focus Streak</Text>
            </View>
          </View>

          {/* Motivation Card */}
          <LinearGradient
            colors={['#f0f9ff', '#e0f2fe']}
            style={styles.motivationCard}
          >
            <View style={styles.motivationContent}>
              <Icon name="tree" size={24} color="#0369a1" />
              <Text style={styles.motivationText}>
                🌱 Your forest is growing! Keep up the good habits.
              </Text>
            </View>
          </LinearGradient>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="plus" size={24} color="#4f46e5" />
              <Text style={styles.actionText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="timer" size={24} color="#4f46e5" />
              <Text style={styles.actionText}>Start Focus</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  darkText: {
    color: '#ffffff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  mainStatCard: {
    marginBottom: 10,
  },
  progressBar: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
  },
  focusCard: {
    marginBottom: 10,
  },
  streaksContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginVertical: 5,
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  motivationCard: {
    borderRadius: 12,
    marginBottom: 20,
  },
  motivationContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#d97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7', // Light yellow background
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  demoText: {
    color: '#d97706', // Darker yellow text
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  infoButton: {
    padding: 10,
  },
  productionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff', // Light blue background
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  productionText: {
    color: '#4f46e5', // Darker blue text
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugBanner: {
    backgroundColor: '#f0f9eb', // Light green background for debug
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0', // Lighter green border
  },
  debugText: {
    fontSize: 14,
    color: '#065f46', // Darker green text
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 10,
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
