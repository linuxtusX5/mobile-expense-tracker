import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type CurrencyState = {
  currency: string;
  setCurrency: (currency: string) => void;
  loadCurrency: () => void;
};

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "USD",

  setCurrency: (currency) => {
    AsyncStorage.setItem("selectedCurrency", currency);
    set({ currency });
  },

  loadCurrency: async () => {
    const stored = await AsyncStorage.getItem("selectedCurrency");
    if (stored) {
      set({ currency: stored });
    }
  },
}));
