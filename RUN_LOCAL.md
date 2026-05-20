# Running moneyNest on a Physical Android Device

Expo Go **does not work** for this app because it uses native modules
that Expo Go doesn't ship:

- `@uginy/react-native-liquid-glass` (GPU shaders)
- `react-native-mmkv` v3 (JSI)
- `@react-native-voice/voice` (Android SpeechRecognizer)
- `react-native-quick-crypto`
- `react-native-android-widget`
- `react-native-reanimated` v4 + `react-native-worklets`

You need a **dev build** — an APK that bundles the native modules and
connects to Metro for JS hot-reload.

---

## Pre-flight: phone + ADB

1. **Enable Developer Options** on the phone
   Settings → About phone → tap **Build number** seven times.
2. **Enable USB debugging**
   Settings → Developer Options → **USB debugging** ON.
3. **Plug in via USB** and accept the "Allow USB debugging from this
   computer" prompt on the phone.
4. **Confirm the phone is visible**:
   ```bash
   adb devices
   # Expect output like:
   # List of devices attached
   # SM_M515F    device
   ```

If `adb` is not found, ensure `ANDROID_HOME` is set:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Option A — `expo run:android --device` (recommended for daily iteration)

Builds a debug APK locally, installs on the phone, and starts Metro.
First run takes ~5–10 minutes; subsequent runs are seconds.

```bash
cd /path/to/moneynest
pnpm exec expo run:android --device
```

If you have multiple devices, you'll be prompted to pick one.

After the build finishes:
- The app installs and auto-opens via deep-link
  (`exp+moneynest://expo-development-client/?url=http://<your-ip>:8081`).
- Metro stays running in your terminal.
- JS changes hot-reload on the phone (shake phone or press `r` in
  terminal to manually reload).

To switch from this dev build back to a clean re-install:
```bash
adb uninstall com.pooniya.moneynest
```

---

## Option B — Install the release APK directly (no Metro, like Play Store)

You already have a release APK from local Gradle builds at
`android/app/build/outputs/apk/release/app-release.apk` (~143 MB).

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

- `-r` reinstalls without uninstalling first.
- This APK is standalone — no Metro needed, no JS hot-reload.
- Use this for handing the build to someone, showing it off, or testing
  the production code path.

To uninstall:
```bash
adb uninstall com.pooniya.moneynest
```

---

## Option C — EAS development build (no USB needed)

Use this when you can't (or don't want to) keep the phone tethered.

```bash
# 1. Build the dev client on EAS (~10–15 min cloud build)
pnpm exec eas build --profile development --platform android

# 2. EAS gives you a QR + download URL when it's done.
#    On the phone: open the URL in Chrome and install the APK
#    (you may need to allow installs from Chrome).

# 3. On your laptop, start Metro:
pnpm start --dev-client

# 4. Open the installed dev client on the phone — it auto-discovers
#    Metro on the same Wi-Fi and loads your JS.
```

Same hot-reload experience as Option A, but the laptop and phone just
need to be on the same network.

---

## "Web bundling failed" — ignore it

When you run `pnpm start` or `expo run:android --device`, you may see:

```
Web Bundling failed
Unable to resolve "react-native-web/dist/index" ...
```

That's Metro trying to bundle for the **web** platform (Metro serves all
platforms in parallel). We don't have `react-native-web` installed
because this app is Android-only. **The Android bundle succeeded** —
look just above the web error for `Android Bundled N ms` with a module
count. The phone build is fine.

To silence the warning entirely, either:

1. Install `react-native-web` + `react-dom` (small, harmless), **or**
2. Configure Metro to skip the web platform (add to `metro.config.js`):
   ```js
   config.resolver.platforms = ['android', 'ios', 'native'];
   ```

---

## "Couldn't find a connection" / app stays on splash forever

The app shows the splash, then "Couldn't connect to Metro" or hangs.
Usually one of these:

1. **Phone and laptop on different networks** (e.g. phone on mobile data
   while laptop on Wi-Fi). Put them on the same Wi-Fi.

2. **Firewall blocking port 8081**. On Ubuntu:
   ```bash
   sudo ufw allow 8081
   ```

3. **Wrong IP detected**. Metro logs the URL it's serving on (e.g.
   `http://10.106.196.60:8081`). Make sure that IP is reachable from
   the phone:
   ```bash
   # On phone, in Chrome:
   #   http://10.106.196.60:8081
   # Should return JSON with status info.
   ```

4. **USB-tethered Metro** (when not on Wi-Fi). Forward port 8081 over
   USB:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
   Then in the dev client, the URL becomes `http://localhost:8081`.

---

## Reloading and the dev menu

Inside the running dev client:

- **Shake the phone** → opens the in-app dev menu.
- **Three-finger tap** → also opens the dev menu on some devices.
- **`r` in the Metro terminal** → reload from your laptop.
- **`m` in the Metro terminal** → toggle the dev menu remotely.

---

## Uninstalling and clean rebuilds

```bash
# Wipe the app data + uninstall
adb uninstall com.pooniya.moneynest

# Re-prebuild from scratch (regenerates android/)
pnpm exec expo prebuild --clean --platform android

# Re-run
pnpm exec expo run:android --device
```

If Gradle keeps using stale caches:

```bash
cd android && ./gradlew clean && cd ..
pnpm exec expo run:android --device
```

---

## Production AAB for Play Store

This file is for *running on your own phone*. To **submit** to the Play
Store internal testing track:

1. Build production AAB:
   ```bash
   pnpm exec eas build --profile production --platform android
   ```
2. Create a Google Play Service Account JSON
   (Play Console → API access → Service accounts → grant "Release
   manager" → download JSON).
3. Save it as `play-service-account.json` in repo root (already in
   `.gitignore`).
4. Submit:
   ```bash
   pnpm exec eas submit --platform android
   ```

For testing on your phone, **Option A is the right choice 99% of the
time.**
