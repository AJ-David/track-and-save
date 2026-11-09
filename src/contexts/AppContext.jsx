import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DEFAULT_CURRENCY } from '../lib/constants';
import { useAuth } from './AuthContext';
import {
  convertAmount,
  getExchangeRate,
  formatExchangeRate,
  fetchLiveExchangeRates,
  getBaseCurrency as getStoredBaseCurrency,
  setBaseCurrency as setStoredBaseCurrency,
} from '../services/currencyService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { profile } = useAuth();

  // User's underlying ledger base currency
  const [baseCurrency, setBaseCurrencyState] = useState(() => {
    return getStoredBaseCurrency() || profile?.currency || DEFAULT_CURRENCY;
  });

  // Current active display currency (for viewing / converting)
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('spendwise_currency') || getStoredBaseCurrency() || DEFAULT_CURRENCY;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Fetch live exchange rates on mount
  useEffect(() => {
    fetchLiveExchangeRates();
  }, []);

  // Synchronize base currency if profile loads later
  useEffect(() => {
    if (profile?.currency && !localStorage.getItem('spendwise_base_currency')) {
      setBaseCurrencyState(profile.currency);
      setStoredBaseCurrency(profile.currency);
    }
  }, [profile?.currency]);

  // Set viewing display currency (triggers official exchange rate conversions across the app)
  const setCurrency = useCallback((newCurrency) => {
    if (!newCurrency) return;
    setCurrencyState(newCurrency);
    localStorage.setItem('spendwise_currency', newCurrency);
  }, []);

  // Set base ledger currency
  const setBaseCurrency = useCallback((newBase) => {
    if (!newBase) return;
    setBaseCurrencyState(newBase);
    setStoredBaseCurrency(newBase);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const isConverted = currency !== baseCurrency;

  const exchangeRate = useMemo(
    () => getExchangeRate(baseCurrency, currency),
    [baseCurrency, currency]
  );

  const convertFromBase = useCallback(
    (amount) => convertAmount(amount, baseCurrency, currency),
    [baseCurrency, currency]
  );

  const convertToBase = useCallback(
    (amount) => convertAmount(amount, currency, baseCurrency),
    [baseCurrency, currency]
  );

  // E.g. "1 USD ≈ ₦1,485.00"
  const rateBadgeText = useMemo(() => {
    if (!isConverted) return '';
    return formatExchangeRate(currency, baseCurrency);
  }, [isConverted, currency, baseCurrency]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      baseCurrency,
      setBaseCurrency,
      isConverted,
      exchangeRate,
      convertFromBase,
      convertToBase,
      rateBadgeText,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      closeSidebar,
      theme,
      setTheme,
    }),
    [
      currency,
      setCurrency,
      baseCurrency,
      setBaseCurrency,
      isConverted,
      exchangeRate,
      convertFromBase,
      convertToBase,
      rateBadgeText,
      sidebarOpen,
      theme,
      toggleSidebar,
      closeSidebar,
    ]
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
