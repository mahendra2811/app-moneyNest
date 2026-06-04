# Platform extensions — A14/A15/A16/A17 notes

These features touch native code that the Expo plugin system cannot
configure declaratively. After `pnpm prebuild --clean`, edit
`android/app/src/main/AndroidManifest.xml` to enable them.

## A14 — Wear OS companion

A separate watch app that talks to the phone via
`com.google.android.gms:play-services-wearable`. Scope:

- Phone-side service exposing `addExpense(amount, category)` via
  `MessageClient`.
- Watch-side standalone Android app (Kotlin) showing a glanceable
  "today total" tile and a 3-button quick-add (₹50/₹100/₹500).

Not implementable from the React Native side alone. Tracked here so the
plumbing decision is recorded.

## A15 — Floating bubble quick-add

Requires `SYSTEM_ALERT_WINDOW`, which carries a Play Console review flag
and a runtime permission flow. Implementation outline:

1. Add `<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>`
2. Native service extending `android.app.Service` that creates a
   `WindowManager` overlay.
3. The overlay launches the existing `transaction/new` deep link.

Skipped in current build to keep the Play Console review lane uncluttered.

## A16 — NFC tap-to-split

Android NFC `ndef.ACTION_TAG_DISCOVERED` reading + writing. Use case is
niche (two phones must be running moneyNest and physically tap). Decision:
keep parked. If revisited, the data packet shape would be:

```json
{ "v": 1, "amountPaise": 25000, "type": "expense", "categorySlug": "food" }
```

## A17 — Lock-screen widget

Android 17+ allows widgets on the lock screen with `lockedWidgetCategory`.
The `react-native-android-widget` plugin needs:

```xml
<appwidget-provider
  android:widgetCategory="home_screen|keyguard"
  android:initialKeyguardLayout="@layout/quickadd_widget"
  ... />
```

Edit `android/app/src/main/res/xml/quickadd_widget_info.xml` after prebuild.

## A4 — Quick Settings tile

Add a `TileService` subclass in
`android/app/src/main/java/com/pooniya/moneynest/QuickAddTileService.kt`:

```kotlin
class QuickAddTileService : TileService() {
  override fun onClick() {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("moneynest://transaction/new"))
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    startActivityAndCollapse(intent)
  }
}
```

Then declare in `AndroidManifest.xml`:

```xml
<service
  android:name=".QuickAddTileService"
  android:label="Add expense"
  android:icon="@drawable/ic_quick_add"
  android:permission="android.permission.BIND_QUICK_SETTINGS_TILE">
  <intent-filter>
    <action android:name="android.service.quicksettings.action.QS_TILE"/>
  </intent-filter>
</service>
```

## A7 — Google Assistant action

After prebuild, add `res/xml/shortcuts.xml`:

```xml
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
  <capability android:name="actions.intent.CREATE_MONEY_TRANSFER">
    <intent
      android:action="android.intent.action.VIEW"
      android:targetPackage="com.pooniya.moneynest"
      android:targetClass="com.pooniya.moneynest.MainActivity"
      android:data="moneynest://transaction/voice"/>
  </capability>
</shortcuts>
```

Reference it from `AndroidManifest.xml` `<meta-data android:name="android.app.shortcuts" .../>`.
