import { AppUsageData } from './AppUsageService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface WellnessInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  actionText?: string;
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
  priority: number;
}

export interface WellnessStats {
  currentStreak: number;
  bestStreak: number;
  todayProgress: number;
  totalAchievements: number;
  unlockedAchievements: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

class WellnessService {
  private static instance: WellnessService;
  private achievements: Achievement[] = [];
  private insights: WellnessInsight[] = [];
  private stats: WellnessStats = {
    currentStreak: 0,
    bestStreak: 0,
    todayProgress: 0,
    totalAchievements: 0,
    unlockedAchievements: 0,
    weeklyGoal: 0,
    weeklyProgress: 0,
  };

  private constructor() {
    this.initializeAchievements();
  }

  static getInstance(): WellnessService {
    if (!WellnessService.instance) {
      WellnessService.instance = new WellnessService();
    }
    return WellnessService.instance;
  }

  private initializeAchievements() {
    this.achievements = [
      {
        id: 'first_day',
        title: 'First Steps',
        description: 'Complete your first day of mindful usage tracking',
        icon: 'walk',
        color: '#10B981',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain mindful usage for 7 consecutive days',
        icon: 'calendar-week',
        color: '#3B82F6',
        progress: 0,
        maxProgress: 7,
        unlocked: false,
      },
      {
        id: 'low_usage',
        title: 'Digital Minimalist',
        description: 'Keep daily screen time under 4 hours for a week',
        icon: 'cellphone-off',
        color: '#8B5CF6',
        progress: 0,
        maxProgress: 7,
        unlocked: false,
      },
      {
        id: 'productivity',
        title: 'Productivity Master',
        description: 'Spend 80% of screen time on productive apps',
        icon: 'briefcase',
        color: '#F59E0B',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
      },
      {
        id: 'night_mode',
        title: 'Night Owl',
        description: 'Reduce evening phone usage for 5 days',
        icon: 'moon-waning-crescent',
        color: '#6366F1',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
      },
      //   {
      //     id: 'focus_time',
      //     title: 'Focus Champion',
      //     description: 'Complete 10 focused work sessions',
      //     icon: 'target',
      //     color: '#EF4444',
      //     progress: 0,
      //     maxProgress: 10,
      //     unlocked: false,
      //   },
    ];
  }

  async updateStats(usageData: AppUsageData[]): Promise<WellnessStats> {
    console.log('🎯 WellnessService.updateStats called with:', {
      usageDataLength: usageData.length,
      sampleData: usageData.slice(0, 2),
    });

    const today = new Date().toISOString().split('T')[0];
    const todayData = usageData.filter(
      item => new Date(item.date).toISOString().split('T')[0] === today,
    );

    console.log('📅 Today data:', {
      today,
      todayDataLength: todayData.length,
      todayData: todayData.slice(0, 2),
    });

    // Calculate today's progress
    const totalUsage = todayData.reduce((sum, item) => sum + item.usageTime, 0);
    const healthyUsage = todayData
      .filter(item => this.isHealthyApp(item.appName))
      .reduce((sum, item) => sum + item.usageTime, 0);

    this.stats.todayProgress =
      totalUsage > 0 ? Math.round((healthyUsage / totalUsage) * 100) : 0;

    console.log('📊 Usage calculation:', {
      totalUsage,
      healthyUsage,
      todayProgress: this.stats.todayProgress,
    });

    // Calculate streak
    this.calculateStreak(usageData);

    // Update achievements
    await this.updateAchievements(usageData);

    // Calculate weekly progress
    this.calculateWeeklyProgress(usageData);

    console.log('🏆 Final stats:', this.stats);

    return this.stats;
  }

  private calculateStreak(usageData: AppUsageData[]) {
    if (usageData.length === 0) {
      this.stats.currentStreak = 0;
      return;
    }

    // Get unique dates and sort them in descending order (most recent first)
    const dates = [
      ...new Set(
        usageData.map(item => new Date(item.date).toISOString().split('T')[0]),
      ),
    ]
      .sort()
      .reverse();

    console.log('📅 Calculating streak for dates:', dates);

    let currentStreak = 0;
    let bestStreak = this.stats.bestStreak;
    const today = new Date().toISOString().split('T')[0];

    // Check if we have data for today
    const hasTodayData = dates.includes(today);
    console.log('📅 Has today data:', hasTodayData, 'Today:', today);

    for (const date of dates) {
      const dayData = usageData.filter(
        item => new Date(item.date).toISOString().split('T')[0] === date,
      );

      const totalUsage = dayData.reduce((sum, item) => sum + item.usageTime, 0);
      const healthyUsage = dayData
        .filter(item => this.isHealthyApp(item.appName))
        .reduce((sum, item) => sum + item.usageTime, 0);

      const wellnessScore =
        totalUsage > 0 ? (healthyUsage / totalUsage) * 100 : 0;

      console.log(
        `📊 Date: ${date}, Total: ${totalUsage}min, Healthy: ${healthyUsage}min, Score: ${wellnessScore.toFixed(
          1,
        )}%`,
      );

      // For streak calculation, we need at least some usage data
      if (totalUsage > 0) {
        if (wellnessScore >= 60) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
          console.log(`✅ Streak continues: ${currentStreak} days`);
        } else {
          console.log(
            `❌ Streak broken: Score ${wellnessScore.toFixed(1)}% < 60%`,
          );
          break;
        }
      } else {
        console.log(
          `⚠️ No usage data for ${date}, skipping streak calculation`,
        );
        // Don't break streak for days with no data, just skip
        continue;
      }
    }

    // If we don't have today's data, don't count today in the streak
    if (!hasTodayData && currentStreak > 0) {
      console.log('⚠️ No today data, not counting today in streak');
    }

    this.stats.currentStreak = currentStreak;
    this.stats.bestStreak = bestStreak;

    console.log(
      `🏆 Final streak: Current=${currentStreak}, Best=${bestStreak}`,
    );
  }

  private async updateAchievements(usageData: AppUsageData[]) {
    if (usageData.length === 0) return;

    const dates = [
      ...new Set(
        usageData.map(item => new Date(item.date).toISOString().split('T')[0]),
      ),
    ].sort();

    console.log('🏆 Updating achievements for dates:', dates);

    // First day achievement
    const firstDayAchievement = this.achievements.find(
      a => a.id === 'first_day',
    );
    if (
      firstDayAchievement &&
      !firstDayAchievement.unlocked &&
      dates.length >= 1
    ) {
      firstDayAchievement.progress = 1;
      firstDayAchievement.unlocked = true;
      firstDayAchievement.unlockedDate = new Date().toLocaleDateString();
      console.log('🏆 Unlocked: First Steps');
    }

    // Week streak achievement
    const weekStreakAchievement = this.achievements.find(
      a => a.id === 'week_streak',
    );
    if (weekStreakAchievement) {
      weekStreakAchievement.progress = Math.min(this.stats.currentStreak, 7);
      if (
        weekStreakAchievement.progress >= 7 &&
        !weekStreakAchievement.unlocked
      ) {
        weekStreakAchievement.unlocked = true;
        weekStreakAchievement.unlockedDate = new Date().toLocaleDateString();
        console.log('🏆 Unlocked: Week Warrior');
      }
    }

    // Low usage achievement - check last 7 days
    const lowUsageAchievement = this.achievements.find(
      a => a.id === 'low_usage',
    );
    if (lowUsageAchievement) {
      const last7Days = dates.slice(-7); // Get last 7 days
      const lowUsageDays = last7Days.filter(date => {
        const dayData = usageData.filter(
          item => new Date(item.date).toISOString().split('T')[0] === date,
        );
        const totalUsage = dayData.reduce(
          (sum, item) => sum + item.usageTime,
          0,
        );
        const isLowUsage = totalUsage <= 240; // 4 hours in minutes
        console.log(
          `📱 ${date}: ${totalUsage}min (${(totalUsage / 60).toFixed(
            1,
          )}h) - Low usage: ${isLowUsage}`,
        );
        return isLowUsage;
      }).length;

      lowUsageAchievement.progress = Math.min(lowUsageDays, 7);
      if (lowUsageAchievement.progress >= 7 && !lowUsageAchievement.unlocked) {
        lowUsageAchievement.unlocked = true;
        lowUsageAchievement.unlockedDate = new Date().toLocaleDateString();
        console.log('🏆 Unlocked: Digital Minimalist');
      }
    }

    // Productivity achievement - check if 80% of time is on productive apps
    const productivityAchievement = this.achievements.find(
      a => a.id === 'productivity',
    );
    if (productivityAchievement) {
      const productiveDays = dates.filter(date => {
        const dayData = usageData.filter(
          item => new Date(item.date).toISOString().split('T')[0] === date,
        );
        const totalUsage = dayData.reduce(
          (sum, item) => sum + item.usageTime,
          0,
        );
        const productiveUsage = dayData
          .filter(item => this.isProductiveApp(item.appName))
          .reduce((sum, item) => sum + item.usageTime, 0);

        const productivityScore =
          totalUsage > 0 ? (productiveUsage / totalUsage) * 100 : 0;
        const isProductive = productivityScore >= 80;
        console.log(
          `💼 ${date}: ${productivityScore.toFixed(
            1,
          )}% productive - Achievement: ${isProductive}`,
        );
        return isProductive;
      }).length;

      productivityAchievement.progress = Math.min(productiveDays, 5);
      if (
        productivityAchievement.progress >= 5 &&
        !productivityAchievement.unlocked
      ) {
        productivityAchievement.unlocked = true;
        productivityAchievement.unlockedDate = new Date().toLocaleDateString();
        console.log('🏆 Unlocked: Productivity Master');
      }
    }

    // Update achievement counts
    this.stats.totalAchievements = this.achievements.length;
    this.stats.unlockedAchievements = this.achievements.filter(
      a => a.unlocked,
    ).length;

    console.log(
      `🏆 Achievement progress: ${this.stats.unlockedAchievements}/${this.stats.totalAchievements} unlocked`,
    );
  }

  private calculateWeeklyProgress(usageData: AppUsageData[]) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyData = usageData.filter(item => new Date(item.date) >= weekAgo);

    const totalWeeklyUsage = weeklyData.reduce(
      (sum, item) => sum + item.usageTime,
      0,
    );
    const healthyWeeklyUsage = weeklyData
      .filter(item => this.isHealthyApp(item.appName))
      .reduce((sum, item) => sum + item.usageTime, 0);

    this.stats.weeklyProgress =
      totalWeeklyUsage > 0
        ? Math.round((healthyWeeklyUsage / totalWeeklyUsage) * 100)
        : 0;
    this.stats.weeklyGoal = 80; // 80% healthy usage goal
  }

  private isHealthyApp(appName: string): boolean {
    const healthyApps = [
      'ZenFlow',
      'Settings',
      'Google Play services',
      'Permission controller',
      'Settings Suggestions',
    ];

    const unhealthyApps = [
      'Instagram',
      'Facebook',
      'TikTok',
      'YouTube',
      'Twitter',
      'Snapchat',
      'Reddit',
    ];

    if (
      healthyApps.some(app => appName.toLowerCase().includes(app.toLowerCase()))
    ) {
      return true;
    }

    if (
      unhealthyApps.some(app =>
        appName.toLowerCase().includes(app.toLowerCase()),
      )
    ) {
      return false;
    }

    // Default to healthy for unknown apps
    return true;
  }

  private isProductiveApp(appName: string): boolean {
    const productiveApps = [
      'ZenFlow',
      'Gmail',
      'Calendar',
      'Drive',
      'Docs',
      'Sheets',
      'Slides',
      'Meet',
      'Zoom',
      'Teams',
      'Slack',
      'Notion',
      'Trello',
      'Asana',
      'Todoist',
      'Evernote',
      'OneNote',
      'Microsoft Word',
      'Microsoft Excel',
      'Microsoft PowerPoint',
      'Outlook',
      'Chrome',
      'Safari',
      'Firefox',
      'Edge',
    ];

    return productiveApps.some(app =>
      appName.toLowerCase().includes(app.toLowerCase()),
    );
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  async generateInsights(
    usageData: AppUsageData[],
  ): Promise<WellnessInsight[]> {
    const insights: WellnessInsight[] = [];
    const today = new Date().toISOString().split('T')[0];
    const todayData = usageData.filter(
      item => new Date(item.date).toISOString().split('T')[0] === today,
    );

    const totalUsage = todayData.reduce((sum, item) => sum + item.usageTime, 0);
    const healthyUsage = todayData
      .filter(item => this.isHealthyApp(item.appName))
      .reduce((sum, item) => sum + item.usageTime, 0);

    const wellnessScore =
      totalUsage > 0 ? (healthyUsage / totalUsage) * 100 : 0;

    // High usage warning
    if (totalUsage > 480) {
      // 8 hours
      insights.push({
        id: 'high_usage_warning',
        title: 'High Screen Time Alert',
        description:
          "You've been on your phone for over 8 hours today. Consider taking a break to reduce eye strain.",
        icon: 'eye-off',
        color: '#F59E0B',
        type: 'warning',
        actionText: 'Get Tips',
        priority: 1,
      });
    }

    // Good progress achievement
    if (wellnessScore >= 80) {
      insights.push({
        id: 'good_progress',
        title: 'Excellent Progress!',
        description:
          "You're maintaining a healthy balance with your digital usage today. Keep up the great work!",
        icon: 'star',
        color: '#10B981',
        type: 'achievement',
        actionText: 'View Details',
        priority: 2,
      });
    }

    // Streak milestone
    if (this.stats.currentStreak >= 3) {
      insights.push({
        id: 'streak_milestone',
        title: 'Streak Milestone!',
        description: `You've maintained mindful usage for ${this.stats.currentStreak} days in a row!`,
        icon: 'fire',
        color: '#EF4444',
        type: 'achievement',
        actionText: 'Celebrate',
        priority: 3,
      });
    }

    // Productivity tip
    if (wellnessScore < 60) {
      insights.push({
        id: 'productivity_tip',
        title: 'Boost Your Productivity',
        description:
          'Try using productivity apps and limit social media to improve your digital wellness.',
        icon: 'trending-up',
        color: '#3B82F6',
        type: 'suggestion',
        actionText: 'View Tips',
        priority: 4,
      });
    }

    // Evening usage tip
    const eveningData = todayData.filter(item => {
      const hour = new Date(item.date).getHours();
      return hour >= 18 || hour <= 6; // Evening/night hours
    });

    if (eveningData.length > 0) {
      const eveningUsage = eveningData.reduce(
        (sum, item) => sum + item.usageTime,
        0,
      );
      if (eveningUsage > 120) {
        // 2 hours in evening
        insights.push({
          id: 'evening_usage_tip',
          title: 'Evening Digital Detox',
          description:
            'Consider reducing phone usage in the evening to improve sleep quality.',
          icon: 'moon-waning-crescent',
          color: '#6366F1',
          type: 'tip',
          actionText: 'Learn More',
          priority: 5,
        });
      }
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }

  getStats(): WellnessStats {
    return this.stats;
  }
}

export default WellnessService;
