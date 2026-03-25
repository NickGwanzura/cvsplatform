import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';
import AppHeader from './AppHeader';
import AppSideNav from './AppSideNav';
import MgrDashboard from '../../views/MgrDashboard';
import MgrNewRequest from '../../views/MgrNewRequest';
import AccDashboard from '../../views/AccDashboard';
import BmDashboard from '../../views/BmDashboard';
import ProcDashboard from '../../views/ProcDashboard';
import AdminDashboard from '../../views/AdminDashboard';
import ExecDashboard from '../../views/ExecDashboard';

const VIEWS = {
  'mgr-dashboard':   <MgrDashboard />,
  'mgr-new-request': <MgrNewRequest />,
  'acc-dashboard':   <AccDashboard />,
  'bm-dashboard':    <BmDashboard />,
  'proc-dashboard':  <ProcDashboard />,
  'admin-dashboard': <AdminDashboard />,
  'exec-dashboard':  <ExecDashboard />,
};

export default function AppShell() {
  const { activeView } = useApp();
  return (
    <div style={{ display: 'block', height: '100vh' }}>
      <AppHeader />
      <AppSideNav />
      <div className="cvs-content-area">
        {VIEWS[activeView] || null}
      </div>
    </div>
  );
}
