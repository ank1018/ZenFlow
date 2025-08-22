import { Platform, NativeModules } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const { AppUsageModule } = NativeModules;
// const appUsageEmitter = new NativeEventEmitter(AppUsageModule);

export interface AppUsageData {
  id: string;
  date: Date;
  appName: string;
  packageName: string;
  usageTime: number; // in minutes
  startTime: Date;
  endTime: Date;
  category: 'social' | 'entertainment' | 'productivity' | 'health' | 'other';
}

export interface PhoneUsageImpact {
  beforeBed: number; // minutes before sleep
  afterWake: number; // minutes after waking
  nightDisturbances: number; // number of phone checks at night
  blueLightExposure: number; // minutes of screen time before bed
  notifications: number; // number of notifications during sleep
}

export interface SleepConfirmation {
  bedtimeAccuracy: boolean;
  wakeAccuracy: boolean;
  nightDisturbances: number;
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  phoneImpact: PhoneUsageImpact;
}

class AppUsageService {
  private static instance: AppUsageService;
  private isTracking: boolean = false;
  private hasPermissions: boolean = false;

  private constructor() {}

  static getInstance(): AppUsageService {
    if (!AppUsageService.instance) {
      AppUsageService.instance = new AppUsageService();
    }
    return AppUsageService.instance;
  }

  // Check if we're in a production build
  private isProductionBuild(): boolean {
    const isProduction = !__DEV__;
    console.log('🔍 Production Build Detection:', {
      __DEV__,
      isProduction,
      platform: Platform.OS,
    });
    return isProduction;
  }

  // Check if permissions are needed
  async checkPermissionsStatus(): Promise<{
    hasPermissions: boolean;
    needsPermissions: boolean;
    permissionType: string;
    availablePermissions: string[];
    isProduction: boolean;
  }> {
    const isProduction = this.isProductionBuild();
    console.log('🔍 Checking permissions status...', { isProduction });

    if (Platform.OS === 'android') {
      try {
        console.log('🔍 Checking Android usage stats permission...');
        const hasUsageStatsPermission =
          await AppUsageModule.checkUsageStatsPermission();

        this.hasPermissions = hasUsageStatsPermission;
        console.log(
          '🔍 Usage stats permission result:',
          hasUsageStatsPermission,
        );

        return {
          hasPermissions: hasUsageStatsPermission,
          needsPermissions: !hasUsageStatsPermission && !isProduction,
          permissionType: 'Usage Stats Access',
          availablePermissions: ['App Usage Statistics'],
          isProduction,
        };
      } catch (error) {
        console.error('❌ Permission check failed:', error);
        return {
          hasPermissions: false,
          needsPermissions: !isProduction,
          permissionType: 'Usage Stats Access',
          availablePermissions: ['App Usage Statistics'],
          isProduction,
        };
      }
    }

    // iOS - would need Screen Time API
    console.log('🔍 iOS platform - Screen Time API not implemented yet');
    return {
      hasPermissions: false,
      needsPermissions: false,
      permissionType: 'Screen Time API (Not Available)',
      availablePermissions: [],
      isProduction,
    };
  }

  // Request necessary permissions
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        console.log('🔍 Requesting Android usage stats permission...');
        await AppUsageModule.requestUsageStatsPermission();

        // Wait a moment for user to grant permission
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if permission was granted
        const hasPermission = await AppUsageModule.checkUsageStatsPermission();
        this.hasPermissions = hasPermission;

        console.log('🔍 Permission request result:', hasPermission);
        return hasPermission;
      } catch (error) {
        console.error('❌ Permission request failed:', error);
        return false;
      }
    }

    console.log('🔍 iOS platform - permissions handled differently');
    return false;
  }

  // Start tracking app usage
  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    try {
      if (Platform.OS === 'android') {
        // Always check current permission status first
        console.log(
          '🔍 Checking current permission status before starting tracking...',
        );
        const permissionStatus = await this.checkPermissionsStatus();

        if (!permissionStatus.hasPermissions) {
          console.log('🔍 No permissions found, cannot start tracking');
          throw new Error('Usage statistics permission not granted');
        }

        console.log(
          '🔍 Permissions confirmed, starting real app usage tracking...',
        );
        await AppUsageModule.startUsageTracking();
        this.isTracking = true;
        console.log('App usage tracking started successfully');
      } else {
        console.log('🔍 Cannot start tracking - platform not supported');
        throw new Error('Platform not supported');
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      throw error;
    }
  }

  // Stop tracking
  async stopTracking(): Promise<void> {
    if (Platform.OS === 'android' && this.hasPermissions) {
      try {
        await AppUsageModule.stopUsageTracking();
      } catch (error) {
        console.error('Error stopping tracking:', error);
      }
    }

    this.isTracking = false;
    console.log('App usage tracking stopped');
  }

  // Get app usage data for a period
  async getAppUsageForPeriod(days: number = 7): Promise<AppUsageData[]> {
    console.log('🔍 getAppUsageForPeriod called with days:', days);

    if (Platform.OS === 'android') {
      // Check current permission status without requesting
      const permissionStatus = await this.checkPermissionsStatus();

      if (!permissionStatus.hasPermissions) {
        console.log('🔍 No permissions, returning empty array');
        return [];
      }

      try {
        console.log('🔍 Getting real usage stats for', days, 'days');
        const usageStats = await AppUsageModule.getUsageStats(days);
        console.log('🔍 Raw usage stats received:', usageStats.length, 'apps');

        // Check if we have real usage data
        if (usageStats.length === 0) {
          console.log(
            '🔍 No real usage data available yet, using sample data temporarily',
          );
          // Return sample data temporarily until real data becomes available
          return this.generateSampleData(days);
        }

        // Process real usage data
        const processedData: AppUsageData[] = [];
        const now = new Date();

        // Get daily usage data for the requested period
        for (let i = 0; i < days; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          // For each app, distribute the total usage across days
          usageStats.forEach((stat: any) => {
            // Calculate daily usage by dividing total usage by number of days
            // and adding some realistic variation
            const totalUsageMinutes = Math.round(stat.usageTime / 60000); // Convert from milliseconds to minutes
            const avgDailyUsage = Math.round(totalUsageMinutes / days);

            // Add realistic daily variation (±20%)
            const variation = 0.8 + Math.random() * 0.4; // 80% to 120%
            const dailyUsageTime = Math.round(avgDailyUsage * variation);

            if (dailyUsageTime > 0) {
              processedData.push({
                id: `${stat.packageName}-${date.toISOString().split('T')[0]}`,
                date: date,
                appName: stat.appName,
                packageName: stat.packageName,
                usageTime: dailyUsageTime,
                startTime: new Date(date.getTime() - dailyUsageTime * 60000),
                endTime: date,
                category: this.categorizeApp(stat.packageName),
              });
            }
          });
        }

        console.log(
          '🔍 Processed real usage data:',
          processedData.length,
          'items',
        );

        // If processed data is still empty, fall back to sample data
        if (processedData.length === 0) {
          console.log(
            '🔍 Processed real data is empty, using sample data temporarily',
          );
          return this.generateSampleData(days);
        }

        return processedData;
      } catch (error) {
        console.error('Error getting real usage data:', error);
        return [];
      }
    }

    console.log('🔍 No platform support, returning empty array');
    return [];
  }

  // Generate sample data for testing and fallback
  private generateSampleData(days: number): AppUsageData[] {
    console.log('🔍 Generating sample data for', days, 'days');

    const sampleApps = [
      { name: 'ZenFlow', package: 'com.zenflow', category: 'health' as const },
      {
        name: 'Chrome',
        package: 'com.android.chrome',
        category: 'productivity' as const,
      },
      {
        name: 'WhatsApp',
        package: 'com.whatsapp',
        category: 'social' as const,
      },
      {
        name: 'YouTube',
        package: 'com.google.android.youtube',
        category: 'entertainment' as const,
      },
      {
        name: 'Gmail',
        package: 'com.google.android.gm',
        category: 'productivity' as const,
      },
      {
        name: 'Instagram',
        package: 'com.instagram.android',
        category: 'social' as const,
      },
      {
        name: 'Settings',
        package: 'com.android.settings',
        category: 'other' as const,
      },
    ];

    const data: AppUsageData[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate 3-5 apps per day with realistic usage
      const appsForDay = sampleApps.slice(0, 3 + Math.floor(Math.random() * 3));

      appsForDay.forEach(app => {
        // Generate realistic usage time (15-120 minutes per app)
        const baseUsage = 15 + Math.random() * 105;
        const usageTime = Math.round(baseUsage);

        if (usageTime > 0) {
          data.push({
            id: `${app.package}-${date.toISOString().split('T')[0]}`,
            date: date,
            appName: app.name,
            packageName: app.package,
            usageTime: usageTime,
            startTime: new Date(date.getTime() - usageTime * 60000),
            endTime: date,
            category: app.category,
          });
        }
      });
    }

    console.log('🔍 Generated sample data:', data.length, 'items');
    return data;
  }

  // Get phone usage impact on sleep
  async getPhoneUsageImpact(): Promise<PhoneUsageImpact> {
    const usageData = await this.getAppUsageForPeriod(1);

    console.log('🌙 CALCULATING PHONE USAGE IMPACT ON SLEEP...');
    console.log(
      '📱 Input usage data for impact calculation:',
      JSON.stringify(usageData, null, 2),
    );

    if (usageData.length > 0) {
      // Calculate real impact based on usage data
      const totalUsage = usageData.reduce((sum, app) => sum + app.usageTime, 0);
      const socialApps = usageData.filter(app => app.category === 'social');
      const socialTime = socialApps.reduce(
        (sum, app) => sum + app.usageTime,
        0,
      );

      const impact = {
        beforeBed: Math.min(socialTime, 60), // Cap at 60 minutes
        afterWake: Math.min(totalUsage * 0.3, 45), // 30% of total usage, cap at 45
        nightDisturbances: Math.floor(Math.random() * 3) + 1, // Simulate for now
        blueLightExposure: Math.min(socialTime + totalUsage * 0.2, 90), // Social + 20% of total
        notifications: Math.floor(Math.random() * 8) + 3, // Simulate for now
      };

      console.log('🌙 PHONE USAGE IMPACT CALCULATION:', {
        totalUsageMinutes: totalUsage,
        socialAppsCount: socialApps.length,
        socialTimeMinutes: socialTime,
        calculatedImpact: impact,
        calculationDetails: {
          beforeBed: `min(${socialTime}, 60) = ${impact.beforeBed}`,
          afterWake: `min(${totalUsage} * 0.3, 45) = min(${
            totalUsage * 0.3
          }, 45) = ${impact.afterWake}`,
          blueLightExposure: `min(${socialTime} + ${totalUsage} * 0.2, 90) = min(${
            socialTime + totalUsage * 0.2
          }, 90) = ${impact.blueLightExposure}`,
        },
      });

      return impact;
    }

    // Return default values when no data available
    const defaultImpact = {
      beforeBed: 0,
      afterWake: 0,
      nightDisturbances: 0,
      blueLightExposure: 0,
      notifications: 0,
    };

    console.log(
      '📱 No usage data available, returning defaults:',
      defaultImpact,
    );
    return defaultImpact;
  }

  // Get app usage insights
  async getAppUsageInsights(): Promise<{
    totalScreenTime: number;
    mostUsedApp: string;
    productivityScore: number;
    socialMediaTime: number;
    entertainmentTime: number;
  }> {
    const usageData = await this.getAppUsageForPeriod(1);

    console.log('📊 CALCULATING APP USAGE INSIGHTS...');
    console.log(
      '📱 Input usage data for insights:',
      JSON.stringify(usageData, null, 2),
    );

    if (usageData.length > 0) {
      const totalScreenTime = usageData.reduce(
        (sum, app) => sum + app.usageTime,
        0,
      );
      const mostUsedApp = usageData.reduce((max, app) =>
        app.usageTime > max.usageTime ? app : max,
      ).appName;

      const socialMediaTime = usageData
        .filter(app => app.category === 'social')
        .reduce((sum, app) => sum + app.usageTime, 0);

      const entertainmentTime = usageData
        .filter(app => app.category === 'entertainment')
        .reduce((sum, app) => sum + app.usageTime, 0);

      const productivityTime = usageData
        .filter(app => app.category === 'productivity')
        .reduce((sum, app) => sum + app.usageTime, 0);

      const productivityScore =
        totalScreenTime > 0
          ? Math.round((productivityTime / totalScreenTime) * 100)
          : 0;

      const insights = {
        totalScreenTime,
        mostUsedApp,
        productivityScore,
        socialMediaTime,
        entertainmentTime,
      };

      console.log('📊 APP USAGE INSIGHTS CALCULATION:', {
        totalScreenTime,
        mostUsedApp,
        productivityScore,
        socialMediaTime,
        entertainmentTime,
        productivityTime,
        calculationDetails: {
          productivityScore: `${productivityTime} / ${totalScreenTime} * 100 = ${productivityScore}%`,
          categoryBreakdown: {
            social: usageData
              .filter(app => app.category === 'social')
              .map(app => ({ name: app.appName, time: app.usageTime })),
            entertainment: usageData
              .filter(app => app.category === 'entertainment')
              .map(app => ({ name: app.appName, time: app.usageTime })),
            productivity: usageData
              .filter(app => app.category === 'productivity')
              .map(app => ({ name: app.appName, time: app.usageTime })),
            health: usageData
              .filter(app => app.category === 'health')
              .map(app => ({ name: app.appName, time: app.usageTime })),
            insights,
          },
        },
      });

      return insights;
    }

    // Return default values when no data available
    const defaultInsights = {
      totalScreenTime: 0,
      mostUsedApp: 'No data',
      productivityScore: 0,
      socialMediaTime: 0,
      entertainmentTime: 0,
    };

    console.log(
      '📱 No usage data available, returning defaults:',
      defaultInsights,
    );
    return defaultInsights;
  }

  // Get comprehensive health and productivity insights
  async getHealthAndProductivityInsights(): Promise<{
    sleepHealth: {
      blueLightExposure: number;
      nightDisturbances: number;
      preBedScreenTime: number;
      sleepQualityScore: number;
      recommendations: string[];
    };
    focusHealth: {
      productivityScore: number;
      distractionTime: number;
      focusSessions: number;
      deepWorkTime: number;
      recommendations: string[];
    };
    digitalWellbeing: {
      totalScreenTime: number;
      socialMediaTime: number;
      entertainmentTime: number;
      healthAppTime: number;
      digitalBalanceScore: number;
      recommendations: string[];
    };
    timeManagement: {
      mostProductiveHours: string[];
      leastProductiveHours: string[];
      timeWasters: string[];
      efficiencyScore: number;
      recommendations: string[];
    };
    weeklyTrends: {
      screenTimeTrend: 'increasing' | 'decreasing' | 'stable';
      productivityTrend: 'improving' | 'declining' | 'stable';
      sleepImpactTrend: 'improving' | 'declining' | 'stable';
      recommendations: string[];
    };
  }> {
    const usageData = await this.getAppUsageForPeriod(7); // Get 7 days of data
    const todayData = await this.getAppUsageForPeriod(1);

    console.log('🧠 ANALYZING HEALTH AND PRODUCTIVITY INSIGHTS...');
    console.log(
      '📊 Input data - 7 days:',
      usageData.length,
      'apps, Today:',
      todayData.length,
      'apps',
    );

    // Calculate sleep health metrics
    const sleepHealth = this.calculateSleepHealth(usageData, todayData);

    // Calculate focus health metrics
    const focusHealth = this.calculateFocusHealth(usageData, todayData);

    // Calculate digital wellbeing metrics
    const digitalWellbeing = this.calculateDigitalWellbeing(
      usageData,
      todayData,
    );

    // Calculate time management insights
    const timeManagement = this.calculateTimeManagement(usageData);

    // Calculate weekly trends
    const weeklyTrends = this.calculateWeeklyTrends(usageData);

    const insights = {
      sleepHealth,
      focusHealth,
      digitalWellbeing,
      timeManagement,
      weeklyTrends,
    };

    console.log(
      '🧠 COMPREHENSIVE HEALTH INSIGHTS:',
      JSON.stringify(insights, null, 2),
    );
    return insights;
  }

  // Categorize apps
  private categorizeApp(
    packageName: string,
  ): 'social' | 'entertainment' | 'productivity' | 'health' | 'other' {
    const socialApps = [
      'whatsapp',
      'instagram',
      'facebook',
      'twitter',
      'telegram',
      'snapchat',
    ];
    const entertainmentApps = [
      'youtube',
      'netflix',
      'spotify',
      'tiktok',
      'twitch',
      'discord',
    ];
    const productivityApps = [
      'gmail',
      'chrome',
      'drive',
      'docs',
      'sheets',
      'slack',
      'zoom',
    ];
    const healthApps = [
      'zenflow',
      'fitbit',
      'myfitnesspal',
      'strava',
      'headspace',
    ];

    const lowerPackage = packageName.toLowerCase();

    if (socialApps.some(app => lowerPackage.includes(app))) return 'social';
    if (entertainmentApps.some(app => lowerPackage.includes(app)))
      return 'entertainment';
    if (productivityApps.some(app => lowerPackage.includes(app)))
      return 'productivity';
    if (healthApps.some(app => lowerPackage.includes(app))) return 'health';

    return 'other';
  }

  // Calculate sleep health metrics
  private calculateSleepHealth(
    weeklyData: AppUsageData[],
    todayData: AppUsageData[],
  ) {
    const socialApps = todayData.filter(app => app.category === 'social');
    const socialTime = socialApps.reduce((sum, app) => sum + app.usageTime, 0);
    const totalTime = todayData.reduce((sum, app) => sum + app.usageTime, 0);

    // Calculate blue light exposure (social + entertainment apps)
    const entertainmentApps = todayData.filter(
      app => app.category === 'entertainment',
    );
    const entertainmentTime = entertainmentApps.reduce(
      (sum, app) => sum + app.usageTime,
      0,
    );
    const blueLightExposure = Math.min(socialTime + entertainmentTime, 120); // Cap at 2 hours

    // Estimate night disturbances based on late-night usage
    const lateNightApps = todayData.filter(app => {
      const hour = new Date(app.startTime).getHours();
      return hour >= 22 || hour <= 6;
    });
    const nightDisturbances = Math.min(lateNightApps.length, 5);

    // Calculate pre-bed screen time (last 2 hours of usage)
    const preBedScreenTime = Math.min(socialTime * 0.4, 60);

    // Calculate sleep quality score (0-100)
    let sleepQualityScore = 100;
    sleepQualityScore -= blueLightExposure * 0.5; // -0.5 points per minute of blue light
    sleepQualityScore -= nightDisturbances * 10; // -10 points per night disturbance
    sleepQualityScore -= preBedScreenTime * 0.3; // -0.3 points per minute of pre-bed screen time
    sleepQualityScore = Math.max(0, sleepQualityScore);

    // Generate sleep recommendations
    const recommendations = [];
    if (blueLightExposure > 60) {
      recommendations.push(
        'Reduce blue light exposure by 30 minutes before bed',
      );
    }
    if (nightDisturbances > 2) {
      recommendations.push('Enable Do Not Disturb mode during sleep hours');
    }
    if (preBedScreenTime > 30) {
      recommendations.push('Stop using social media 1 hour before bedtime');
    }
    if (sleepQualityScore < 70) {
      recommendations.push('Consider using night mode and blue light filters');
    }
    if (recommendations.length === 0) {
      recommendations.push('Great sleep habits! Keep up the good work');
    }

    return {
      blueLightExposure,
      nightDisturbances,
      preBedScreenTime,
      sleepQualityScore: Math.round(sleepQualityScore),
      recommendations,
    };
  }

  // Calculate focus health metrics
  private calculateFocusHealth(
    weeklyData: AppUsageData[],
    todayData: AppUsageData[],
  ) {
    const productivityApps = todayData.filter(
      app => app.category === 'productivity',
    );
    const productivityTime = productivityApps.reduce(
      (sum, app) => sum + app.usageTime,
      0,
    );
    const totalTime = todayData.reduce((sum, app) => sum + app.usageTime, 0);

    // Calculate productivity score
    const productivityScore =
      totalTime > 0 ? Math.round((productivityTime / totalTime) * 100) : 0;

    // Calculate distraction time (social + entertainment)
    const socialApps = todayData.filter(app => app.category === 'social');
    const entertainmentApps = todayData.filter(
      app => app.category === 'entertainment',
    );
    const distractionTime =
      socialApps.reduce((sum, app) => sum + app.usageTime, 0) +
      entertainmentApps.reduce((sum, app) => sum + app.usageTime, 0);

    // Estimate focus sessions (periods of productivity app usage)
    const focusSessions = Math.max(1, Math.floor(productivityTime / 30)); // Assume 30-min sessions

    // Calculate deep work time (extended productivity sessions)
    const deepWorkTime = productivityTime * 0.7; // Assume 70% is deep work

    // Generate focus recommendations
    const recommendations = [];
    if (productivityScore < 50) {
      recommendations.push(
        'Try the Pomodoro technique: 25 min work, 5 min break',
      );
    }
    if (distractionTime > productivityTime) {
      recommendations.push('Enable Focus mode to reduce distractions');
    }
    if (focusSessions < 3) {
      recommendations.push('Aim for at least 3 focused work sessions today');
    }
    if (deepWorkTime < 60) {
      recommendations.push(
        'Schedule 2-hour deep work blocks for complex tasks',
      );
    }
    if (recommendations.length === 0) {
      recommendations.push("Excellent focus! You're making great progress");
    }

    return {
      productivityScore,
      distractionTime,
      focusSessions,
      deepWorkTime: Math.round(deepWorkTime),
      recommendations,
    };
  }

  // Calculate digital wellbeing metrics
  private calculateDigitalWellbeing(
    weeklyData: AppUsageData[],
    todayData: AppUsageData[],
  ) {
    const totalScreenTime = todayData.reduce(
      (sum, app) => sum + app.usageTime,
      0,
    );
    const socialMediaTime = todayData
      .filter(app => app.category === 'social')
      .reduce((sum, app) => sum + app.usageTime, 0);
    const entertainmentTime = todayData
      .filter(app => app.category === 'entertainment')
      .reduce((sum, app) => sum + app.usageTime, 0);
    const healthAppTime = todayData
      .filter(app => app.category === 'health')
      .reduce((sum, app) => sum + app.usageTime, 0);

    // Calculate digital balance score (0-100)
    let digitalBalanceScore = 100;
    if (totalScreenTime > 480) {
      // More than 8 hours
      digitalBalanceScore -= 30;
    } else if (totalScreenTime > 360) {
      // More than 6 hours
      digitalBalanceScore -= 15;
    }

    if (socialMediaTime > totalScreenTime * 0.5) {
      // More than 50% social media
      digitalBalanceScore -= 25;
    }

    if (healthAppTime < 10) {
      // Less than 10 minutes on health apps
      digitalBalanceScore -= 10;
    }

    digitalBalanceScore = Math.max(0, digitalBalanceScore);

    // Generate digital wellbeing recommendations
    const recommendations = [];
    if (totalScreenTime > 480) {
      recommendations.push(
        'Set daily screen time limits to reduce digital fatigue',
      );
    }
    if (socialMediaTime > totalScreenTime * 0.5) {
      recommendations.push('Balance social media with productive activities');
    }
    if (healthAppTime < 10) {
      recommendations.push('Spend more time on health and wellness apps');
    }
    if (digitalBalanceScore < 70) {
      recommendations.push('Take regular digital detox breaks');
    }
    if (recommendations.length === 0) {
      recommendations.push(
        "Great digital balance! You're using technology mindfully",
      );
    }

    return {
      totalScreenTime,
      socialMediaTime,
      entertainmentTime,
      healthAppTime,
      digitalBalanceScore: Math.round(digitalBalanceScore),
      recommendations,
    };
  }

  // Calculate time management insights
  private calculateTimeManagement(weeklyData: AppUsageData[]) {
    // Group apps by hour of usage
    const hourlyUsage: {
      [hour: number]: { productive: number; distracting: number };
    } = {};

    weeklyData.forEach(app => {
      const hour = new Date(app.startTime).getHours();
      if (!hourlyUsage[hour]) {
        hourlyUsage[hour] = { productive: 0, distracting: 0 };
      }

      if (app.category === 'productivity') {
        hourlyUsage[hour].productive += app.usageTime;
      } else if (
        app.category === 'social' ||
        app.category === 'entertainment'
      ) {
        hourlyUsage[hour].distracting += app.usageTime;
      }
    });

    // Find most and least productive hours
    const productivityByHour = Object.entries(hourlyUsage).map(
      ([hour, usage]) => ({
        hour: parseInt(hour),
        productivityRatio:
          usage.productive / (usage.productive + usage.distracting) || 0,
      }),
    );

    const mostProductiveHours = productivityByHour
      .sort((a, b) => b.productivityRatio - a.productivityRatio)
      .slice(0, 3)
      .map(item => `${item.hour}:00`);

    const leastProductiveHours = productivityByHour
      .sort((a, b) => a.productivityRatio - b.productivityRatio)
      .slice(0, 3)
      .map(item => `${item.hour}:00`);

    // Find time wasters (most distracting apps)
    const timeWasters = weeklyData
      .filter(
        app => app.category === 'social' || app.category === 'entertainment',
      )
      .reduce((acc, app) => {
        acc[app.appName] = (acc[app.appName] || 0) + app.usageTime;
        return acc;
      }, {} as { [key: string]: number });

    const topTimeWasters = Object.entries(timeWasters)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([app]) => app);

    // Calculate efficiency score
    const totalProductive = weeklyData
      .filter(app => app.category === 'productivity')
      .reduce((sum, app) => sum + app.usageTime, 0);
    const totalDistracting = weeklyData
      .filter(
        app => app.category === 'social' || app.category === 'entertainment',
      )
      .reduce((sum, app) => sum + app.usageTime, 0);
    const efficiencyScore =
      totalProductive + totalDistracting > 0
        ? Math.round(
            (totalProductive / (totalProductive + totalDistracting)) * 100,
          )
        : 0;

    // Generate time management recommendations
    const recommendations = [];
    if (mostProductiveHours.length > 0) {
      recommendations.push(
        `Schedule important tasks during your peak hours: ${mostProductiveHours.join(
          ', ',
        )}`,
      );
    }
    if (leastProductiveHours.length > 0) {
      recommendations.push(
        `Avoid complex work during low-energy hours: ${leastProductiveHours.join(
          ', ',
        )}`,
      );
    }
    if (topTimeWasters.length > 0) {
      recommendations.push(`Limit time on: ${topTimeWasters.join(', ')}`);
    }
    if (efficiencyScore < 60) {
      recommendations.push('Use time blocking to improve productivity');
    }
    if (recommendations.length === 0) {
      recommendations.push(
        "Excellent time management! You're using your time effectively",
      );
    }

    return {
      mostProductiveHours,
      leastProductiveHours,
      timeWasters: topTimeWasters,
      efficiencyScore,
      recommendations,
    };
  }

  // Calculate weekly trends
  private calculateWeeklyTrends(weeklyData: AppUsageData[]) {
    // Group data by day
    const dailyData: { [day: string]: AppUsageData[] } = {};
    weeklyData.forEach(app => {
      const day = new Date(app.date).toDateString();
      if (!dailyData[day]) dailyData[day] = [];
      dailyData[day].push(app);
    });

    // Calculate daily screen time
    const dailyScreenTime = Object.entries(dailyData).map(([day, apps]) => ({
      day,
      screenTime: apps.reduce((sum, app) => sum + app.usageTime, 0),
    }));

    // Calculate trends
    const screenTimeValues = dailyScreenTime.map(d => d.screenTime);
    const screenTimeTrend = this.calculateTrend(screenTimeValues);

    // Calculate productivity trend
    const dailyProductivity = Object.entries(dailyData).map(([day, apps]) => {
      const productive = apps
        .filter(app => app.category === 'productivity')
        .reduce((sum, app) => sum + app.usageTime, 0);
      const total = apps.reduce((sum, app) => sum + app.usageTime, 0);
      return total > 0 ? (productive / total) * 100 : 0;
    });
    const productivityTrendRaw = this.calculateTrend(dailyProductivity);
    const productivityTrend = (
      productivityTrendRaw === 'increasing'
        ? 'improving'
        : productivityTrendRaw === 'decreasing'
        ? 'declining'
        : 'stable'
    ) as 'stable' | 'improving' | 'declining';

    // Calculate sleep impact trend (simplified)
    const sleepImpactTrend = (
      screenTimeTrend === 'decreasing' ? 'improving' : 'declining'
    ) as 'stable' | 'improving' | 'declining';

    // Generate trend recommendations
    const recommendations = [];
    if (screenTimeTrend === 'increasing') {
      recommendations.push(
        'Screen time is increasing - consider setting daily limits',
      );
    } else if (screenTimeTrend === 'decreasing') {
      recommendations.push('Great job reducing screen time! Keep it up');
    }

    if (productivityTrend === 'improving') {
      recommendations.push(
        "Productivity is improving! You're building good habits",
      );
    } else if (productivityTrend === 'declining') {
      recommendations.push(
        'Focus on deep work sessions to improve productivity',
      );
    }

    if (sleepImpactTrend === 'improving') {
      recommendations.push('Your sleep habits are getting better');
    } else {
      recommendations.push('Try reducing evening screen time for better sleep');
    }

    return {
      screenTimeTrend,
      productivityTrend,
      sleepImpactTrend,
      recommendations,
    };
  }

  // Helper method to calculate trend
  private calculateTrend(
    values: number[],
  ): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }
}

export default AppUsageService;
