import { useState, useEffect, useCallback } from "react";

export const useAccountingTabs = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Keyboard shortcuts for tabs
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.altKey) {
      const tabMap: Record<string, string> = {
        "1": "accounts",
        "2": "entries",
        "3": "budgets",
        "4": "trial-balance",
        "5": "ledger",
        "6": "bank-accounts",
        "7": "cash-flow",
      };
      
      if (tabMap[e.key]) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Simulate loading when switching tabs
  const handleTabChange = useCallback((value: string) => {
    setIsLoadingTab(true);
    setActiveTab(value);
    setTimeout(() => setIsLoadingTab(false), 300);
  }, []);

  return {
    activeTab,
    isLoadingTab,
    handleTabChange,
  };
};
