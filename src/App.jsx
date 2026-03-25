import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/Login/LoginPage';
import AppShell from './components/Layout/AppShell';
import ToastContainer from './components/shared/ToastContainer';

function Inner() {
  const { session } = useApp();
  return (
    <>
      <LoginPage />
      {session && <AppShell />}
      <ToastContainer />
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
