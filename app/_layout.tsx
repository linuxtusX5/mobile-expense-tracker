import OnboardingScreen from "@/components/OnboardingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("Checking onboarding...");

    AsyncStorage.removeItem("hasLaunched"); // TEMP for testing

    const checkOnboarding = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      console.log("hasLaunched:", hasLaunched);

      if (hasLaunched === null) {
        await AsyncStorage.setItem("hasLaunched", "true");
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showOnboarding) {
    // Pass a navigation prop to OnboardingScreen
    return <OnboardingScreen />;
  }

  return <Slot />; // Renders app/index.tsx or other pages
}
