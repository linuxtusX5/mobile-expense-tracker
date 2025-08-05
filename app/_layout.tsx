// app/_layout.tsx
import OnboardingScreen from "@/components/OnboardingScreen";
import AuthScreen from "@/components/AuthScreen";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native"
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        setShowOnboarding(hasLaunched === null);
      } catch (err) {
        console.error("Failed to check onboarding:", err);
        setShowOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  if (authLoading || showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onDone={async () => {
          await AsyncStorage.setItem("hasLaunched", "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <ExpenseProvider>
      <Slot />
    </ExpenseProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}
