import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DEFAULT_CURRENCY } from '../lib/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('spendwise_currency') || DEFAULT_CURRENCY;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const setCurrency = useCallback((newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('spendwise_currency', newCurrency);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      closeSidebar,
      theme,
      setTheme,
    }),
    [currency, setCurrency, sidebarOpen, theme, toggleSidebar, closeSidebar]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
