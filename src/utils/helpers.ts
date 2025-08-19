import { Todo, SleepData, TimerSession, UserStats } from '../types';

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatTimeShort = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins}m`;
};

export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    // Show date in a more readable format
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
};

export const formatTimeOfDay = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getPriorityColor = (priority: Todo['priority']): string => {
  switch (priority) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

export const getSleepQualityColor = (quality: string) => {
  switch (quality) {
    case 'excellent':
      return '#10b981';
    case 'good':
      return '#059669';
    case 'fair':
      return '#f59e0b';
    case 'poor':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

/**
 * Convert any date format (string or Date) to a Date object
 */
export const toDate = (date: string | Date | undefined): Date | undefined => {
  if (!date) return undefined;
  return typeof date === 'string' ? new Date(date) : date;
};

/**
 * Convert any date format to ISO string
 */
export const toISOString = (
  date: string | Date | undefined,
): string | undefined => {
  if (!date) return undefined;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Check if a todo is from Google Calendar
 */
export const isGoogleCalendarEvent = (todo: any): boolean => {
  return todo.source === 'google' || todo.isFromCalendar === true;
};

/**
 * Get display text for Google Calendar event
 */
export const getGoogleCalendarDisplayText = (todo: any): string => {
  const parts = [];

  if (todo.location) {
    parts.push(`📍 ${todo.location}`);
  }

  if (todo.attendees && todo.attendees.length > 0) {
    parts.push(
      `👥 ${todo.attendees.length} attendee${
        todo.attendees.length > 1 ? 's' : ''
      }`,
    );
  }

  if (todo.allDay) {
    parts.push('📅 All day');
  }

  return parts.join(' • ');
};
