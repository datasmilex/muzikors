# -------------------------------------------------------------
# Muzikors ProGuard / R8 Rules for Capacitor & Plugins
# -------------------------------------------------------------

# Keep line numbers and source file for crash reporting & Play Console de-obfuscation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# JavaScript Interfaces (CRITICAL for Capacitor WebBridge)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor Core
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity
-keep public class * extends com.getcapacitor.BridgeFragment
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

# Cordova Plugins (In-App Purchase / cordova-plugin-purchase)
-keep class org.apache.cordova.** { *; }
-keep class cc.fovea.** { *; }
-keep class com.android.billingclient.** { *; }
-keep class com.android.vending.billing.** { *; }

# Google AdMob & Google Play Services
-keep public class com.google.android.gms.ads.** { public *; }
-keep public class com.google.ads.** { public *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.ump.** { *; }

# Capacitor Plugins
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.getcapacitor.community.** { *; }

# Suppress common non-fatal warnings
-dontwarn org.apache.cordova.**
-dontwarn com.google.android.gms.**
