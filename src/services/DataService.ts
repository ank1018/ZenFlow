import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Todo,
  SleepData,
  TimerSession,
  UserStats,
  Reward,
  Settings,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  TODOS: 'focuslife_todos',
  SLEEP_DATA: 'focuslife_sleep_data',
  TIMER_SESSIONS: 'focuslife_timer_sessions',
  USER_STATS: 'focuslife_user_stats',
  REWARDS: 'focuslife_rewards',
  SETTINGS: 'focuslife_settings',
};

// Default data for first-time users
const DEFAULT_DATA = {
  todos: [],
  sleepData: [],
  timerSessions: [],
  userStats: {
    totalFocusTime: 0,
    totalSleepTime: 0,
    completedTasks: 0,
    totalTasks: 0,
    sleepStreak: 0,
    focusStreak: 0,
    screenTimeLimit: 240, // 4 hours
    currentScreenTime: 0,
  },
  rewards: [
    {
      id: 'forest_1',
      type: 'forest' as const,
      title: 'First Tree',
      description: 'Plant your first tree by completing a good sleep day',
      unlocked: false,
      level: 1,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'city_1',
      type: 'city' as const,
      title: 'First Building',
      description: 'Build your first structure by completing a focus session',
      unlocked: false,
      level: 1,
      progress: 0,
      maxProgress: 1,
    },
  ],
  settings: {
    userName: 'User',
    sleepGoal: 8, // hours
    focusGoal: 240, // minutes
    screenTimeGoal: 240, // minutes
    notifications: true,
    theme: 'auto' as const,
  },
};

class DataService {
  // Generic storage methods
  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  // Todo methods
  async getTodos(): Promise<Todo[]> {
    return this.getItem(STORAGE_KEYS.TODOS, DEFAULT_DATA.todos);
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TODOS, todos);
  }

  async addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    const todos = await this.getTodos();
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    todos.push(newTodo);
    await this.saveTodos(todos);
    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const todos = await this.getTodos();
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return null;

    todos[index] = { ...todos[index], ...updates };
    await this.saveTodos(todos);
    return todos[index];
  }

  async deleteTodo(id: string): Promise<boolean> {
    const todos = await this.getTodos();
    const filteredTodos = todos.filter(todo => todo.id !== id);
    await this.saveTodos(filteredTodos);
    return filteredTodos.length !== todos.length;
  }

  // Sleep data methods
  async getSleepData(): Promise<SleepData[]> {
    return this.getItem(STORAGE_KEYS.SLEEP_DATA, DEFAULT_DATA.sleepData);
  }

  async saveSleepData(sleepData: SleepData[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.SLEEP_DATA, sleepData);
  }

  async addSleepData(sleepData: Omit<SleepData, 'id'>): Promise<SleepData> {
    const allSleepData = await this.getSleepData();
    const newSleepData: SleepData = {
      ...sleepData,
      id: Date.now().toString(),
    };
    allSleepData.push(newSleepData);
    await this.saveSleepData(allSleepData);
    return newSleepData;
  }

  async getLatestSleepData(): Promise<SleepData | null> {
    const sleepData = await this.getSleepData();
    return sleepData.length > 0 ? sleepData[sleepData.length - 1] : null;
  }

  async getSleepDataForPeriod(days: number): Promise<SleepData[]> {
    const sleepData = await this.getSleepData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return sleepData.filter(data => new Date(data.date) >= cutoffDate);
  }

  // Timer session methods
  async getTimerSessions(): Promise<TimerSession[]> {
    return this.getItem(
      STORAGE_KEYS.TIMER_SESSIONS,
      DEFAULT_DATA.timerSessions,
    );
  }

  async saveTimerSessions(sessions: TimerSession[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TIMER_SESSIONS, sessions);
  }

  async addTimerSession(
    session: Omit<TimerSession, 'id'>,
  ): Promise<TimerSession> {
    const sessions = await this.getTimerSessions();
    const newSession: TimerSession = {
      ...session,
      id: Date.now().toString(),
    };
    sessions.push(newSession);
    await this.saveTimerSessions(sessions);
    return newSession;
  }

  async getTodayFocusTime(): Promise<number> {
    const sessions = await this.getTimerSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions
      .filter(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime() && session.completed;
      })
      .reduce((total, session) => total + session.duration, 0);
  }

  // User stats methods
  async getUserStats(): Promise<UserStats> {
    return this.getItem(STORAGE_KEYS.USER_STATS, DEFAULT_DATA.userStats);
  }

  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    const stats = await this.getUserStats();
    const updatedStats = { ...stats, ...updates };
    await this.setItem(STORAGE_KEYS.USER_STATS, updatedStats);
    return updatedStats;
  }

  async calculateUserStats(): Promise<UserStats> {
    const [todos, sleepData, timerSessions] = await Promise.all([
      this.getTodos(),
      this.getSleepData(),
      this.getTimerSessions(),
    ]);

    const completedTasks = todos.filter(todo => todo.completed).length;
    const totalTasks = todos.length;
    const totalFocusTime = timerSessions
      .filter(session => session.completed)
      .reduce((total, session) => total + session.duration, 0);

    const totalSleepTime = sleepData.reduce(
      (total, data) => total + data.duration,
      0,
    );

    // Calculate streaks
    const sleepStreak = this.calculateSleepStreak(sleepData);
    const focusStreak = this.calculateFocusStreak(timerSessions);

    // Calculate current screen time (this would be updated by phone usage tracking)
    const currentScreenTime = 0; // This will be updated by AppUsageService

    const stats: UserStats = {
      totalFocusTime,
      totalSleepTime,
      completedTasks,
      totalTasks,
      sleepStreak,
      focusStreak,
      screenTimeLimit: 240,
      currentScreenTime,
    };

    await this.updateUserStats(stats);
    return stats;
  }

  private calculateSleepStreak(sleepData: SleepData[]): number {
    if (sleepData.length === 0) return 0;

    const sortedData = sleepData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedData.length; i++) {
      const dataDate = new Date(sortedData[i].date);
      dataDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        dataDate.getTime() === expectedDate.getTime() &&
        sortedData[i].duration >= 7 * 60
      ) {
        // 7 hours minimum
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateFocusStreak(timerSessions: TimerSession[]): number {
    if (timerSessions.length === 0) return 0;

    const sortedSessions = timerSessions
      .filter(session => session.completed)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Rewards methods
  async getRewards(): Promise<Reward[]> {
    return this.getItem(STORAGE_KEYS.REWARDS, DEFAULT_DATA.rewards);
  }

  async updateReward(
    id: string,
    updates: Partial<Reward>,
  ): Promise<Reward | null> {
    const rewards = await this.getRewards();
    const index = rewards.findIndex(reward => reward.id === id);
    if (index === -1) return null;

    rewards[index] = { ...rewards[index], ...updates };
    await this.setItem(STORAGE_KEYS.REWARDS, rewards);
    return rewards[index];
  }

  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.getItem(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings);
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const settings = await this.getSettings();
    const updatedSettings = { ...settings, ...updates };
    await this.setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  async exportData(): Promise<string> {
    try {
      const data = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      await AsyncStorage.multiSet(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default new DataService();
