import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import DataService from '../services/DataService';
import NotificationService from '../services/NotificationService';
import { Todo } from '../types';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => Promise<Todo | null>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  syncWithGoogleCalendar: (syncedTodos: Todo[]) => Promise<number>;
  createCalendarEvent: (
    todo: Omit<Todo, 'id' | 'createdAt'>,
  ) => Promise<Todo | null>;
  updateCalendarEvent: (
    id: string,
    updates: Partial<Todo>,
  ) => Promise<Todo | null>;
  deleteCalendarEvent: (id: string) => Promise<boolean>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DataService.getTodos();

      setTodos(data);
    } catch (err) {
      setError('Failed to load todos');
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    try {
      const newTodo = await DataService.addTodo(todo);
      setTodos(prev => [...prev, newTodo]);

      // Schedule notifications for the new task
      if (newTodo && newTodo.startAt) {
        await NotificationService.scheduleTaskNotifications(newTodo);
      }

      return newTodo;
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
      return null;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await DataService.updateTodo(id, updates);
      if (updatedTodo) {
        setTodos(prev =>
          prev.map(todo => (todo.id === id ? updatedTodo : todo)),
        );

        // Update notifications for the modified task
        await NotificationService.updateTaskNotifications(updatedTodo);
      }
      return updatedTodo;
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
      return null;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const success = await DataService.deleteTodo(id);
      if (success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));

        // Remove notifications for the deleted task
        NotificationService.removeTaskNotifications(id);
      }
      return success;
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadTodos();
  }, [loadTodos]);

  const syncWithGoogleCalendar = useCallback(async (syncedTodos: Todo[]) => {
    try {
      setLoading(true);
      setError(null);

      if (!syncedTodos || syncedTodos.length === 0) {
        return 0;
      }

      // Get current todos from storage to ensure we have the latest data
      const currentTodos = await DataService.getTodos();

      // Create a map of existing calendar todos by calendarEventId
      const existingCalendarTodosMap = new Map();
      currentTodos
        .filter(t => t.isFromCalendar && t.calendarEventId)
        .forEach(t => existingCalendarTodosMap.set(t.calendarEventId, t));

      let addedCount = 0;
      let updatedCount = 0;

      // Process each synced todo
      for (const syncedTodo of syncedTodos) {
        if (syncedTodo.isFromCalendar && syncedTodo.calendarEventId) {
          const existingTodo = existingCalendarTodosMap.get(
            syncedTodo.calendarEventId,
          );

          if (existingTodo) {
            // Update existing todo if it has changed
            const updatedTodo = await DataService.updateTodo(
              existingTodo.id,
              syncedTodo,
            );
            if (updatedTodo) {
              updatedCount++;
            }
          } else {
            // Add new todo
            const newTodo = await DataService.addTodo(syncedTodo);
            if (newTodo) {
              addedCount++;
            }
          }
        }
      }

      // Reload all todos from storage to ensure we have the latest state
      const reloadedTodos = await DataService.getTodos();

      setTodos(reloadedTodos);

      // Schedule notifications for all tasks with start times
      const tasksWithStartTimes = reloadedTodos.filter(todo => todo.startAt);
      if (tasksWithStartTimes.length > 0) {
        // Log Google Calendar tasks specifically
        const calendarTasks = tasksWithStartTimes.filter(
          todo => todo.isFromCalendar,
        );
        if (calendarTasks.length > 0) {
        }

        await NotificationService.scheduleMultipleTaskNotifications(
          tasksWithStartTimes,
        );
      }

      return addedCount + updatedCount;
    } catch (err) {
      setError('Failed to sync with Google Calendar');
      console.error('Error syncing with Google Calendar:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCalendarEvent = useCallback(
    async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
      try {
        const newTodo = await DataService.addTodo(todo);
        setTodos(prev => [...prev, newTodo]);
        return newTodo;
      } catch (err) {
        setError('Failed to create calendar event');
        console.error('Error creating calendar event:', err);
        return null;
      }
    },
    [],
  );

  const updateCalendarEvent = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      try {
        const updatedTodo = await DataService.updateTodo(id, updates);
        if (updatedTodo) {
          setTodos(prev =>
            prev.map(todo => (todo.id === id ? updatedTodo : todo)),
          );
        }
        return updatedTodo;
      } catch (err) {
        setError('Failed to update calendar event');
        console.error('Error updating calendar event:', err);
        return null;
      }
    },
    [],
  );

  const deleteCalendarEvent = useCallback(async (id: string) => {
    try {
      const success = await DataService.deleteTodo(id);
      if (success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      }
      return success;
    } catch (err) {
      setError('Failed to delete calendar event');
      console.error('Error deleting calendar event:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Schedule notifications for all tasks when todos are loaded
  useEffect(() => {
    if (todos.length > 0 && !loading) {
      const tasksWithStartTimes = todos.filter(todo => todo.startAt);
      if (tasksWithStartTimes.length > 0) {
        NotificationService.scheduleMultipleTaskNotifications(
          tasksWithStartTimes,
        );
      }
    }
  }, [todos, loading]);

  const value: TodoContextType = {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    refresh,
    syncWithGoogleCalendar,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
