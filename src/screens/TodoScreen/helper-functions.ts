// Helper functions

import { Todo } from '../../types';
import { formatDate, formatTimeOfDay } from '../../utils/helpers';
import { MINUTE_HEIGHT } from './TodoScreen.style';

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'high':
      return 'flag';
    case 'medium':
      return 'flag-outline';
    case 'low':
      return 'flag-variant-outline';
    default:
      return 'flag-outline';
  }
}

export function getFilterIcon(filter: string) {
  switch (filter) {
    case 'all':
      return 'format-list-bulleted';
    case 'today':
      return 'calendar-today';
    case 'high':
      return 'flag';
    default:
      return 'format-list-bulleted';
  }
}

export function getTaskTimeInfo(todo: Todo): string {
  if (startOf(todo) && endOf(todo)) {
    const start = startOf(todo)!;
    const end = endOf(todo)!;
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // If same day, show date and time
    if (isSameDay(start, end)) {
      return `${startDate} • ${formatTimeOfDay(start)} — ${formatTimeOfDay(
        end,
      )}`;
    }
    // If different days, show date and time
    return `${startDate} ${formatTimeOfDay(
      start,
    )} — ${endDate} ${formatTimeOfDay(end)}`;
  }

  if (todo.dueDate) {
    const dueDate =
      typeof todo.dueDate === 'string' ? new Date(todo.dueDate) : todo.dueDate;
    return `Due: ${formatDate(dueDate)} ${formatTimeOfDay(dueDate)}`;
  }

  return `${
    todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)
  } Priority`;
}

// Existing helper functions (keeping original logic)
export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function humanDate(d: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return d.toLocaleDateString(undefined, opts);
}

export function formatHour(h: number) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${ampm}`;
}

export function minutesFromMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

export function withTime(date: Date, timeLike: Date) {
  const d = new Date(date);
  d.setHours(timeLike.getHours(), timeLike.getMinutes(), 0, 0);
  return d;
}

export function startOf(t: Todo): Date | undefined {
  if ((t as any).startAt) {
    return typeof (t as any).startAt === 'string'
      ? new Date((t as any).startAt)
      : (t as any).startAt;
  }

  if (t.dueDate) {
    const dueDate =
      typeof t.dueDate === 'string' ? new Date(t.dueDate) : t.dueDate;
    if (t.source === 'google' && t.startAt) {
      return typeof t.startAt === 'string' ? new Date(t.startAt) : t.startAt;
    }
    return new Date(dueDate.getTime() - 30 * 60 * 1000);
  }

  return undefined;
}

export function endOf(t: Todo): Date | undefined {
  if ((t as any).endAt) {
    return typeof (t as any).endAt === 'string'
      ? new Date((t as any).endAt)
      : (t as any).endAt;
  }

  if (t.dueDate) {
    return typeof t.dueDate === 'string' ? new Date(t.dueDate) : t.dueDate;
  }

  return undefined;
}

export function todosForDate(list: Todo[], date: Date) {
  return list.filter(t => {
    const s = startOf(t);
    const e = endOf(t);

    // If no start or end time, skip this todo
    if (!s && !e) {
      return false;
    }

    // For Google Calendar events, check if the event spans the selected date
    if (t.source === 'google' && s && e) {
      const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const endDay = new Date(e.getFullYear(), e.getMonth(), e.getDate());
      const selectedDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      const isInRange = startDay <= selectedDay && endDay >= selectedDay;

      // Check if the event overlaps with the selected date
      return isInRange;
    }

    // For regular todos, check if they fall on the selected date
    if (s && e) {
      const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const endDay = new Date(e.getFullYear(), e.getMonth(), e.getDate());
      const selectedDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      return startDay <= selectedDay && endDay >= selectedDay;
    }

    // Fallback: check if due date matches
    if (t.dueDate) {
      const dueDate =
        typeof t.dueDate === 'string' ? new Date(t.dueDate) : t.dueDate;
      return isSameDay(dueDate, date);
    }

    return false;
  });
}

// Sort todos by start time, then by due date, then by priority
export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const aStart = startOf(a);
    const bStart = startOf(b);

    // First sort by start time
    if (aStart && bStart) {
      return aStart.getTime() - bStart.getTime();
    }

    // If one has start time and other doesn't, prioritize the one with start time
    if (aStart && !bStart) return -1;
    if (!aStart && bStart) return 1;

    // Then sort by due date
    if (a.dueDate && b.dueDate) {
      const aDue =
        typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate;
      const bDue =
        typeof b.dueDate === 'string' ? new Date(b.dueDate) : b.dueDate;
      return aDue.getTime() - bDue.getTime();
    }

    // Finally sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function blockPosition(t: Todo) {
  const s = startOf(t)!;
  const e = endOf(t)!;
  const startMin = clamp(minutesFromMidnight(s), 0, 24 * 60);
  const endMin = clamp(minutesFromMidnight(e), 0, 24 * 60);
  const top = startMin * MINUTE_HEIGHT;
  const height = Math.max((endMin - startMin) * MINUTE_HEIGHT, 34);

  // For overlapping tasks, we'll use the full width for now
  // In a more advanced implementation, we could calculate overlapping and adjust width
  return { top, height };
}
