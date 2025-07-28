import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  clearAllExpenses: () => Promise<void>;
  getTodayTotal: () => number;
  getWeeklyTotal: () => number;
  getMonthlyTotal: () => number;
  getCategoryTotals: () => Record<string, number>;
  getMonthlyExpenses: () => Record<string, number>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = "@expense_tracker_data";

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from storage on app start
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses).map(
          (expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })
        );
        setExpenses(parsedExpenses);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error("Error saving expenses:", error);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, ...updates } : expense
    );
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const clearAllExpenses = async () => {
    setExpenses([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const getTodayTotal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= today && expenseDate < tomorrow;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getWeeklyTotal = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return expenses
      .filter((expense) => new Date(expense.date) >= startOfWeek)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyTotal = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return expenses
      .filter((expense) => new Date(expense.date) >= startOfMonth)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = () => {
    return expenses.reduce((totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {} as Record<string, number>);
  };

  const getMonthlyExpenses = () => {
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const monthKey = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return monthlyTotals;
  };

  const value: ExpenseContextType = {
    expenses: expenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    addExpense,
    deleteExpense,
    updateExpense,
    clearAllExpenses,
    getTodayTotal,
    getWeeklyTotal,
    getMonthlyTotal,
    getCategoryTotals,
    getMonthlyExpenses,
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
};
