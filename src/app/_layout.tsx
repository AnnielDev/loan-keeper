import "@/i18n";

import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OfflineBanner } from "@/components/general/OfflineBanner";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth";
import { useLocationAccessStore } from "@/store/location";
import "@/store/network";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { colors, scheme } = useAppTheme();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hide();
    }
  }, [isHydrated]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <OfflineBanner />
        {isHydrated ? <RootNavigator /> : null}
      </View>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  // Timezone is the field business logic actually depends on (due dates,
  // overdue calculations) and is always set once permission is granted,
  // unlike country which can occasionally fail to reverse-geocode — so it's
  // the reliable signal for "the user has completed the location gate".
  const hasLocation = useAuthStore((state) => !!state.user?.timezone);
  // Re-checked whenever the app returns to the foreground, so revoking
  // location (app permission or the device-wide toggle) after granting it
  // once sends the user back to the location gate instead of staying in.
  const isLocationAccessGranted = useLocationAccessStore((state) => state.isGranted);
  const { colors } = useAppTheme();

  useEffect(() => {
    useLocationAccessStore.getState().refresh();
  }, []);

  const canAccessApp = hasLocation && isLocationAccessGranted;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={isAuthenticated && canAccessApp}>
        <Stack.Screen name="(tabs)" options={{ animation: "simple_push" }} />
        <Stack.Screen name="customer-form" options={{ presentation: "modal" }} />
        <Stack.Screen name="loan-form" options={{ presentation: "modal" }} />
        <Stack.Screen name="loan-payment-form" options={{ presentation: "modal" }} />
        <Stack.Screen name="customer/[id]" />
        <Stack.Screen name="loan/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !canAccessApp}>
        <Stack.Screen name="location-permission" options={{ animation: "fade" }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
