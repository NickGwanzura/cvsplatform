import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMyProfile, logout as apiLogout, logoutAllSessions, listCurrencies } from '../lib/cvsApi';
import { ROLES } from '../data/mockData';
import { normalizeAuth } from '../lib/authMap';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(
    typeof window !== 'undefined' && !!localStorage.getItem('token')
  );
  const [activeView, setActiveView] = useState('');
  const [activeNavIdx, setActiveNavIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [headerTitle, setHeaderTitle] = useState('Dashboard');
  const [toasts, setToasts] = useState([]);
  // modal open state
  const [modals, setModals] = useState({});
  // batch selection for BM dashboard
  const [batchSelected, setBatchSelected] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [currency, setCurrency] = useState('USD');
  const toggleCurrency = useCallback(() => setCurrency(c => c === 'USD' ? 'ZWL' : 'USD'), []);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listCurrencies()
      .then((list) => !cancelled && setCurrencies(Array.isArray(list) ? list : []))
      .catch(() => { /* lookup is non-critical */ });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((roleKey, roleData) => {
    setSession({ roleKey, ...roleData });
    setActiveView(roleData.nav[0].v);
    setActiveNavIdx(0);
    setActiveTab(roleData.nav[0].tab ?? 0);
    setHeaderTitle(roleData.nav[0].lb);
    const firstName = (roleData.name || '').split(' ')[0] || 'there';
    addToast('ok', `Welcome back, ${firstName}`, `${roleData.label} · ${roleData.brand}`);
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    localStorage.removeItem('token');
    setSession(null);
    setActiveView('');
    setActiveNavIdx(0);
    setActiveTab(0);
    setBatchSelected([]);
  }, []);

  const logoutEverywhere = useCallback(async () => {
    await logoutAllSessions().catch(() => {});
    localStorage.removeItem('token');
    setSession(null);
    setActiveView('');
    setActiveNavIdx(0);
    setActiveTab(0);
    setBatchSelected([]);
  }, []);

  useEffect(() => {
    if (!bootstrapping) return;
    let cancelled = false;
    getMyProfile()
      .then((raw) => {
        if (cancelled) return;
        const auth = normalizeAuth(raw);
        const roleData = ROLES[auth.roleKey];
        if (!roleData) {
          localStorage.removeItem('token');
          return;
        }
        const nav0 = roleData.nav[0];
        setSession({
          roleKey: auth.roleKey,
          ...roleData,
          name: auth.user.name || auth.user.email || '',
          email: auth.user.email || '',
        });
        setActiveView(nav0.v);
        setActiveNavIdx(0);
        setActiveTab(nav0.tab ?? 0);
        setHeaderTitle(nav0.lb);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bootstrapping]);

  const navigate = useCallback((navItem, idx) => {
    setActiveView(navItem.v);
    setActiveNavIdx(idx);
    setActiveTab(navItem.tab ?? 0);
    setHeaderTitle(navItem.lb);
    setNavOpen(false);
  }, []);

  const addToast = useCallback((type, title, sub) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, title, sub }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const openModal = useCallback((name) => setModals(m => ({ ...m, [name]: true })), []);
  const closeModal = useCallback((name) => setModals(m => ({ ...m, [name]: false })), []);

  return (
    <AppContext.Provider value={{
      session, login, logout, logoutEverywhere, bootstrapping,
      activeView, activeNavIdx, activeTab, navigate, headerTitle,
      toasts, addToast, dismissToast,
      modals, openModal, closeModal,
      batchSelected, setBatchSelected,
      navOpen, setNavOpen,
      brandFilter, setBrandFilter,
      currency, setCurrency, toggleCurrency, currencies,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
