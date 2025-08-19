export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string | Date; // Support both string (from Google) and Date
  startAt?: string | Date; // Support both string (from Google) and Date
  endAt?: string | Date; // Support both string (from Google) and Date
  createdAt: string | Date; // Support both string (from Google) and Date
  updatedAt?: string | Date; // Support both string (from Google) and Date
  completedAt?: Date;

  // Google Calendar integration
  calendarEventId?: string;
  calendarId?: string;
  isFromCalendar?: boolean;
  lastSyncedAt?: string | Date; // Support both string (from Google) and Date

  // Additional fields for better Google Calendar sync
  category?: string; // 'calendar', 'task', etc.
  source?: string; // 'google', 'manual', etc.
  location?: string; // For Google Calendar events
  attendees?: string[]; // For Google Calendar events
  allDay?: boolean; // For Google Calendar events
  recurrence?: string; // For recurring Google Calendar events

  // Additional Google Calendar specific fields
  organizer?: string; // Event organizer email
  htmlLink?: string; // Link to the event in Google Calendar
  status?: string; // 'confirmed', 'tentative', 'cancelled'
  transparency?: string; // 'opaque', 'transparent'
  visibility?: string; // 'default', 'public', 'private', 'confidential'
  colorId?: string; // Google Calendar color ID
  eventType?: string; // 'default', 'outOfOffice', 'focusTime'
}

export interface SleepData {
  id: string;
  date: Date;
  bedtime: Date;
  wakeTime: Date;
  duration: number; // in minutes
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  deepSleepDuration: number; // in minutes
  remSleepDuration?: number; // in minutes
  awakenings?: number;
  heartRate?: number; // bpm
  timeToSleep?: number; // minutes to fall asleep
}

export interface TimerSession {
  id: string;
  taskId?: string;
  taskName: string;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  type: 'focus' | 'break';
}

export interface Reward {
  id: string;
  type: 'forest' | 'city' | 'achievement';
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  level: number;
  progress: number; // 0-100
  maxProgress: number;
}

export interface UserStats {
  totalFocusTime: number; // in minutes
  totalSleepTime: number; // in minutes
  completedTasks: number;
  totalTasks: number;
  sleepStreak: number;
  focusStreak: number;
  screenTimeLimit: number; // in minutes
  currentScreenTime: number; // in minutes
  userName?: string;
}

export interface Settings {
  userName: string;
  sleepGoal: number; // hours
  focusGoal: number; // minutes
  screenTimeGoal: number; // minutes
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}
