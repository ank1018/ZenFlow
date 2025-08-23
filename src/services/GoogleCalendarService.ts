import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import RNCalendarEvents from 'react-native-calendar-events';
import { Todo } from '../types';

// Native module availability checks
const hasCalendarNative = !!NativeModules.RNCalendarEvents;
const hasGoogleSigninNative = !!NativeModules.RNGoogleSignin;

class GoogleCalendarService {
  private isInitialized = false;
  private googleSignInAvailable = false;
  private accessToken: string | null = null;

  async initialize() {
    if (this.isInitialized) return;

    // console.log removed
    console.log('📱 Native modules check:', {
      hasCalendarNative,
      hasGoogleSigninNative,
    });

    // ---- Calendar module presence
    if (!hasCalendarNative) {
      console.warn(
        '⚠️ RNCalendarEvents native module missing. Rebuild the app.',
      );
    } else {
      // Request permission via the lib if available
      try {
        const requestLib =
          (RNCalendarEvents as any).requestPermissions ||
          (RNCalendarEvents as any).requestPermission ||
          (RNCalendarEvents as any).authorizeEventStore;

        if (typeof requestLib === 'function') {
          const res = await requestLib();
          const status = typeof res === 'string' ? res : res?.status;
          if (status !== 'authorized') {
            console.warn('⚠️ Calendar permission not granted');
          } else {
            // console.log removed
          }
        }

        // Android runtime fallback
        if (Platform.OS === 'android') {
          try {
            const results = await PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
              PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
            ]);
            const readOk =
              results[PermissionsAndroid.PERMISSIONS.READ_CALENDAR] ===
              PermissionsAndroid.RESULTS.GRANTED;
            const writeOk =
              results[PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR] ===
              PermissionsAndroid.RESULTS.GRANTED;
            console.log('📅 Android calendar permissions:', {
              readOk,
              writeOk,
            });
          } catch (permError) {
            console.warn('⚠️ Android permission request failed:', permError);
          }
        }
      } catch (e) {
        console.warn('⚠️ Calendar permission request failed:', e);
      }
    }

    // ---- Google Sign-In presence
    try {
      if (
        hasGoogleSigninNative &&
        typeof GoogleSignin.configure === 'function'
      ) {
        const config: any = {
          webClientId:
            '305494671825-kfp0kt28g5pa8m821lf5oo3ef5a64l6u.apps.googleusercontent.com',
          offlineAccess: true,
          scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
        };

        // Add iOS client ID if available (to prevent the error)
        if (Platform.OS === 'ios') {
          config.iosClientId =
            '305494671825-kfp0kt28g5pa8m821lf5oo3ef5a64l6u.apps.googleusercontent.com';
        }

        GoogleSignin.configure(config);
        this.googleSignInAvailable = true;
        // console.log removed
      } else {
        this.googleSignInAvailable = false;
        console.warn(
          '⚠️ RNGoogleSignin native module missing. Rebuild + google-services.',
        );
      }
    } catch (e) {
      this.googleSignInAvailable = false;
      console.warn('⚠️ Google Sign-In configure failed:', e);
    }

    this.isInitialized = true;
    // console.log removed
  }

  async isSignedIn() {
    await this.initialize();
    if (!this.googleSignInAvailable) {
      console.warn('⚠️ Google Sign-In not available');
      return false;
    }

    try {
      const user = await GoogleSignin.getCurrentUser?.();
      if (user && GoogleSignin.getTokens) {
        const tokens = await GoogleSignin.getTokens();
        this.accessToken = tokens.accessToken;
      }
      return !!user;
    } catch (e) {
      console.warn('⚠️ Error checking sign-in status:', e);
      return false;
    }
  }

  async signIn() {
    await this.initialize();
    if (!this.googleSignInAvailable) {
      console.warn('⚠️ Google Sign-In not available');
      return false;
    }

    try {
      const user = await GoogleSignin.signIn?.();
      if (user && GoogleSignin.getTokens) {
        const tokens = await GoogleSignin.getTokens();
        this.accessToken = tokens.accessToken;
        // console.log removed
      } else {
        // console.log removed
      }
      return !!user;
    } catch (e) {
      console.warn('⚠️ Sign-in error:', e);
      // If it's an iOS client ID error, we can still proceed on Android
      if (
        Platform.OS === 'android' &&
        (e as any)?.message?.includes('iosClientId')
      ) {
        // console.log removed
        return true;
      }
      return false;
    }
  }

  async signOut() {
    await this.initialize();
    if (!this.googleSignInAvailable) {
      console.warn('⚠️ Google Sign-In not available');
      return false;
    }

    try {
      await GoogleSignin.signOut?.();
      this.accessToken = null;
      // console.log removed
      return true;
    } catch (e) {
      console.warn('⚠️ Sign-out error:', e);
      return false;
    }
  }

  async getGoogleCalendarEvents() {
    await this.initialize();
    if (!this.googleSignInAvailable) {
      console.warn('⚠️ Google Sign-In not available');
      return [];
    }

    // Ensure we have a valid access token
    if (!this.accessToken) {
      try {
        const user = await GoogleSignin.getCurrentUser?.();
        if (user && GoogleSignin.getTokens) {
          const tokens = await GoogleSignin.getTokens();
          this.accessToken = tokens.accessToken;
          // console.log removed
        } else {
          console.warn('⚠️ No access token available');
          return [];
        }
      } catch (error) {
        console.warn('⚠️ Failed to refresh access token:', error);
        return [];
      }
    }

    try {
      // Get events from 7 days ago to 30 days in the future
      const timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - 7);

      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 30);

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
          'timeMin=' +
          timeMin.toISOString() +
          '&timeMax=' +
          timeMax.toISOString() +
          '&maxResults=100&singleEvents=true&orderBy=startTime',
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        `📅 Fetched ${data.items?.length || 0} Google Calendar events`,
      );
      return data.items || [];
    } catch (e) {
      console.warn('⚠️ Error fetching Google Calendar events:', e);
      return [];
    }
  }

  async syncGoogleCalendarToTodos() {
    await this.initialize();
    if (!this.googleSignInAvailable) {
      console.warn('⚠️ Google Sign-In not available');
      return [];
    }

    try {
      const events = await this.getGoogleCalendarEvents();
      // console.log removed

      return events.map((event: any) => {
        // Parse start and end times
        const startTime = event.start?.dateTime || event.start?.date;
        const endTime = event.end?.dateTime || event.end?.date;

        // Convert to proper Date objects for the app
        const startDate = startTime ? new Date(startTime) : new Date();
        const endDate = endTime
          ? new Date(endTime)
          : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

        // Determine if it's an all-day event
        const isAllDay = !event.start?.dateTime && event.start?.date;

        // Extract attendees
        const attendees = event.attendees?.map((a: any) => a.email) || [];

        // Extract organizer
        const organizer = event.organizer?.email || '';

        return {
          id: `google_${event.id}`,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: endDate.toISOString(), // Use end time as due date
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          priority: 'medium',
          category: 'calendar',
          source: 'google',
          calendarEventId: event.id,
          isFromCalendar: true,
          lastSyncedAt: new Date().toISOString(),
          location: event.location || '',
          attendees: attendees,
          allDay: isAllDay,
          recurrence: event.recurrence?.[0] || '',
          organizer: organizer,
          htmlLink: event.htmlLink || '',
          status: event.status || 'confirmed',
          transparency: event.transparency || 'opaque',
          visibility: event.visibility || 'default',
          colorId: event.colorId || '',
          eventType: event.eventType || 'default',
        };
      });
    } catch (error) {
      console.error('❌ Error syncing Google Calendar to todos:', error);
      return [];
    }
  }

  async getCalendarEvents() {
    await this.initialize();
    if (
      !hasCalendarNative ||
      typeof RNCalendarEvents.findCalendars !== 'function'
    ) {
      console.warn('⚠️ Calendar native module not available');
      return [];
    }

    try {
      const calendars = await RNCalendarEvents.findCalendars();
      const events = [];

      for (const calendar of calendars) {
        const calendarEvents = await RNCalendarEvents.fetchAllEvents(
          new Date().toISOString(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          [calendar.id],
        );
        events.push(...calendarEvents);
      }

      return events;
    } catch (e) {
      console.warn('⚠️ Error fetching calendar events:', e);
      return [];
    }
  }

  async createCalendarEvent(event: any) {
    await this.initialize();
    if (
      !hasCalendarNative ||
      typeof RNCalendarEvents.saveEvent !== 'function'
    ) {
      console.warn('⚠️ Calendar native module not available');
      return null;
    }

    try {
      return await RNCalendarEvents.saveEvent(event.title, {
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        location: event.location,
      });
    } catch (e) {
      console.warn('⚠️ Error creating calendar event:', e);
      return null;
    }
  }

  async updateCalendarEvent(eventId: string, event: any) {
    await this.initialize();
    if (
      !hasCalendarNative ||
      typeof RNCalendarEvents.saveEvent !== 'function'
    ) {
      console.warn('⚠️ Calendar native module not available');
      return null;
    }

    try {
      return await RNCalendarEvents.saveEvent(event.title, {
        id: eventId,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        location: event.location,
      });
    } catch (e) {
      console.warn('⚠️ Error updating calendar event:', e);
      return null;
    }
  }

  async deleteCalendarEvent(eventId: string) {
    await this.initialize();
    if (
      !hasCalendarNative ||
      typeof RNCalendarEvents.removeEvent !== 'function'
    ) {
      console.warn('⚠️ Calendar native module not available');
      return false;
    }

    try {
      await RNCalendarEvents.removeEvent(eventId);
      return true;
    } catch (e) {
      console.warn('⚠️ Error deleting calendar event:', e);
      return false;
    }
  }
}

export default new GoogleCalendarService();
