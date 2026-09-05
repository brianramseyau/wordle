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
mobile/android/app/build/outputs/apk/debug/wordle-legacy-debug-v1.1.0.apk
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

## App icon / splash

Generated from the real Wordle "W" logo (`../public/images/wordle_logo_192x192.png`) via `resources/generate-icons.js`, which splits it into separate foreground/background layers (needed so Android's circular/square launcher masks don't clip the letter), then `npx capacitor-assets generate --android` turns those into every density's launcher icon and splash screen. Re-run both if the source logo ever changes:

```bash
cd mobile
node resources/generate-icons.js
npx capacitor-assets generate --android --iconBackgroundColor '#6aaa64' --iconBackgroundColorDark '#6aaa64' --splashBackgroundColor '#6aaa64' --splashBackgroundColorDark '#6aaa64'
```

## Native share sheet

The game's own JS falls back to clipboard-copy whenever the browser's Web Share API isn't usable — which is the normal case in a plain WebView. `scripts/inject-share-shim.js` runs as part of `copy:web` and patches the copied `www/index.html` to back `navigator.share`/`navigator.canShare` with the `@capacitor/share` plugin, so the game's existing "Share" button opens Android's native share sheet instead. This only touches the app's bundled copy — it doesn't modify `../public/`, so the plain browser-hosted site is unaffected.
