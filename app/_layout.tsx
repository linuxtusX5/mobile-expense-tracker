// RootLayout.tsx
import OnboardingScreen from "@/components/OnboardingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.removeItem("hasLaunched");

    const checkOnboarding = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      console.log("✔️ hasLaunched from storage:", hasLaunched);

      if (hasLaunched === null) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasLaunched", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={finishOnboarding} />;
  }

  return <Slot />;
}
