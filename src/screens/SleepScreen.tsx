import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { useSleepData, useSettings } from '../hooks/useData';
import { useAppUsage } from '../hooks/useAppUsage';
import AppUsageService from '../services/AppUsageService';
import {
  formatTime,
  formatTimeOfDay,
  getSleepQualityColor,
} from '../utils/helpers';

const { width } = Dimensions.get('window');

const SleepScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const {
    sleepData,
    latestSleep,
    loading,
    error,
    getSleepDataForPeriod,
    addSleepData,
  } = useSleepData();
  const { settings } = useSettings();
  const { startTracking, isTracking } = useAppUsage();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>(
    'week',
  );
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showLogSleepModal, setShowLogSleepModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingSleepData, setEditingSleepData] = useState<any>(null);
  const fadeAnim = new Animated.Value(1); // Start visible

  // Sleep logging form state
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState<
    'excellent' | 'good' | 'fair' | 'poor'
  >('good');
  const [deepSleepHours, setDeepSleepHours] = useState('2');
  const [remSleepHours, setRemSleepHours] = useState('1.5');
  const [awakenings, setAwakenings] = useState('0');
  const [heartRate, setHeartRate] = useState('60');
  const [timeToSleep, setTimeToSleep] = useState('15');

  // Get sleep data for the selected period
  const [periodData, setPeriodData] = useState<number[]>([]);
  const [averageSleep, setAverageSleep] = useState(0);
  const [phoneUsageInsights, setPhoneUsageInsights] = useState<any>(null);

  console.log(
    'SleepScreen: loading',
    loading,
    'error',
    error,
    'latestSleep',
    latestSleep,
  );

  const loadPeriodData = async () => {
    const days = selectedPeriod === 'week' ? 7 : 30;
    const periodSleepData = await getSleepDataForPeriod(days);

    // console.log removed

    // Convert to hours for display
    const hoursData = periodSleepData.map(data => data.duration / 60);
    setPeriodData(hoursData);

    if (hoursData.length > 0) {
      const avg = hoursData.reduce((a, b) => a + b, 0) / hoursData.length;
      setAverageSleep(avg);
    } else {
      // No data available - show empty state
      setPeriodData([]);
      setAverageSleep(0);
    }
  };

  // Load phone usage insights for sleep analysis
  const loadPhoneUsageInsights = async () => {
    try {
      const appUsageService = AppUsageService.getInstance();
      const healthInsights =
        await appUsageService.getHealthAndProductivityInsights();
      setPhoneUsageInsights(healthInsights);
      // console.log removed
    } catch (error) {
      console.error('Error loading phone usage insights:', error);
    }
  };

  useEffect(() => {
    loadPeriodData();
  }, [selectedPeriod]);

  // Load phone usage insights when component mounts
  useEffect(() => {
    loadPhoneUsageInsights();
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

  // Function to get sleep data for any specific date
  const getSleepDataForDate = async (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get sleep data for the specific date
      const sleepDataForDate = sleepData.filter(sleep => {
        const sleepDate = new Date(sleep.date);
        return sleepDate >= startOfDay && sleepDate <= endOfDay;
      });

      return sleepDataForDate.length > 0 ? sleepDataForDate[0] : null;
    } catch (error) {
      console.error('Error getting sleep data for date:', error);
      return null;
    }
  };

  // Function to handle date selection for editing
  const handleDateSelection = async (date: Date) => {
    setSelectedDate(date);
    const sleepDataForDate = await getSleepDataForDate(date);

    if (sleepDataForDate) {
      // Pre-fill form with existing data
      setEditingSleepData(sleepDataForDate);
      setBedtime(formatTimeOfDay(sleepDataForDate.bedtime));
      setWakeTime(formatTimeOfDay(sleepDataForDate.wakeTime));
      setSleepQuality(sleepDataForDate.quality);
      setDeepSleepHours((sleepDataForDate.deepSleepDuration / 60).toString());
      setRemSleepHours(
        ((sleepDataForDate.remSleepDuration || 1.5 * 60) / 60).toString(),
      );
      setAwakenings((sleepDataForDate.awakenings || 0).toString());
      setHeartRate((sleepDataForDate.heartRate || 60).toString());
      setTimeToSleep((sleepDataForDate.timeToSleep || 15).toString());
    } else {
      // Clear form for new entry
      setEditingSleepData(null);
      setBedtime('');
      setWakeTime('');
      setSleepQuality('good');
      setDeepSleepHours('2');
      setRemSleepHours('1.5');
      setAwakenings('0');
      setHeartRate('60');
      setTimeToSleep('15');
    }

    setShowDatePicker(false);
    setShowLogSleepModal(true);
  };

  // Function to handle sleep data update
  const handleUpdateSleep = async () => {
    if (!bedtime || !wakeTime) {
      Alert.alert('Error', 'Please enter both bedtime and wake time');
      return;
    }

    try {
      const bedtimeDate = new Date(bedtime);
      const wakeTimeDate = new Date(wakeTime);

      if (wakeTimeDate <= bedtimeDate) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }

      const duration =
        (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60);

      const updatedSleepData = {
        ...editingSleepData,
        date: selectedDate,
        bedtime: bedtimeDate,
        wakeTime: wakeTimeDate,
        duration,
        quality: sleepQuality,
        deepSleepDuration: parseFloat(deepSleepHours) * 60,
        remSleepDuration: parseFloat(remSleepHours) * 60,
        awakenings: parseInt(awakenings),
        heartRate: parseInt(heartRate),
        timeToSleep: parseInt(timeToSleep),
      };

      // Update the sleep data
      await addSleepData(updatedSleepData);
      setShowLogSleepModal(false);

      // Reset form
      setBedtime('');
      setWakeTime('');
      setSleepQuality('good');
      setDeepSleepHours('2');
      setRemSleepHours('1.5');
      setAwakenings('0');
      setHeartRate('60');
      setTimeToSleep('15');
      setEditingSleepData(null);

      Alert.alert(
        'Success',
        editingSleepData
          ? 'Sleep data updated successfully!'
          : 'Sleep data logged successfully!',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save sleep data');
      console.error('Error saving sleep:', error);
    }
  };

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
      } else {
        Alert.alert(
          'Permissions Required for Sleep Analysis',
          `To provide accurate sleep analysis and phone usage insights, this app needs:\n\n` +
            `📍 **Location Services** - Help detect phone usage patterns\n` +
            `📱 **Phone Usage Tracking** - Monitor screen time and app usage\n\n` +
            `These permissions enable:\n` +
            `• Sleep quality assessment based on phone usage\n` +
            `• Detection of night-time phone usage\n` +
            `• Screen time before bed tracking\n` +
            `• Usage pattern analysis\n` +
            `• Personalized sleep recommendations\n\n` +
            `🔒 **Privacy**: All data is stored locally on your device only.\n\n` +
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

  const showSleepPermissionDetails = () => {
    Alert.alert(
      'Sleep Tracking Permissions Explained',
      `**📍 Location Services**\n` +
        `• Helps detect when you're using your phone\n` +
        `• Provides context for sleep analysis\n` +
        `• Enables location-based sleep insights\n` +
        `• Improves accuracy of usage patterns\n\n` +
        `**📱 Phone Usage Tracking**\n` +
        `• Monitors app usage patterns\n` +
        `• Tracks screen time before bed\n` +
        `• Detects night-time phone usage\n` +
        `• Provides usage insights\n\n` +
        `**🌙 Sleep Analysis Features**\n` +
        `• Phone usage impact on sleep quality\n` +
        `• Screen time before bed tracking\n` +
        `• Usage pattern analysis\n` +
        `• Personalized sleep recommendations\n` +
        `• Sleep pattern analysis\n\n` +
        `**🔒 Privacy & Security**\n` +
        `• All sleep data stays on your device\n` +
        `• No data is shared with third parties\n` +
        `• You control all your information\n` +
        `• Permissions can be revoked anytime\n\n` +
        `**Note:** In production builds, some features may use demo data.`,
      [
        {
          text: 'Learn More',
          onPress: () => {
            Alert.alert(
              'How to Enable Sleep Tracking',
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
                `**After Granting Permissions:**\n` +
                `• Sleep tracking will start automatically\n` +
                `• Phone usage will be monitored for analysis\n` +
                `• You'll get personalized sleep insights\n\n` +
                `**Note:** In production builds, some features may use demo data.`,
              [{ text: 'Got it!' }],
            );
          },
        },
        { text: 'Request Permissions', onPress: requestPermissions },
        { text: 'Cancel' },
      ],
    );
  };

  const handleLogSleep = async () => {
    if (!bedtime || !wakeTime) {
      Alert.alert('Error', 'Please enter both bedtime and wake time');
      return;
    }

    try {
      const bedtimeDate = new Date(bedtime);
      const wakeTimeDate = new Date(wakeTime);

      if (wakeTimeDate <= bedtimeDate) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1); // Add one day if wake time is before bedtime
      }

      const duration =
        (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60); // in minutes

      const sleepData = {
        date: new Date(),
        bedtime: bedtimeDate,
        wakeTime: wakeTimeDate,
        duration,
        quality: sleepQuality,
        deepSleepDuration: parseFloat(deepSleepHours) * 60,
        remSleepDuration: parseFloat(remSleepHours) * 60,
        awakenings: parseInt(awakenings),
        heartRate: parseInt(heartRate),
        timeToSleep: parseInt(timeToSleep),
      };

      await addSleepData(sleepData);
      setShowLogSleepModal(false);

      // Reset form
      setBedtime('');
      setWakeTime('');
      setSleepQuality('good');
      setDeepSleepHours('2');
      setRemSleepHours('1.5');
      setAwakenings('0');
      setHeartRate('60');
      setTimeToSleep('15');

      Alert.alert('Success', 'Sleep data logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log sleep data');
      console.error('Error logging sleep:', error);
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '😴';
      case 'fair':
        return '😐';
      case 'poor':
        return '😞';
      default:
        return '😴';
    }
  };

  const getSleepEfficiency = () => {
    if (!latestSleep) return 0;
    const timeInBed =
      latestSleep.duration + (latestSleep.awakenings || 0) * 0.1; // Estimate
    return Math.round((latestSleep.duration / timeInBed) * 100);
  };

  const renderSleepStages = () => {
    if (!latestSleep) return null;

    const stages = [
      {
        name: 'Deep',
        duration: latestSleep.deepSleepDuration,
        color: '#1e40af',
      },
      {
        name: 'REM',
        duration: latestSleep.remSleepDuration || 1.5 * 60, // Convert to minutes
        color: '#7c3aed',
      },
      {
        name: 'Light',
        duration:
          latestSleep.duration -
          latestSleep.deepSleepDuration -
          (latestSleep.remSleepDuration || 1.5 * 60),
        color: '#06b6d4',
      },
    ];

    const total = latestSleep.duration;

    return (
      <View style={styles.sleepStagesContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Sleep Stages
        </Text>
        <View style={styles.stagesBar}>
          {stages.map((stage, index) => (
            <View
              key={index}
              style={[
                styles.stageSegment,
                {
                  width: `${(stage.duration / total) * 100}%`,
                  backgroundColor: stage.color,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.stagesLegend}>
          {stages.map((stage, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: stage.color }]}
              />
              <Text style={[styles.legendText, isDarkMode && styles.darkText]}>
                {stage.name} {formatTime(stage.duration)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAdvancedMetrics = () => {
    if (!showAdvancedMetrics || !latestSleep) return null;

    return (
      <Animated.View
        style={[styles.advancedMetricsContainer, { opacity: fadeAnim }]}
      >
        <View style={styles.advancedMetricsHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📊 Advanced Metrics
          </Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() =>
              Alert.alert(
                'Sleep Metrics',
                'These metrics help you understand your sleep patterns and quality.',
              )
            }
          >
            <Icon name="information-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="heart-pulse" size={20} color="#ef4444" />
            <Text style={styles.metricLabel}>Resting HR</Text>
            <Text style={styles.metricValue}>
              {latestSleep.heartRate || 'N/A'} bpm
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="percent" size={20} color="#8b5cf6" />
            <Text style={styles.metricLabel}>Efficiency</Text>
            <Text style={styles.metricValue}>{getSleepEfficiency()}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="alarm" size={20} color="#f59e0b" />
            <Text style={styles.metricLabel}>Awakenings</Text>
            <Text style={styles.metricValue}>
              {latestSleep.awakenings || 0}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="clock-outline" size={20} color="#06b6d4" />
            <Text style={styles.metricLabel}>Time to Sleep</Text>
            <Text style={styles.metricValue}>
              {latestSleep.timeToSleep || 'N/A'} min
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderAdvancedChart = () => {
    const days =
      selectedPeriod === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : Array.from({ length: 30 }, (_, i) => `${i + 1}`);

    const maxHours = periodData.length > 0 ? Math.max(...periodData) : 8;
    const sleepGoal = settings?.sleepGoal || 8;

    // console.log removed

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartScrollView}
        >
          <View
            style={[
              styles.chartBars,
              { width: Math.max(width - 40, days.length * 25) },
            ]}
          >
            {periodData.map((hours, index) => {
              const height = maxHours > 0 ? (hours / maxHours) * 60 : 0;
              const isToday =
                selectedPeriod === 'week' ? index === 6 : index === 29;
              const isAboveGoal = hours >= sleepGoal;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.chartBarContainer}
                  onPress={() => {
                    Alert.alert(
                      'Sleep Details',
                      `${days[index]}: ${hours.toFixed(1)} hours`,
                    );
                  }}
                >
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height,
                        backgroundColor: isToday
                          ? '#10b981'
                          : isAboveGoal
                          ? '#4f46e5'
                          : '#f59e0b',
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{days[index]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Goal line */}
        <View
          style={[
            styles.goalLine,
            { top: 20 + (1 - sleepGoal / maxHours) * 60 },
          ]}
        />
        <Text style={styles.goalLabel}>Goal: {sleepGoal}h</Text>
      </View>
    );
  };

  const renderHealthMetrics = () => (
    <View style={styles.healthMetrics}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Health Metrics
      </Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Icon name="heart-pulse" size={20} color="#ef4444" />
          <Text style={[styles.metricLabel, isDarkMode && styles.darkText]}>
            Resting HR
          </Text>
          <Text style={[styles.metricValue, isDarkMode && styles.darkText]}>
            {latestSleep?.heartRate || 'N/A'} bpm
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Icon name="percent" size={20} color="#8b5cf6" />
          <Text style={[styles.metricLabel, isDarkMode && styles.darkText]}>
            Efficiency
          </Text>
          <Text style={[styles.metricValue, isDarkMode && styles.darkText]}>
            {getSleepEfficiency()}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Icon name="alarm" size={20} color="#f59e0b" />
          <Text style={[styles.metricLabel, isDarkMode && styles.darkText]}>
            Awakenings
          </Text>
          <Text style={[styles.metricValue, isDarkMode && styles.darkText]}>
            {latestSleep?.awakenings || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSleepScore = () => {
    if (!latestSleep) return null;

    const score = Math.round(
      latestSleep.quality === 'excellent'
        ? 95
        : latestSleep.quality === 'good'
        ? 80
        : latestSleep.quality === 'fair'
        ? 65
        : 50,
    );

    return (
      <View style={styles.sleepScoreContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Sleep Score
        </Text>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, isDarkMode && styles.darkText]}>
            {score}
          </Text>
          <Text style={[styles.scoreLabel, isDarkMode && styles.darkText]}>
            out of 100
          </Text>
        </View>
        <View style={styles.scoreFactors}>
          <View style={styles.scoreFactor}>
            <View
              style={[
                styles.scoreFactorBar,
                { width: `${(latestSleep.duration / (9 * 60)) * 100}%` },
              ]}
            />
            <Text
              style={[styles.scoreFactorLabel, isDarkMode && styles.darkText]}
            >
              Duration
            </Text>
          </View>
          <View style={styles.scoreFactor}>
            <View
              style={[
                styles.scoreFactorBar,
                { width: `${getSleepEfficiency()}%` },
              ]}
            />
            <Text
              style={[styles.scoreFactorLabel, isDarkMode && styles.darkText]}
            >
              Efficiency
            </Text>
          </View>
          <View style={styles.scoreFactor}>
            <View
              style={[
                styles.scoreFactorBar,
                {
                  width: `${Math.max(
                    0,
                    100 - (latestSleep.awakenings || 0) * 20,
                  )}%`,
                },
              ]}
            />
            <Text
              style={[styles.scoreFactorLabel, isDarkMode && styles.darkText]}
            >
              Restfulness
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPhoneUsageInsights = () => {
    if (!phoneUsageInsights || !latestSleep) return null;

    return (
      <View style={[styles.phoneUsageContainer, isDarkMode && styles.darkCard]}>
        <View style={styles.phoneUsageHeader}>
          <Icon name="cellphone" size={24} color="#10b981" />
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Phone Usage Impact
          </Text>
        </View>

        <View style={styles.phoneUsageMetrics}>
          <View style={styles.phoneUsageMetric}>
            <Icon name="lightbulb" size={16} color="#f59e0b" />
            <Text
              style={[styles.phoneUsageLabel, isDarkMode && styles.darkText]}
            >
              Blue Light Exposure
            </Text>
            <Text
              style={[styles.phoneUsageValue, isDarkMode && styles.darkText]}
            >
              {phoneUsageInsights.sleepHealth.blueLightExposure}m
            </Text>
          </View>

          <View style={styles.phoneUsageMetric}>
            <Icon name="alarm" size={16} color="#ef4444" />
            <Text
              style={[styles.phoneUsageLabel, isDarkMode && styles.darkText]}
            >
              Night Disturbances
            </Text>
            <Text
              style={[styles.phoneUsageValue, isDarkMode && styles.darkText]}
            >
              {phoneUsageInsights.sleepHealth.nightDisturbances}
            </Text>
          </View>

          <View style={styles.phoneUsageMetric}>
            <Icon name="clock" size={16} color="#8b5cf6" />
            <Text
              style={[styles.phoneUsageLabel, isDarkMode && styles.darkText]}
            >
              Pre-Bed Screen Time
            </Text>
            <Text
              style={[styles.phoneUsageValue, isDarkMode && styles.darkText]}
            >
              {phoneUsageInsights.sleepHealth.preBedScreenTime}m
            </Text>
          </View>
        </View>

        <View style={styles.phoneUsageScore}>
          <Text
            style={[styles.phoneUsageScoreLabel, isDarkMode && styles.darkText]}
          >
            Sleep Quality Score
          </Text>
          <View
            style={[
              styles.phoneUsageScoreCircle,
              {
                backgroundColor:
                  phoneUsageInsights.sleepHealth.sleepQualityScore >= 80
                    ? '#10b981'
                    : phoneUsageInsights.sleepHealth.sleepQualityScore >= 60
                    ? '#f59e0b'
                    : '#ef4444',
              },
            ]}
          >
            <Text style={styles.phoneUsageScoreText}>
              {phoneUsageInsights.sleepHealth.sleepQualityScore}
            </Text>
          </View>
        </View>

        <View style={styles.phoneUsageRecommendations}>
          <Text
            style={[styles.recommendationsTitle, isDarkMode && styles.darkText]}
          >
            Recommendations
          </Text>
          {phoneUsageInsights.sleepHealth.recommendations.map(
            (rec: string, index: number) => (
              <View key={index} style={styles.recommendation}>
                <Icon name="lightbulb" size={16} color="#f59e0b" />
                <Text
                  style={[
                    styles.recommendationText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {rec}
                </Text>
              </View>
            ),
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.content}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Loading sleep data...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.content}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Error: {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>
                Sleep Quality
              </Text>
              <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
                {latestSleep ? "Last night's rest" : 'No sleep data recorded'}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color="#4f46e5" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logSleepButton}
                onPress={() => setShowLogSleepModal(true)}
              >
                <Icon name="plus" size={20} color="#ffffff" />
                <Text style={styles.logSleepButtonText}>Log Sleep</Text>
              </TouchableOpacity>
            </View>
          </View>

          {latestSleep && (
            <>
              {/* Main Stats */}
              <View style={styles.mainStats}>
                <StatCard
                  title="Duration"
                  value={formatTime(latestSleep.duration)}
                  color="#10b981"
                  style={styles.mainStatCard}
                />
                <StatCard
                  title="Quality"
                  value={
                    latestSleep.quality.charAt(0).toUpperCase() +
                    latestSleep.quality.slice(1)
                  }
                  color={getSleepQualityColor(latestSleep.quality)}
                  style={styles.mainStatCard}
                />
              </View>

              {/* Sleep Score */}
              {renderSleepScore()}

              {/* Sleep Details */}
              <View
                style={[styles.sleepDetails, isDarkMode && styles.darkCard]}
              >
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Icon
                      name="moon-waning-crescent"
                      size={20}
                      color="#6b7280"
                    />
                    <Text
                      style={[
                        styles.detailLabel,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      Bedtime
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      {formatTimeOfDay(latestSleep.bedtime)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="weather-sunny" size={20} color="#6b7280" />
                    <Text
                      style={[
                        styles.detailLabel,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      Wake up
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      {formatTimeOfDay(latestSleep.wakeTime)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sleep Stages */}
              {renderSleepStages()}

              {/* Phone Usage Insights */}
              {renderPhoneUsageInsights()}

              {/* Health Metrics */}
              {renderHealthMetrics()}

              {/* Advanced Metrics Toggle */}
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isDarkMode && styles.darkToggleButton,
                ]}
                onPress={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              >
                <Icon
                  name={showAdvancedMetrics ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#4f46e5"
                />
                <Text style={styles.toggleText}>
                  {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
                </Text>
              </TouchableOpacity>

              {/* Advanced Metrics */}
              {renderAdvancedMetrics()}

              {/* Quality Indicator with Goal Progress */}
              <View style={styles.qualityContainer}>
                <View style={styles.qualityHeader}>
                  <Text
                    style={[styles.qualityTitle, isDarkMode && styles.darkText]}
                  >
                    Sleep Goal Progress
                  </Text>
                  <Text style={styles.qualityEmoji}>
                    {getQualityIcon(latestSleep.quality)}
                  </Text>
                </View>
                <ProgressBar
                  progress={
                    (latestSleep.duration / ((settings?.sleepGoal || 8) * 60)) *
                    100
                  }
                  height={12}
                  gradientColors={
                    latestSleep.duration >= (settings?.sleepGoal || 8) * 60
                      ? ['#10b981', '#059669']
                      : ['#f59e0b', '#d97706']
                  }
                />
                <Text
                  style={[
                    styles.goalProgressText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {(
                    (latestSleep.duration / ((settings?.sleepGoal || 8) * 60)) *
                    100
                  ).toFixed(0)}
                  % of {settings?.sleepGoal || 8}-hour goal achieved
                </Text>
              </View>

              {/* Enhanced Chart */}
              <View style={styles.weeklySection}>
                <Text
                  style={[styles.sectionTitle, isDarkMode && styles.darkText]}
                >
                  Sleep Trends
                </Text>
                <Text
                  style={[styles.averageText, isDarkMode && styles.darkText]}
                >
                  {averageSleep.toFixed(1)} hours average
                </Text>
                {renderAdvancedChart()}
              </View>

              {/* Smart Insights */}
              <LinearGradient
                colors={['#ecfdf5', '#d1fae5']}
                style={styles.streakCard}
              >
                <View style={styles.streakContent}>
                  <Icon name="brain" size={24} color="#065f46" />
                  <View style={styles.insightText}>
                    <Text style={styles.streakTitle}>Smart Insight</Text>
                    <Text style={styles.streakSubtitle}>
                      Your best sleep days are when you go to bed before 10:30
                      PM
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Enhanced Sleep Tips */}
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsTitle, isDarkMode && styles.darkText]}>
                  Personalized Tips
                </Text>
                <View style={styles.tipItem}>
                  <Icon name="lightbulb" size={16} color="#f59e0b" />
                  <Text style={[styles.tipText, isDarkMode && styles.darkText]}>
                    Try to maintain a consistent bedtime routine for better
                    sleep quality.
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="thermometer" size={16} color="#06b6d4" />
                  <Text style={[styles.tipText, isDarkMode && styles.darkText]}>
                    Optimal bedroom temperature is 60-67°F (15-19°C)
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="meditation" size={16} color="#8b5cf6" />
                  <Text style={[styles.tipText, isDarkMode && styles.darkText]}>
                    Try 5 minutes of meditation before bed to improve sleep
                    quality
                  </Text>
                </View>
              </View>
            </>
          )}

          {!latestSleep && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
                No sleep data available
              </Text>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => {
                  // Pre-fill the form with sample data for testing
                  setBedtime('10:30 PM');
                  setWakeTime('06:30 AM');
                  setSleepQuality('good');
                  setDeepSleepHours('2');
                  setRemSleepHours('1.5');
                  setAwakenings('1');
                  setHeartRate('58');
                  setTimeToSleep('15');
                  setShowLogSleepModal(true);
                }}
              >
                <Text style={styles.testButtonText}>Add Sample Sleep Data</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermissions}
              >
                <Icon name="shield-key" size={16} color="#ffffff" />
                <Text style={styles.permissionButtonText}>
                  Enable Phone Usage Tracking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={showSleepPermissionDetails}
              >
                <Icon name="information" size={16} color="#4f46e5" />
                <Text style={styles.infoButtonText}>
                  Learn about permissions
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Log Sleep Modal */}
      <Modal
        visible={showLogSleepModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogSleepModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              {editingSleepData ? 'Edit Sleep Data' : 'Log New Sleep Session'}
            </Text>
            <View style={styles.formGroup}>
              <Icon name="moon-waning-crescent" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Bedtime (e.g., 10:30 PM)"
                placeholderTextColor="#9ca3af"
                value={bedtime}
                onChangeText={setBedtime}
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="weather-sunny" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Wake Time (e.g., 06:00 AM)"
                placeholderTextColor="#9ca3af"
                value={wakeTime}
                onChangeText={setWakeTime}
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="heart-pulse" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Heart Rate (bpm)"
                placeholderTextColor="#9ca3af"
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="clock-outline" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Time to Sleep (min)"
                placeholderTextColor="#9ca3af"
                value={timeToSleep}
                onChangeText={setTimeToSleep}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="bed" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Deep Sleep (hours)"
                placeholderTextColor="#9ca3af"
                value={deepSleepHours}
                onChangeText={setDeepSleepHours}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="sleep" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="REM Sleep (hours)"
                placeholderTextColor="#9ca3af"
                value={remSleepHours}
                onChangeText={setRemSleepHours}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="alarm-light" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Awakenings"
                placeholderTextColor="#9ca3af"
                value={awakenings}
                onChangeText={setAwakenings}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Icon name="star" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Sleep Quality (excellent, good, fair, poor)"
                placeholderTextColor="#9ca3af"
                value={sleepQuality}
                onChangeText={text => {
                  if (['excellent', 'good', 'fair', 'poor'].includes(text)) {
                    setSleepQuality(
                      text as 'excellent' | 'good' | 'fair' | 'poor',
                    );
                  }
                }}
              />
            </View>
            <TouchableOpacity
              style={[styles.logButton, isDarkMode && styles.darkLogButton]}
              onPress={handleUpdateSleep}
            >
              <Text style={styles.logButtonText}>
                {editingSleepData ? 'Update Sleep' : 'Log Sleep'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLogSleepModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Select Date
            </Text>

            <View style={styles.datePickerContainer}>
              <Text
                style={[styles.datePickerLabel, isDarkMode && styles.darkText]}
              >
                Choose a date to view or edit sleep data:
              </Text>

              <View style={styles.dateButtons}>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.dateButton}
                      onPress={() => handleDateSelection(date)}
                    >
                      <Text style={styles.dateButtonText}>
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  darkText: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  logSleepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 5,
  },
  logSleepButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  debugText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 5,
  },
  testContainer: {
    backgroundColor: '#dbeafe',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  testText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 5,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  testButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  mainStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  sleepStagesContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  stagesBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
  },
  stageSegment: {
    height: '100%',
  },
  stagesLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  advancedMetricsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  advancedMetricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoButton: {
    padding: 5,
  },
  infoButtonText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#0369a1',
    marginTop: 5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
  },
  chartContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  chartHeader: {
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  chartScrollView: {
    marginHorizontal: -10,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 10,
  },
  chartBarContainer: {
    alignItems: 'center',
    minWidth: 20,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  goalLine: {
    position: 'absolute',
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: '#ef4444',
    borderStyle: 'dashed',
  },
  goalLabel: {
    position: 'absolute',
    right: 25,
    top: 15,
    fontSize: 10,
    color: '#ef4444',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 4,
  },
  healthMetrics: {
    marginBottom: 25,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  sleepScoreContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  scoreFactors: {
    width: '100%',
    marginTop: 15,
  },
  scoreFactor: {
    marginBottom: 10,
  },
  scoreFactorBar: {
    height: 6,
    backgroundColor: '#4f46e5',
    borderRadius: 3,
    marginBottom: 5,
  },
  scoreFactorLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  sleepDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkCard: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkToggleButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  toggleText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  qualityContainer: {
    marginBottom: 25,
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  qualityEmoji: {
    fontSize: 20,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  weeklySection: {
    marginBottom: 25,
  },
  averageText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15,
  },
  streakCard: {
    borderRadius: 12,
    marginBottom: 25,
  },
  streakContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  insightText: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    color: '#065f46',
    fontWeight: '600',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  tipsContainer: {
    marginBottom: 25,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  darkInput: {
    color: '#ffffff',
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  logButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  darkLogButton: {
    backgroundColor: '#6b7280',
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneUsageContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  phoneUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  phoneUsageMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  phoneUsageMetric: {
    alignItems: 'center',
  },
  phoneUsageLabel: {
    fontSize: 12,
    color: '#0369a1',
    marginTop: 5,
    marginBottom: 2,
  },
  phoneUsageValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
  },
  phoneUsageScore: {
    alignItems: 'center',
    marginBottom: 15,
  },
  phoneUsageScoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  phoneUsageScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneUsageScoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  phoneUsageRecommendations: {
    marginTop: 10,
  },
  recommendationsTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editButtonText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  dateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 5,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
});

export default SleepScreen;
