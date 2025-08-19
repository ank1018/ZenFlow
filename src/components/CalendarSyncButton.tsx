import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import GoogleCalendarService from '../services/GoogleCalendarService';
import { useTodos } from '../contexts/TodoContext';

const CalendarSyncButton: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { syncWithGoogleCalendar, refresh, todos } = useTodos();

  useEffect(() => {
    checkSignInStatus();
  }, []);

  const checkSignInStatus = async () => {
    try {
      setIsInitializing(true);
      const signedIn = await GoogleCalendarService.isSignedIn();
      setIsSignedIn(signedIn);
    } catch (error) {
      console.warn('Error checking sign-in status:', error);
      setIsSignedIn(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const success = await GoogleCalendarService.signIn();
      if (success) {
        setIsSignedIn(true);
        Alert.alert('Success', 'Successfully signed in to Google Calendar!');

        // Trigger auto-sync after successful sign-in
        setTimeout(async () => {
          try {
            console.log('🔄 Triggering sync after sign-in...');
            const calendarEvents =
              await GoogleCalendarService.syncGoogleCalendarToTodos();
            console.log(
              `📅 Fetched ${calendarEvents.length} calendar events after sign-in`,
            );

            if (calendarEvents.length > 0) {
              const syncedCount = await syncWithGoogleCalendar(calendarEvents);
              console.log(
                `✅ Post-sign-in sync complete: ${syncedCount} events synced`,
              );

              // Log the sync completion and force refresh
              console.log(
                `📊 Current todos count in CalendarSyncButton: ${todos.length}`,
              );

              // Single refresh after sign-in sync
              setTimeout(() => {
                console.log('🔄 Refreshing after sign-in sync...');
                refresh();
              }, 500);
            }
          } catch (error) {
            console.warn('Post-sign-in sync failed:', error);
          }
        }, 1000);
      } else {
        Alert.alert('Error', 'Failed to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      Alert.alert(
        'Error',
        'An error occurred during sign-in. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting manual calendar sync...');

      const calendarEvents =
        await GoogleCalendarService.syncGoogleCalendarToTodos();
      console.log(
        `📅 Fetched ${calendarEvents.length} calendar events for sync`,
      );

      if (calendarEvents.length > 0) {
        const syncedCount = await syncWithGoogleCalendar(calendarEvents);
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${syncedCount} calendar events to your todo list!`,
        );

        // Log the sync completion and force refresh
        console.log(
          `📊 Current todos count in CalendarSyncButton: ${todos.length}`,
        );

        // Force refresh to ensure TodoScreen gets updated state
        setTimeout(() => {
          console.log('🔄 Refreshing after manual sync...');
          refresh();
        }, 500);
      } else {
        Alert.alert('No Events', 'No upcoming calendar events found to sync.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync calendar events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const success = await GoogleCalendarService.signOut();
      if (success) {
        setIsSignedIn(false);
        Alert.alert('Success', 'Successfully signed out from Google Calendar.');
      } else {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert(
        'Error',
        'An error occurred during sign-out. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isSignedIn ? (
        <TouchableOpacity
          style={[styles.button, styles.signInButton]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📅</Text>
              <Text style={styles.buttonText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.syncButton]}
            onPress={handleSync}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>🔄</Text>
                <Text style={styles.buttonText}>Sync</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.buttonIcon}>🚪</Text>
            <Text style={styles.buttonText}>Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signInButton: {
    backgroundColor: '#4285F4',
  },
  syncButton: {
    backgroundColor: '#34A853',
  },
  signOutButton: {
    backgroundColor: '#EA4335',
  },
  buttonIcon: {
    fontSize: 14,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CalendarSyncButton;
