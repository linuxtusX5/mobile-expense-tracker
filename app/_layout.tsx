// app/_layout.tsx
import OnboardingScreen from "@/components/OnboardingScreen";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        setShowOnboarding(hasLaunched === null);
      } catch (err) {
        console.error("Failed to check onboarding:", err);
        setShowOnboarding(false); // Fallback if error
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

  return (
    <ExpenseProvider>
      <StatusBar style="auto" />
      {showOnboarding ? (
        <OnboardingScreen
          onDone={async () => {
            await AsyncStorage.setItem("hasLaunched", "true");
            setShowOnboarding(false);
          }}
        />
      ) : (
        <Slot />
      )}
    </ExpenseProvider>
  );
}
