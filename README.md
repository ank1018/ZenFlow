# 🌟 FocusLife App

A comprehensive Todo Management, Sleep Tracking, Digital Wellness, and Gamified Rewards app built with React Native.

## ✨ Features

### 📋 Todo Management

- **Smart Task Organization**: Create, edit, and organize tasks with priority levels
- **Filtering System**: Filter tasks by all, today, or high priority
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Due Date Management**: Set deadlines and get timely reminders

### ⏰ Focus Timer (Pomodoro)

- **Pomodoro Technique**: 25-minute focus sessions with 5-minute breaks
- **Session Management**: Track multiple sessions with progress indicators
- **Break Management**: Automatic break timers with skip options
- **Focus Statistics**: Daily and weekly focus time tracking

### 😴 Sleep Tracking

- **Sleep Quality Monitoring**: Track sleep duration, quality, and patterns
- **Detailed Analytics**: Deep sleep, REM sleep, and sleep cycle analysis
- **Weekly Trends**: Visual charts showing sleep patterns over time
- **Sleep Streaks**: Gamified sleep consistency tracking

### 🏆 Gamified Rewards

- **Forest Building**: Grow a virtual forest based on good sleep habits
- **City Development**: Build a city through focus and productivity
- **Achievement System**: Unlock badges and rewards for consistent habits
- **Progress Visualization**: Beautiful visual representations of your progress

### 📊 Digital Wellness

- **Screen Time Tracking**: Monitor and limit daily screen usage
- **Wellness Insights**: Personalized tips and recommendations
- **Habit Streaks**: Track consistency across all wellness metrics
- **Motivational Content**: Encouraging messages and progress celebrations

## 🎨 Design Features

- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Gradient Design**: Beautiful gradient backgrounds and progress indicators
- **Responsive Layout**: Optimized for various screen sizes
- **Accessibility**: Built with accessibility best practices

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ZenFlow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)

   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on iOS**

   ```bash
   npm run ios
   ```

6. **Run on Android**
   ```bash
   npm run android
   ```

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProgressBar.tsx
│   └── StatCard.tsx
├── screens/            # Main app screens
│   ├── DashboardScreen.tsx
│   ├── TodoScreen.tsx
│   ├── TimerScreen.tsx
│   ├── SleepScreen.tsx
│   └── RewardsScreen.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    └── helpers.ts
```

## 🛠️ Technologies Used

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Navigation between screens
- **React Native Vector Icons**: Beautiful icon library
- **React Native Linear Gradient**: Gradient backgrounds
- **React Native Safe Area Context**: Safe area handling

## 📊 Key Components

### Dashboard Screen

- Daily overview with greeting
- Quick stats (sleep, screen time, focus)
- Progress indicators
- Quick action buttons

### Todo Screen

- Task list with priority indicators
- Filter tabs (All, Today, High Priority)
- Checkbox interactions
- Task completion tracking

### Timer Screen

- Pomodoro timer with play/pause
- Session progress tracking
- Break management
- Focus time statistics

### Sleep Screen

- Sleep quality metrics
- Duration and timing details
- Weekly sleep charts
- Sleep tips and recommendations

### Rewards Screen

- Forest and city visualizations
- Achievement system
- Progress bars for all metrics
- Next reward indicators

## 🎯 Usage Guide

### Getting Started

1. Open the app and explore the dashboard
2. Add your first task in the Todo section
3. Start a focus session using the Timer
4. Log your sleep data in the Sleep section
5. Check your progress and rewards

### Best Practices

- **Consistent Sleep**: Try to maintain regular sleep patterns
- **Focused Work**: Use the Pomodoro timer for deep work sessions
- **Task Management**: Prioritize tasks and complete them systematically
- **Digital Wellness**: Monitor and limit screen time for better health

## 🔧 Customization

### Colors and Themes

The app uses a consistent color palette:

- Primary: `#4f46e5` (Indigo)
- Secondary: `#7c3aed` (Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Yellow)
- Error: `#dc2626` (Red)

### Adding New Features

1. Create new components in `src/components/`
2. Add new screens in `src/screens/`
3. Update types in `src/types/index.ts`
4. Add utility functions in `src/utils/helpers.ts`

## 📈 Future Enhancements

- [ ] Cloud synchronization
- [ ] Social features and sharing
- [ ] Advanced analytics and insights
- [ ] Customizable themes
- [ ] Push notifications
- [ ] Integration with health apps
- [ ] Export and backup functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by productivity and wellness apps like Forest, Headspace, and Todoist
- Built with modern React Native best practices
- Designed for optimal user experience and engagement

---

**FocusLife** - Transform your daily habits into a beautiful, productive life! 🌟
