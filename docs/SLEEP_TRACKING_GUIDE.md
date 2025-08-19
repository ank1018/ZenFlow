# 🌙 Sleep Tracking Implementation Guide

## 📊 How Sleep Data is Calculated

### 1. **Manual Input Method (Current Implementation)**

```javascript
// User manually logs sleep data
const sleepData = {
  bedtime: new Date('2025-08-12T22:30:00'),
  wakeTime: new Date('2025-08-13T06:30:00'),
  duration: 480, // 8 hours in minutes
  quality: 'good',
  deepSleepDuration: 120, // 2 hours
  remSleepDuration: 90, // 1.5 hours
  awakenings: 1,
  heartRate: 58,
  timeToSleep: 15,
};
```

### 2. **Sensor-Based Sleep Detection (Advanced)**

```javascript
// Using device sensors for automatic detection
const detectSleepWithSensors = async () => {
  // 1. Movement Detection (Accelerometer)
  const movementData = await getMovementData();
  const isAsleep = movementData.every(m => m.magnitude < threshold);

  // 2. Heart Rate Monitoring
  const heartRateData = await getHeartRateData();
  const sleepStages = analyzeHeartRateVariability(heartRateData);

  // 3. Screen Activity
  const screenData = await getScreenActivity();
  const lastScreenOff = screenData.lastOffTime;
  const firstScreenOn = screenData.firstOnTime;

  return {
    bedtime: lastScreenOff,
    wakeTime: firstScreenOn,
    sleepStages,
    quality: calculateQuality(movementData, heartRateData),
  };
};
```

### 3. **Sleep Stage Calculation**

```javascript
const calculateSleepStages = sensorData => {
  const stages = {
    deep: 0,
    rem: 0,
    light: 0,
    awake: 0,
  };

  sensorData.forEach(reading => {
    if (reading.movement < 0.1 && reading.heartRate < 60) {
      stages.deep += reading.duration;
    } else if (reading.movement < 0.3 && reading.heartRateVariability > 0.5) {
      stages.rem += reading.duration;
    } else if (reading.movement < 0.5) {
      stages.light += reading.duration;
    } else {
      stages.awake += reading.duration;
    }
  });

  return stages;
};
```

## 📱 Phone Usage Impact on Sleep

### **How Phone Usage Affects Sleep Quality:**

```javascript
const analyzePhoneImpact = (usageData, sleepData) => {
  const impact = {
    beforeBed: calculateBeforeBedUsage(usageData, sleepData.bedtime),
    nightDisturbances: countNightChecks(usageData, sleepData),
    blueLightExposure: calculateBlueLight(usageData, sleepData.bedtime),
    notifications: countNightNotifications(usageData, sleepData),
  };

  // Calculate sleep quality score
  let score = 100;
  if (impact.beforeBed > 60) score -= 20; // Heavy usage before bed
  if (impact.nightDisturbances > 3) score -= 30; // Too many night checks
  if (impact.blueLightExposure > 60) score -= 15; // High blue light exposure
  if (impact.notifications > 5) score -= 10; // Too many notifications

  return {
    impact,
    sleepQuality:
      score >= 90
        ? 'excellent'
        : score >= 75
        ? 'good'
        : score >= 60
        ? 'fair'
        : 'poor',
    recommendations: generateRecommendations(impact),
  };
};
```

### **Sleep Confirmation with Phone Data:**

```javascript
const confirmSleepWithPhoneData = (sleepData, phoneData) => {
  return {
    bedtimeAccuracy: phoneData.lastUsage < sleepData.bedtime + 30, // Within 30 minutes
    wakeAccuracy: phoneData.firstUsage > sleepData.wakeTime - 30, // Within 30 minutes
    nightDisturbances: phoneData.nightChecks.length,
    sleepQuality: phoneData.nightChecks.length < 2 ? 'Good' : 'Poor',
    phoneImpact: analyzePhoneImpact(phoneData, sleepData),
  };
};
```

## 🔐 Required Permissions

### **Android Permissions:**

```xml
<!-- Sleep Tracking -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- App Usage Tracking -->
<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

<!-- Notification Access -->
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
```

### **iOS Permissions:**

```xml
<!-- Motion & Fitness -->
<key>NSMotionUsageDescription</key>
<string>We need motion data to track your sleep patterns</string>

<!-- Microphone -->
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access to detect snoring and breathing patterns</string>

<!-- HealthKit -->
<key>NSHealthShareUsageDescription</key>
<string>We need HealthKit access to read and write sleep data</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need HealthKit access to save your sleep data</string>
```

## 📊 App Usage Data Implementation

### **1. Accessibility Service (Android)**

```javascript
// AndroidManifest.xml
<service
  android:name=".AppUsageAccessibilityService"
  android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
  android:exported="false"
>
  <intent-filter>
    <action android:name="android.accessibilityservice.AccessibilityService" />
  </intent-filter>
  <meta-data
    android:name="android.accessibilityservice"
    android:resource="@xml/accessibility_service_config"
  />
</service>
```

```javascript
// AppUsageAccessibilityService.js
class AppUsageAccessibilityService extends AccessibilityService {
  onAccessibilityEvent(event) {
    if (event.eventType === AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      const packageName = event.getPackageName();
      const className = event.getClassName();

      // Track app usage
      this.trackAppUsage(packageName, className);
    }
  }

  trackAppUsage(packageName, className) {
    const appData = {
      packageName,
      startTime: new Date(),
      category: this.categorizeApp(packageName),
    };

    // Save to storage
    this.saveAppUsage(appData);
  }
}
```

### **2. Screen Time API (iOS)**

```javascript
// iOS implementation using Screen Time API
import FamilyControls from '@react-native-family-controls/family-controls';

const requestScreenTimePermission = async () => {
  try {
    const result = await FamilyControls.requestAuthorization();
    if (result === 'authorized') {
      // Start monitoring app usage
      await startAppUsageMonitoring();
    }
  } catch (error) {
    console.error('Screen Time permission denied:', error);
  }
};
```

### **3. App Usage Categories**

```javascript
const APP_CATEGORIES = {
  social: [
    'com.facebook.katana',
    'com.instagram.android',
    'com.twitter.android',
  ],
  entertainment: [
    'com.netflix.mediaclient',
    'com.spotify.music',
    'com.google.android.youtube',
  ],
  productivity: [
    'com.microsoft.office.word',
    'com.google.android.apps.docs',
    'com.trello',
  ],
  health: ['com.zenflow', 'com.fitbit.FitbitMobile', 'com.strava'],
  other: ['com.android.settings', 'com.google.android.apps.maps'],
};

const categorizeApp = packageName => {
  for (const [category, apps] of Object.entries(APP_CATEGORIES)) {
    if (apps.includes(packageName)) {
      return category;
    }
  }
  return 'other';
};
```

## 🎯 Sleep Quality Scoring Algorithm

### **Comprehensive Sleep Score Calculation:**

```javascript
const calculateSleepScore = (sleepData, phoneData) => {
  const factors = {
    // Duration (30% weight)
    duration: Math.min((sleepData.duration / 480) * 30, 30),

    // Efficiency (25% weight)
    efficiency: (sleepData.efficiency / 100) * 25,

    // Awakenings (20% weight)
    awakenings: Math.max(0, 20 - sleepData.awakenings * 4),

    // Heart Rate (15% weight)
    heartRate:
      sleepData.heartRate < 60 ? 15 : sleepData.heartRate < 70 ? 12 : 8,

    // Phone Usage Impact (10% weight)
    phoneImpact: calculatePhoneImpactScore(phoneData),
  };

  const totalScore = Object.values(factors).reduce((a, b) => a + b, 0);

  return {
    score: Math.round(totalScore),
    factors,
    quality:
      totalScore >= 90
        ? 'excellent'
        : totalScore >= 75
        ? 'good'
        : totalScore >= 60
        ? 'fair'
        : 'poor',
  };
};

const calculatePhoneImpactScore = phoneData => {
  let score = 10;

  if (phoneData.beforeBed > 60) score -= 4;
  if (phoneData.beforeBed > 30) score -= 2;
  if (phoneData.nightDisturbances > 3) score -= 6;
  if (phoneData.nightDisturbances > 1) score -= 3;
  if (phoneData.blueLightExposure > 60) score -= 2;

  return Math.max(0, score);
};
```

## 🔍 Sleep Data Validation

### **Multi-Source Validation:**

```javascript
const validateSleepData = async (manualData, sensorData, phoneData) => {
  const validation = {
    bedtimeAccuracy: validateBedtime(manualData.bedtime, phoneData.lastUsage),
    wakeAccuracy: validateWakeTime(manualData.wakeTime, phoneData.firstUsage),
    durationAccuracy: validateDuration(
      manualData.duration,
      sensorData.duration,
    ),
    qualityAccuracy: validateQuality(manualData.quality, sensorData.quality),
    confidence: calculateConfidence(validation),
  };

  return {
    ...manualData,
    validation,
    confirmed: validation.confidence > 0.8,
  };
};
```

## 📈 Implementation Recommendations

### **1. Start with Manual Input**

- Implement basic sleep logging
- Add sleep quality assessment
- Include sleep stage estimates

### **2. Add Sensor Integration**

- Implement accelerometer monitoring
- Add heart rate tracking (if available)
- Include screen activity monitoring

### **3. Integrate Phone Usage**

- Track app usage patterns
- Monitor notifications
- Calculate blue light exposure

### **4. Implement Advanced Features**

- Sleep stage detection
- Sleep quality scoring
- Personalized recommendations
- Sleep trend analysis

### **5. Privacy and Security**

- Local data storage
- Encrypted data transmission
- User consent management
- Data anonymization

## 🚀 Next Steps

1. **Implement AppUsageService** for phone usage tracking
2. **Add sensor integration** for automatic sleep detection
3. **Create sleep validation** algorithms
4. **Build comprehensive** sleep quality scoring
5. **Add personalized** sleep recommendations
6. **Implement privacy** controls and data security

This comprehensive approach will provide accurate sleep tracking with phone usage impact analysis! 🌙✨
