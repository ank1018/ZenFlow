import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { formatTime, formatTimeShort } from '../utils/helpers';
import { useTimerSessions } from '../hooks/useData';
import { useTodos } from '../contexts/TodoContext';

const TimerScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [currentSession, setCurrentSession] = useState(1);
  const [totalSessions, setTotalSessions] = useState(4);
  const { todayFocusTime, addSession } = useTimerSessions();
  const { todos } = useTodos();

  // Get the first incomplete high priority task, or any incomplete task
  const currentTask =
    todos.find(todo => !todo.completed && todo.priority === 'high')?.title ||
    todos.find(todo => !todo.completed)?.title ||
    'Focus Session';

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Session completed
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    if (sessionType === 'focus') {
      // Add the completed focus session
      await addSession({
        taskId: todos.find(todo => !todo.completed && todo.priority === 'high')
          ?.id,
        taskName: currentTask,
        duration: 25, // 25 minutes
        completed: true,
        startTime: new Date(Date.now() - 25 * 60 * 1000),
        endTime: new Date(),
        type: 'focus',
      });

      setCurrentSession(prev => prev + 1);

      if (currentSession >= totalSessions) {
        // All sessions completed
        Alert.alert(
          'Great job! 🎉',
          "You've completed all your focus sessions for today!",
          [{ text: 'OK' }],
        );
        setCurrentSession(1);
        setSessionType('focus');
        setTimeLeft(25 * 60);
      } else {
        // Start break
        setSessionType('break');
        setTimeLeft(5 * 60); // 5 minute break
        Alert.alert('Focus session completed!', 'Time for a 5-minute break.', [
          { text: 'Start Break' },
        ]);
      }
    } else {
      // Break completed, start next focus session
      setSessionType('focus');
      setTimeLeft(25 * 60);
      Alert.alert('Break completed!', 'Ready for your next focus session?', [
        { text: 'Start Focus' },
      ]);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
          },
        },
      ],
    );
  };

  const skipBreak = () => {
    if (sessionType === 'break') {
      Alert.alert('Skip Break', 'Are you sure you want to skip the break?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            setSessionType('focus');
            setTimeLeft(25 * 60);
          },
        },
      ]);
    }
  };

  const formatDisplayTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress =
    (((sessionType === 'focus' ? 25 * 60 : 5 * 60) - timeLeft) /
      (sessionType === 'focus' ? 25 * 60 : 5 * 60)) *
    100;

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Focus Session
          </Text>
          <Text style={styles.subtitle}>{currentTask}</Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerDisplay}>{formatDisplayTime(timeLeft)}</Text>
          <Text style={styles.sessionType}>
            {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
          </Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={
              sessionType === 'focus'
                ? ['#4f46e5', '#7c3aed']
                : ['#10b981', '#059669']
            }
            style={styles.progressCircle}
          >
            <TouchableOpacity style={styles.playButton} onPress={toggleTimer}>
              <Icon
                name={isRunning ? 'pause' : 'play'}
                size={32}
                color="#ffffff"
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>
            🍅 Pomodoro {currentSession} of {totalSessions}
          </Text>
          {sessionType === 'break' && (
            <Text style={styles.breakText}>
              Break in {formatTimeShort(Math.floor(timeLeft / 60))}
            </Text>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <Icon name="refresh" size={20} color="#6b7280" />
            <Text style={styles.controlText}>Reset</Text>
          </TouchableOpacity>

          {sessionType === 'break' && (
            <TouchableOpacity style={styles.controlButton} onPress={skipBreak}>
              <Icon name="skip-next" size={20} color="#6b7280" />
              <Text style={styles.controlText}>Skip Break</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={6}
            gradientColors={
              sessionType === 'focus'
                ? ['#4f46e5', '#7c3aed']
                : ['#10b981', '#059669']
            }
          />
        </View>

        {/* Today's Stats */}
        <StatCard
          title="Today's Focus Time"
          value={formatTime(todayFocusTime)}
          subtitle="Goal: 4 hours"
          color="#4f46e5"
          style={styles.statsCard}
        />

        <ProgressBar
          progress={(todayFocusTime / (4 * 60)) * 100}
          style={styles.statsProgress}
          gradientColors={['#4f46e5', '#7c3aed']}
        />

        {/* Session Progress */}
        <View style={styles.sessionProgress}>
          <Text style={styles.progressLabel}>Session Progress</Text>
          <View style={styles.sessionDots}>
            {Array.from({ length: totalSessions }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.sessionDot,
                  index < currentSession - 1 && styles.completedDot,
                  index === currentSession - 1 && styles.currentDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  darkText: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: '700',
    color: '#4f46e5',
    fontVariant: ['tabular-nums'],
  },
  sessionType: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 10,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 5,
  },
  breakText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
  },
  controlText: {
    marginTop: 5,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 20,
  },
  statsCard: {
    marginBottom: 10,
  },
  statsProgress: {
    marginBottom: 30,
  },
  sessionProgress: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: 10,
  },
  sessionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  completedDot: {
    backgroundColor: '#4f46e5',
  },
  currentDot: {
    backgroundColor: '#7c3aed',
  },
});

export default TimerScreen;
