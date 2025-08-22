import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens (no changes to your files)
// import DashboardScreen from './src/screens/DashboardScreen'; // To-Do (timeline list)
// import TimerScreen from './src/screens/TimerScreen'; // Pomodoro / quick timer
// import SleepScreen from './src/screens/SleepScreen'; // Sleep tracker
// import RewardsScreen from './src/screens/RewardsScreen'; // Rewards / houses
import InsightsScreen from './src/screens/InsightsScreen'; // Phone usage (charts)
import TodoScreen from './src/screens/TodoScreen/TodoScreen';
import { TodoProvider } from './src/contexts/TodoContext';
import NotificationService from './src/services/NotificationService';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  // Initialize notification service when app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await NotificationService.initialize();
        await NotificationService.requestPermissions();
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <TodoProvider>
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: '#ffffff' },
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Tab.Navigator
          initialRouteName="To-Do"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: Platform.select({ ios: -2, android: 2 }),
            },
            tabBarActiveTintColor: '#4f46e5', // indigo-600
            tabBarInactiveTintColor: '#9ca3af', // gray-400
            tabBarStyle: {
              height: 64,
              paddingTop: 6,
              paddingBottom: Platform.select({ ios: 10, android: 8 }),
              backgroundColor: '#ffffff',
              borderTopWidth: 0,
              elevation: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -2 },
            },
            tabBarIcon: ({ focused, color, size }) => {
              // slightly larger, friendlier icons
              const s = Math.max(size, 24);
              let name: string = 'help-circle-outline';

              switch (route.name) {
                case 'To-Do':
                  name = focused ? 'check-circle' : 'check-circle-outline';
                  break;
                case 'Sleep':
                  name = focused
                    ? 'moon-waning-crescent'
                    : 'moon-waning-crescent';
                  break;
                case 'Phone':
                  name = focused ? 'cellphone' : 'cellphone';
                  break;
                case 'Timer':
                  name = focused ? 'timer' : 'timer-outline';
                  break;
                case 'Rewards':
                  name = focused ? 'trophy' : 'trophy-outline';
                  break;
              }

              return <Icon name={name} size={s} color={color} />;
            },
          })}
        >
          {/* Map screens to the simplified, wireframe-friendly tab names */}
          <Tab.Screen name="To-Do" component={TodoScreen} />
          {/* <Tab.Screen name="Sleep" component={SleepScreen} /> */}
          <Tab.Screen
            name="Phone" // Phone usage view (keeps design simple without renaming files)
            component={InsightsScreen}
          />
          {/* <Tab.Screen name="Timer" component={TimerScreen} /> */}
          {/* <Tab.Screen name="Rewards" component={RewardsScreen} /> */}
        </Tab.Navigator>
      </NavigationContainer>
    </TodoProvider>
  );
};

export default App;
