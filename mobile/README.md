# Wordle Legacy — Android app

A [Capacitor](https://capacitorjs.com/) wrapper that bundles the legacy Wordle site (`../public/`) as a native Android app. It's a real installed app with its own package (`com.wordlelegacy.app`), so Android gives its WebView a private storage sandbox — separate from Chrome, Firefox, any other browser, and any other app. A browser cache/cookie wipe (the thing that keeps losing progress) can never touch it.

The app bundles the site's files directly into the APK and runs entirely offline — it doesn't fetch the page over the network.

## Prerequisites

- Node.js
- Android SDK (`ANDROID_HOME` / `ANDROID_SDK_ROOT` set) with a recent platform + build-tools installed
- JDK 17+ (`JAVA_HOME` set)

## Build the debug APK

```bash
cd mobile
npm install
npm run build:debug
```

This copies `../public/` into `mobile/www/`, runs `cap sync android`, and invokes Gradle. The resulting APK is named with the app's version, e.g.:

```
mobile/android/app/build/outputs/apk/debug/wordle-legacy-debug-v1.0.apk
```

Install it on a connected device/emulator with:

```bash
adb install -r android/app/build/outputs/apk/debug/wordle-legacy-debug-v*.apk
```

## Updating the app after site changes

Whenever `../public/` changes, re-run `npm run sync` (or `npm run build:debug`) to pull the latest site into the app before rebuilding.

## Bumping the version

`versionName`/`versionCode` live in [`android/app/build.gradle`](android/app/build.gradle). Bump `versionName` before cutting a release — it's baked into the built APK's filename, so it's easy to tell builds apart when testing or installing side by side.

## Opening in Android Studio

```bash
npm run open:android
```
