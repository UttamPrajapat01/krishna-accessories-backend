# 12 — iOS Build Guide

## Overview

This guide covers building the Krishna Accessories iOS app for Simulator testing and App Store submission.

The project uses **Expo** which provides two build paths:
- **EAS Build** (Recommended): Apple-certified cloud builds without a Mac
- **Xcode + Expo Prebuild** (Advanced): Local builds requiring a Mac with Xcode

---

## Option 1: EAS Build (Recommended — Cloud Build)

### Prerequisites
- Expo account: [expo.dev](https://expo.dev)
- Apple Developer account: [developer.apple.com](https://developer.apple.com) (for App Store; $99/yr)
- EAS CLI: `npm install -g eas-cli`

### Setup

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"
eas login
```

### Build for iOS Simulator (Development)

```bash
eas build --platform ios --profile development
# Downloads .tar.gz simulator build
```

### Build for Physical Device / TestFlight (Preview)

```bash
eas build --platform ios --profile preview
```

### Build for App Store (Production)

```bash
eas build --platform ios --profile production
```

EAS handles Apple provisioning profiles and code signing certificates automatically.

---

## Option 2: Local Xcode Build (Requires macOS + Xcode)

### System Prerequisites

| Tool | Version | Notes |
|---|---|---|
| macOS | 14+ (Sonoma) | Required for Xcode 15+ |
| Xcode | 15+ | from Mac App Store |
| CocoaPods | 1.14+ | `sudo gem install cocoapods` |
| Apple Developer Account | Active | for device testing |

### Step 1: Prebuild (Generate Native iOS Project)

```bash
cd "Krishna Accessories/mobile/KrishnaAccessoriesApp"
npx expo prebuild --platform ios
```

This generates the `ios/` folder.

### Step 2: Install CocoaPods

```bash
cd ios
pod install
cd ..
```

### Step 3: Open in Xcode

```bash
open ios/KrishnaAccessoriesApp.xcworkspace
```

### Step 4: Configure Signing in Xcode

1. Select the **KrishnaAccessoriesApp** target
2. Under **Signing & Capabilities**:
   - Enable "Automatically manage signing"
   - Select your Apple Developer Team
   - Bundle Identifier: `com.krishnaaccessories.app`

### Step 5: Build for Simulator

1. Select a simulator device from the scheme picker
2. Press **⌘ + R** (Build and Run)

### Step 6: Build for Device (TestFlight)

1. Connect a physical iOS device
2. Select it in Xcode scheme picker
3. Press **⌘ + R**
4. First run requires trusting the developer certificate on device

### Step 7: Archive for App Store

1. Go to **Product → Archive**
2. In the Organizer, click **Distribute App**
3. Select **App Store Connect**
4. Follow the submission wizard

---

## App Store Listing Requirements

| Asset | Size / Format |
|---|---|
| App Icon | 1024×1024 PNG (no alpha) |
| iPhone 6.5" Screenshots | 1284×2778 px (minimum 3) |
| iPhone 5.5" Screenshots | 1242×2208 px |
| iPad Screenshots | 2048×2732 px (if iPad supported) |
| App Preview Video | Optional, 15–30 seconds MP4 |

---

## App Store Configuration

| Setting | Value |
|---|---|
| Bundle ID | `com.krishnaaccessories.app` |
| Version | `1.0.0` |
| Build Number | `1` |
| Deployment Target | iOS 14.0+ |
| Supported Devices | iPhone (portrait only) |
| Categories | Shopping, Lifestyle |

---

## Info.plist Privacy Keys

These are preconfigured in `app.json`:

```xml
<key>NSCameraUsageDescription</key>
<string>Krishna Accessories needs camera access for AR product previews.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>To upload profile images and order photos.</string>

<key>NSFaceIDUsageDescription</key>
<string>For fast and secure biometric checkout.</string>
```

---

## Note on Local Xcode Availability

> ⚠️ iOS builds require macOS with Xcode. If you are on macOS but Xcode is not installed:
>
> ```bash
> xcode-select --install    # Install Xcode CLI tools
> # Then install Xcode 15+ from the Mac App Store
> ```
>
> **Alternative:** Use EAS Build (Option 1) which builds on Apple infrastructure — no local Xcode required.
