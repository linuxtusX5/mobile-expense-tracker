import OnboardingScreen from "@/components/OnboardingScreen";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // 🛠️ Dev only
    // AsyncStorage.removeItem("hasLaunched");
    // 🛠️ Dev only
    const checkOnboarding = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      setShowOnboarding(hasLaunched === null);
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
