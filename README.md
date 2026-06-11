# FitForge 💪

Personal fitness tracker built with React Native + Expo. Track workouts, diet, progress, and streaks.

## Features

- **Dashboard** — Streak counter, daily progress rings, quick actions
- **Workout Tracker** — 7-day PPL split with exercise completion, weight logging
- **Diet Tracker** — Macro tracking, meal logging, protein progress bar
- **Progress Tracker** — Weight/waist charts, step counter, history log
- **Settings** — Profile, targets, workout reminders
- **Dark Theme** — Full dark mode, optimized for OLED screens

## Tech Stack

- React Native + Expo SDK 56
- TypeScript
- React Navigation (Bottom Tabs)
- AsyncStorage (offline persistence)
- Expo Notifications (workout reminders)
- Expo Camera + Image Picker (progress photos)
- react-native-svg (charts)

## Quick Start

### Option 1: Expo Go (Instant — requires laptop)

```bash
# Clone
git clone https://github.com/SuyeshBadge/FitForge.git
cd FitForge

# Install
npm install

# Start
npx expo start

# Scan QR code with iPhone camera → opens in Expo Go
```

### Option 2: EAS Build (Standalone app — no laptop needed after build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS (internal distribution — installs directly on iPhone)
eas build --platform ios --profile preview

# The build runs on Expo's cloud servers (no Mac needed!)
# You'll get a link to install the .ipa on your iPhone
```

### Option 3: App Store (Public release)

```bash
# Build production version
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Project Structure

```
fitforge/
├── App.tsx                    # Entry point
├── src/
│   ├── data/
│   │   ├── workouts.ts        # 7-day workout plan
│   │   └── diet.ts            # Diet plan + macros
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── DietScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── utils/
│   │   ├── storage.ts         # AsyncStorage helpers
│   │   └── notifications.ts   # Push notification setup
│   └── types.ts               # TypeScript interfaces
├── eas.json                   # EAS Build configuration
└── app.json                   # Expo configuration
```

## Deployment Options

| Method | Cost | Laptop Needed | Best For |
|--------|------|---------------|----------|
| Expo Go | Free | Yes (running) | Quick testing |
| EAS Preview | Free tier (15 builds/mo) | No | Personal use |
| EAS Production | Free tier | No | App Store release |
| TestFlight | $99/yr Apple Dev | No | Beta testing |

## Data Storage

All data is stored locally on the device via AsyncStorage. No server needed. Data persists across app restarts.

## License

MIT
