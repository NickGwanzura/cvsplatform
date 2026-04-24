import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/Login/LoginPage';
import ResetPasswordPage from './components/Login/ResetPasswordPage';
import AppShell from './components/Layout/AppShell';
import ToastContainer from './components/shared/ToastContainer';
import BetaPill from './components/shared/BetaPill';

function Inner() {
  const { session, bootstrapping } = useApp();
  if (bootstrapping) return null;

  // Minimal path-based routing. The app is otherwise session-driven.
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/reset-password') {
    return (
      <>
        <ResetPasswordPage />
        <ToastContainer />
        <BetaPill />
      </>
    );
  }

  return (
    <>
      <LoginPage />
      {session && <AppShell />}
      <ToastContainer />
      <BetaPill />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
