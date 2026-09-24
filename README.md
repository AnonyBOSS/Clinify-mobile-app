# 🏥 Clinify - Mobile Healthcare Application

<div align="center">

![Clinify Logo](./assets/icon.png)

**A comprehensive healthcare mobile application connecting patients with doctors**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.29-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[📱 Download APK](https://expo.dev/artifacts/eas/paREhDxnrPe6QTKuSHjrHq.apk) | [🌐 Web Dashboard](https://clinic-web-app-two.vercel.app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Integration](#-api-integration)
- [Screens Overview](#-screens-overview)
- [Internationalization](#-internationalization)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Clinify** is a modern, feature-rich mobile healthcare application built with React Native and Expo. It provides a seamless platform for patients to connect with healthcare professionals, book appointments, manage their health journey, and access AI-powered health assistance.

The app supports both **patients** and **doctors** with role-specific dashboards and features, ensuring a tailored experience for each user type.

---

## ✨ Features

### 👤 For Patients

| Feature | Description |
|---------|-------------|
| 🔍 **Doctor Search** | Search and filter doctors by specialization, location, and ratings |
| 📅 **Appointment Booking** | Easy-to-use booking system with time slot selection |
| 🤖 **AI Health Assistant** | Get personalized health guidance and information |
| 🩺 **Symptom Checker** | AI-powered symptom analysis with doctor recommendations |
| 💬 **Messaging** | Live chat with healthcare providers (polls for new messages every 0.5 s) |
| ⭐ **Doctor Ratings** | Rate and review your healthcare experience |
| 📊 **Dashboard** | View upcoming and past appointments at a glance |
| 🔔 **Notifications** | Stay updated with appointment reminders and messages |

### 👨‍⚕️ For Doctors

| Feature | Description |
|---------|-------------|
| 📋 **Dashboard** | Overview of today's appointments and patient queue |
| 📆 **Schedule Management** | Define and manage availability slots |
| 💬 **Patient Messaging** | Communicate with patients securely |
| 📈 **Analytics** | View patient statistics and appointment trends |
| 🔔 **Notifications** | In-app alerts for new appointments and messages |

### 🌐 General Features

- 🌙 **Dark/Light Theme** - Automatic and manual theme switching
- 🌍 **Multi-language Support** - English and Arabic (RTL) support
- 🔐 **Secure Authentication** - JWT-based authentication
- 📱 **Cross-Platform** - iOS and Android support
- 🔄 **Pull-to-Refresh** - Refresh data on demand

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native 0.81.5 |
| **Platform** | Expo SDK 54 |
| **Language** | TypeScript 5.9.2 |
| **Navigation** | React Navigation 7.x |
| **State Management** | React Context API |
| **HTTP Client** | Axios |
| **Storage** | Expo Secure Store + AsyncStorage |
| **Icons** | Expo Vector Icons |
| **Internationalization** | i18n-js + Expo Localization |

---

## 📁 Project Structure

```
ClinifyApp/
├── 📱 App.tsx                 # Application entry point
├── 📦 package.json            # Dependencies and scripts
├── ⚙️ app.json                # Expo configuration
├── 🔧 eas.json                # EAS Build configuration
├── 📂 assets/                 # Images and icons
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
└── 📂 src/
    ├── 📂 api/                # API service modules
    │   ├── client.ts          # Axios instance configuration
    │   ├── auth.ts            # Authentication endpoints
    │   ├── appointments.ts    # Appointment management
    │   ├── doctors.ts         # Doctor search and profiles
    │   ├── messages.ts        # Chat functionality
    │   ├── notifications.ts   # Push notifications
    │   ├── ai.ts              # AI assistant integration
    │   ├── ratings.ts         # Doctor ratings
    │   ├── profile.ts         # User profile management
    │   └── analytics.ts       # Analytics data
    ├── 📂 components/         # Reusable UI components
    │   ├── LoadingSpinner.tsx
    │   ├── EmptyState.tsx
    │   └── ...
    ├── 📂 config/             # App configuration
    │   └── index.ts           # API URLs, constants
    ├── 📂 contexts/           # React Context providers
    │   ├── AuthContext.tsx    # Authentication state
    │   ├── ThemeContext.tsx   # Theme management
    │   └── LanguageContext.tsx # i18n management
    ├── 📂 i18n/               # Internationalization
    │   ├── index.ts           # i18n configuration
    │   ├── en.ts              # English translations
    │   └── ar.ts              # Arabic translations
    ├── 📂 navigation/         # Navigation configuration
    │   ├── index.tsx          # Root navigator
    │   ├── AuthNavigator.tsx  # Auth flow
    │   ├── PatientNavigator.tsx
    │   └── DoctorNavigator.tsx
    ├── 📂 screens/            # Application screens
    │   ├── 📂 auth/           # Login, Register
    │   ├── 📂 patient/        # Patient-specific screens
    │   ├── 📂 doctor/         # Doctor-specific screens
    │   └── 📂 shared/         # Common screens
    ├── 📂 theme/              # Theme definitions
    │   └── index.ts           # Colors, typography
    └── 📂 types/              # TypeScript definitions
        └── index.ts           # Shared types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on your mobile device (for development)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Clinify mobile app/ClinifyApp"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file (if not exists)
   cp .env.example .env
   
   # Edit with your API URL
   EXPO_PUBLIC_API_URL=https://clinic-web-app-two.vercel.app
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/emulator**
   - **Android**: Press `a` or scan QR with Expo Go
   - **iOS**: Press `i` or scan QR with Expo Go
   - **Web**: Press `w`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `https://clinic-web-app-two.vercel.app` |

### App Configuration (`app.json`)

```json
{
  "expo": {
    "name": "ClinifyApp",
    "slug": "ClinifyApp",
    "version": "1.0.0",
    "android": {
      "package": "com.anonyboss.ClinifyApp"
    }
  }
}
```

---

## 🔌 API Integration

The app integrates with a RESTful backend API. All API modules are located in `src/api/`:

| Module | Endpoints |
|--------|-----------|
| `auth.ts` | Login, Register, Token refresh |
| `appointments.ts` | CRUD operations for appointments |
| `doctors.ts` | Search, profiles, availability |
| `messages.ts` | Conversations, send/receive messages |
| `notifications.ts` | Fetch and manage notifications |
| `ai.ts` | AI health assistant queries |
| `ratings.ts` | Submit and view doctor ratings |
| `profile.ts` | User profile management |
| `analytics.ts` | Dashboard analytics data |

### Authentication

The app uses **JWT-based authentication** with tokens stored securely using Expo Secure Store. The `AuthContext` manages the authentication state globally.

---

## 📱 Screens Overview

### Authentication Flow
| Screen | Description |
|--------|-------------|
| **Login** | Email/password authentication |
| **Register** | New user registration (patient/doctor) |

### Patient Screens
| Screen | Description |
|--------|-------------|
| **Dashboard** | Appointments overview, quick actions |
| **Doctor Search** | Find doctors with filters |
| **Booking** | Schedule appointments |
| **Symptom Checker** | AI-powered symptom analysis |
| **AI Assistant** | Health questions and guidance |
| **My Ratings** | View submitted ratings |
| **Rate Doctor** | Submit doctor reviews |

### Doctor Screens
| Screen | Description |
|--------|-------------|
| **Dashboard** | Today's appointments, patient queue |
| **Schedule** | Manage availability |

### Shared Screens
| Screen | Description |
|--------|-------------|
| **Profile** | View/edit user profile |
| **Settings** | Theme, language, logout |
| **Messages** | Conversation list |
| **Chat** | Individual chat screen |
| **Notifications** | All notifications |

---

## 🌍 Internationalization

The app supports multiple languages with RTL (Right-to-Left) support:

| Language | Code | RTL |
|----------|------|-----|
| English | `en` | ❌ |
| Arabic | `ar` | ✅ |

### Adding New Translations

1. Create a new translation file in `src/i18n/`:
   ```typescript
   // src/i18n/fr.ts
   export default {
     common: {
       welcome: 'Bienvenue',
       // ...
     }
   };
   ```

2. Register in `src/i18n/index.ts`

3. Add to `SUPPORTED_LANGUAGES` in `src/config/index.ts`

---

## 📦 Building for Production

### Using EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

### Download Production APK

📥 **[Download Latest APK](https://expo.dev/artifacts/eas/paREhDxnrPe6QTKuSHjrHq.apk)**

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👥 Authors

- **Development Team** - *Clinify Project*

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Development platform
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [React Native](https://reactnative.dev/) - Mobile framework

---

<div align="center">

**Made with ❤️ for better healthcare**

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://expo.dev/artifacts/eas/paREhDxnrPe6QTKuSHjrHq.apk)

</div>
