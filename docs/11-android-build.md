# 11 — Android Build Guide

## Overview

This guide covers building the Krishna Accessories Android app as a debug APK (for testing) and a release APK/AAB (for Play Store submission).

The project uses **Expo** which provides two build paths:
- **Expo Go / Development**: Run directly from Metro bundler (no native build needed)
- **EAS Build** (Recommended for production): Cloud-based managed builds
- **Expo Prebuild + Gradle** (Advanced): Eject to bare workflow for full Gradle control

---

## Option 1: EAS Build (Recommended — Cloud Build)

### Prerequisites
- Expo account: [expo.dev](https://expo.dev)
- EAS CLI: `npm install -g eas-cli`

### Setup

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"

# Login to Expo
eas login

# Configure EAS (if not already done)
eas build:configure
```

### Build Debug APK (Internal Testing)

```bash
eas build --platform android --profile development
```

### Build Release APK (Preview — distributable APK file)

```bash
eas build --platform android --profile preview
```

### Build Release AAB (Production — Play Store)

```bash
eas build --platform android --profile production
```

---

## Option 2: Local Expo Prebuild + Gradle (Requires Java 17 + Android SDK)

### System Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java JDK | 17 (LTS) | `java --version` |
| Android SDK | API 34 | via Android Studio |
| Gradle | 8.x | bundled with Android Studio |

```bash
# macOS — install Java 17
brew install openjdk@17
export JAVA_HOME=/usr/local/opt/openjdk@17

# Set Android SDK path
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Step 1: Prebuild (Generate Native Android Project)

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"
npx expo prebuild --platform android
```

This generates the `android/` folder.

### Step 2: Generate Keystore

```bash
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

### Step 3: Configure Signing

Create `android/gradle.properties` (or update it):

```properties
MYAPP_STORE_FILE=keystores/krishna-accessories-release.jks
MYAPP_STORE_PASSWORD=YOUR_STORE_PASSWORD
MYAPP_KEY_ALIAS=krishna-accessories
MYAPP_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

Update `android/app/build.gradle`:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_STORE_FILE)
            storePassword MYAPP_STORE_PASSWORD
            keyAlias MYAPP_KEY_ALIAS
            keyPassword MYAPP_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Debug APK

```bash
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Step 5: Build Release APK

```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

### Step 6: Build Release AAB (Play Store)

```bash
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## Output Files

| Build Type | File | Location |
|---|---|---|
| Debug APK | `app-debug.apk` | `android/app/build/outputs/apk/debug/` |
| Release APK | `app-release.apk` | `android/app/build/outputs/apk/release/` |
| Release AAB | `app-release.aab` | `android/app/build/outputs/bundle/release/` |

---

## Play Store Submission

1. Create app listing at [play.google.com/console](https://play.google.com/console)
2. Upload `app-release.aab` to Internal Testing track first
3. Complete store listing (screenshots, description, content rating)
4. Promote to Production after testing approval

---

## Package Details

| Setting | Value |
|---|---|
| App ID | `com.krishnaaccessories.app` |
| Version Name | `1.0.0` |
| Version Code | `1` |
| Min SDK | `21` (Android 5.0+) |
| Target SDK | `34` (Android 14) |

---

## Note on Local Java Availability

> ⚠️ **This system** does not have Java JDK installed locally. Local Gradle builds require Java 17.
> 
> **Recommendation:** Use EAS Build (Option 1) for cloud-managed builds without local Java requirements. EAS handles signing, Gradle, and SDK automatically.
