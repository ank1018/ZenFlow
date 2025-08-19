# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for the ZenFlow app so that any user can sign in and sync their Google Calendar events to the todo list.

## Prerequisites

1. A Google account with Google Calendar
2. Google Cloud Console access
3. React Native development environment

## Step 1: Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: ZenFlow
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email) if needed
6. Save and continue

## Step 3: Create Web Application Client (Required for React Native)

**Why Web Application?** The `@react-native-google-signin/google-signin` library requires a Web application client ID, even for mobile apps. This is how the library works internally.

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Name: "ZenFlow Web Client"
5. Authorized JavaScript origins:
   - Add `http://localhost:8081` for development
   - Add `http://localhost:3000` for development
6. Authorized redirect URIs:
   - Add `http://localhost:8081` for development
   - Add `http://localhost:3000` for development
7. **Copy the Client ID** - This is your **Web Client ID**

## Step 4: Get SHA-1 Certificate Fingerprint (Android)

Run this command in your project directory:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA1 fingerprint.

## Step 5: Create Android Client (Required for Android)

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Application type: **Android**
4. Package name: `com.zenflow`
5. SHA-1 certificate fingerprint: Paste the SHA1 from Step 4
6. **Copy the Client ID** - This is your **Android Client ID**

## Step 6: Update App Configuration

1. Open `src/services/GoogleCalendarService.ts`
2. Replace the placeholder web client ID with your **Web Client ID** from Step 3:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // From Step 3
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
});
```

**Important**: Use the **Web Client ID** (from Step 3), not the Android Client ID (from Step 5).

## Step 7: Android Configuration

The following permissions are already added to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

## Step 8: iOS Configuration

Add the following to your `ios/ZenFlow/Info.plist`:

```xml
<key>NSCalendarsUsageDescription</key>
<string>This app needs access to calendar to sync your Google Calendar events.</string>
```

## Step 9: Rebuild the App

```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## Why Both Clients Are Needed

### Web Application Client

- **Required by the library**: `@react-native-google-signin/google-signin` uses web-based OAuth flow internally
- **Used for**: Getting access tokens and making API calls
- **Configuration**: Used in `GoogleSignin.configure()` as `webClientId`

### Android Client

- **Required for**: Android platform authentication
- **Used for**: Native Android sign-in flow
- **Configuration**: Automatically handled by the library

## How It Works

Once set up, users can:

1. **Sign In**: Tap "Sign in to Google Calendar" button
2. **Authorize**: Grant permission to access their Google Calendar
3. **Sync**: Tap "Sync Calendar to Todos" to import events
4. **View**: Calendar events appear as todos in the app
5. **Manage**: Edit, complete, or delete synced todos

## Features

- ✅ **Any user can sign in** with their Google account
- ✅ **Automatic sync** of calendar events to todos
- ✅ **Duplicate prevention** - won't sync the same event twice
- ✅ **7-day sync window** - syncs events for the next week
- ✅ **Real-time updates** - changes sync immediately
- ✅ **Sign out functionality** - users can disconnect anytime

## Troubleshooting

### "Sign-In Failed" Error

- Check your internet connection
- Verify the **Web Client ID** is correct (not Android Client ID)
- Make sure Google Calendar API is enabled
- Check that OAuth consent screen is configured
- Ensure both Web and Android clients are created

### "No Events Found" Message

- User's Google Calendar might be empty
- Events might be outside the 7-day sync window
- Check if user has calendar events in their Google Calendar

### Build Errors

- Clean and rebuild the project
- Check that all permissions are properly configured
- Verify SHA-1 fingerprint matches your debug keystore

## Security Notes

- The app only requests calendar read/write permissions
- User data stays private and is not shared
- Users can revoke access anytime through Google Account settings
- Access tokens are stored securely and expire automatically

## Production Deployment

For production, you should:

1. Use a release keystore and get its SHA-1 fingerprint
2. Add your production domain to authorized origins
3. Configure proper OAuth consent screen for production
4. Test with real Google accounts
5. Consider implementing token refresh logic

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all setup steps are completed correctly
3. Test with a different Google account
4. Check Google Cloud Console for API usage and errors
5. Ensure you're using the **Web Client ID** in the app configuration
