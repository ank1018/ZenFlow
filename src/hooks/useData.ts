import { useState, useEffect, useCallback } from 'react';
import DataService from '../services/DataService';
import GoogleCalendarService from '../services/GoogleCalendarService';
import {
  Todo,
  SleepData,
  TimerSession,
  UserStats,
  Reward,
  Settings,
} from '../types';



export const useSleepData = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [latestSleep, setLatestSleep] = useState<SleepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSleepData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allData, latest] = await Promise.all([
        DataService.getSleepData(),
        DataService.getLatestSleepData(),
      ]);
      setSleepData(allData);
      setLatestSleep(latest);
    } catch (err) {
      setError('Failed to load sleep data');
      console.error('Error loading sleep data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSleepData = useCallback(async (data: Omit<SleepData, 'id'>) => {
    try {
      const newData = await DataService.addSleepData(data);
      setSleepData(prev => [...prev, newData]);
      setLatestSleep(newData);
      return newData;
    } catch (err) {
      setError('Failed to add sleep data');
      console.error('Error adding sleep data:', err);
      return null;
    }
  }, []);

  const getSleepDataForPeriod = useCallback(async (days: number) => {
    try {
      return await DataService.getSleepDataForPeriod(days);
    } catch (err) {
      setError('Failed to load sleep data for period');
      console.error('Error loading sleep data for period:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  return {
    sleepData,
    latestSleep,
    loading,
    error,
    addSleepData,
    getSleepDataForPeriod,
    refresh: loadSleepData,
  };
};

export const useTimerSessions = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [todayFocusTime, setTodayFocusTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allSessions, todayTime] = await Promise.all([
        DataService.getTimerSessions(),
        DataService.getTodayFocusTime(),
      ]);
      setSessions(allSessions);
      setTodayFocusTime(todayTime);
    } catch (err) {
      setError('Failed to load timer sessions');
      console.error('Error loading timer sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSession = useCallback(async (session: Omit<TimerSession, 'id'>) => {
    try {
      const newSession = await DataService.addTimerSession(session);
      setSessions(prev => [...prev, newSession]);
      if (newSession.completed) {
        setTodayFocusTime(prev => prev + newSession.duration);
      }
      return newSession;
    } catch (err) {
      setError('Failed to add timer session');
      console.error('Error adding timer session:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    todayFocusTime,
    loading,
    error,
    addSession,
    refresh: loadSessions,
  };
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DataService.getUserStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load user stats');
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    try {
      const updatedStats = await DataService.updateUserStats(updates);
      setStats(updatedStats);
      return updatedStats;
    } catch (err) {
      setError('Failed to update user stats');
      console.error('Error updating user stats:', err);
      return null;
    }
  }, []);

  const calculateStats = useCallback(async () => {
    try {
      const calculatedStats = await DataService.calculateUserStats();
      setStats(calculatedStats);
      return calculatedStats;
    } catch (err) {
      setError('Failed to calculate user stats');
      console.error('Error calculating user stats:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    updateStats,
    calculateStats,
    refresh: loadStats,
  };
};

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DataService.getRewards();
      setRewards(data);
    } catch (err) {
      setError('Failed to load rewards');
      console.error('Error loading rewards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReward = useCallback(
    async (id: string, updates: Partial<Reward>) => {
      try {
        const updatedReward = await DataService.updateReward(id, updates);
        if (updatedReward) {
          setRewards(prev =>
            prev.map(reward => (reward.id === id ? updatedReward : reward)),
          );
        }
        return updatedReward;
      } catch (err) {
        setError('Failed to update reward');
        console.error('Error updating reward:', err);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  return {
    rewards,
    loading,
    error,
    updateReward,
    refresh: loadRewards,
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DataService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      const updatedSettings = await DataService.updateSettings(updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
  };
};
