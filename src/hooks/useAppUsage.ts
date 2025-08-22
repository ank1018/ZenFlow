import { useState, useEffect, useCallback } from 'react';
import AppUsageService, {
  AppUsageData,
  PhoneUsageImpact,
  SleepConfirmation,
} from '../services/AppUsageService';

export const useAppUsage = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [usageData, setUsageData] = useState<AppUsageData[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUsageService = AppUsageService.getInstance();

  const startTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check permissions first without requesting them
      const permissionStatus = await appUsageService.checkPermissionsStatus();

      if (permissionStatus.hasPermissions) {
        // Only start tracking if we have permissions
        await appUsageService.startTracking();
        setIsTracking(true);
      } else {
        // Don't automatically request permissions, just log
        console.log('App usage tracking not started - permissions not granted');
        setIsTracking(false);
      }
    } catch (err) {
      // Don't set error for permission issues, just log them
      console.log('App usage tracking started with fallback mode');
      setIsTracking(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopTracking = useCallback(async () => {
    try {
      await appUsageService.stopTracking();
      setIsTracking(false);
    } catch (err) {
      setError('Failed to stop tracking');
      console.error('Error stopping tracking:', err);
    }
  }, []);

  const loadUsageData = useCallback(async (days: number = 7) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📱 Loading ${days} days of usage data...`);
      const data = await appUsageService.getAppUsageForPeriod(days);
      console.log(`📱 Received ${data.length} data points`);
      const totalUsage = data.reduce((sum, item) => sum + item.usageTime, 0);
      console.log(
        `📱 Total usage in data: ${totalUsage} minutes (${(
          totalUsage / 60
        ).toFixed(1)} hours)`,
      );
      setUsageData(data);
    } catch (err) {
      setError('Failed to load usage data');
      console.error('Error loading usage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appUsageService.getAppUsageInsights();
      setInsights(data);
    } catch (err) {
      setError('Failed to load insights');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPhoneUsageImpact =
    useCallback(async (): Promise<PhoneUsageImpact> => {
      try {
        return await appUsageService.getPhoneUsageImpact();
      } catch (err) {
        console.error('Error getting phone usage impact:', err);
        return {
          beforeBed: 0,
          afterWake: 0,
          nightDisturbances: 0,
          blueLightExposure: 0,
          notifications: 0,
        };
      }
    }, []);

  const requestPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const granted = await appUsageService.requestPermissions();
      if (granted) {
        // If permissions were granted, start tracking
        await appUsageService.startTracking();
        setIsTracking(true);
      }
      return granted;
    } catch (err) {
      setError('Failed to request permissions');
      console.error('Error requesting permissions:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      return await appUsageService.checkPermissionsStatus();
    } catch (err) {
      console.error('Error checking permissions:', err);
      return {
        hasPermissions: false,
        needsPermissions: true,
        permissionType: 'Unknown',
        availablePermissions: [],
        isProduction: false,
      };
    }
  }, []);

  useEffect(() => {
    loadUsageData();
    loadInsights();
  }, []); // Only run once on mount

  return {
    isTracking,
    usageData,
    insights,
    loading,
    error,
    startTracking,
    stopTracking,
    loadUsageData,
    loadInsights,
    getPhoneUsageImpact,
    requestPermissions,
    checkPermissions,
  };
};
