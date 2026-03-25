import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [activeView, setActiveView] = useState('');
  const [activeNavIdx, setActiveNavIdx] = useState(0);
  const [headerTitle, setHeaderTitle] = useState('Dashboard');
  const [toasts, setToasts] = useState([]);
  // modal open state
  const [modals, setModals] = useState({});
  // batch selection for BM dashboard
  const [batchSelected, setBatchSelected] = useState([]);

  const login = useCallback((roleKey, roleData) => {
    setSession({ roleKey, ...roleData });
    setActiveView(roleData.nav[0].v);
    setActiveNavIdx(0);
    setHeaderTitle(roleData.nav[0].lb);
    addToast('ok', `Welcome back, ${roleData.name.split(' ')[0]}`, `${roleData.label} · ${roleData.brand}`);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setActiveView('');
    setActiveNavIdx(0);
    setBatchSelected([]);
  }, []);

  const navigate = useCallback((navItem, idx) => {
    setActiveView(navItem.v);
    setActiveNavIdx(idx);
    setHeaderTitle(navItem.lb);
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
      session, login, logout,
      activeView, activeNavIdx, navigate, headerTitle,
      toasts, addToast, dismissToast,
      modals, openModal, closeModal,
      batchSelected, setBatchSelected,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
