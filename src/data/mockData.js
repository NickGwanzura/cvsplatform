export const ROLES = {
  manager: {
    label: 'Shop Manager', name: 'K. Mutasa', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'mgr-dashboard',   lb: 'Dashboard',    tab: 0 },
      { v: 'mgr-new-request', lb: 'New Request',  tab: 0 },
      { v: 'mgr-dashboard',   lb: 'My Requests',  tab: 0, badge: '3' },
    ]
  },
  accountant: {
    label: 'Brand Accountant', name: 'C. Mutandwa', brand: 'Pizza Inn', color: '#da1e28', code: 'PI',
    nav: [
      { v: 'acc-dashboard', lb: 'Dashboard',         tab: 0, badge: '7', alert: true },
      { v: 'acc-dashboard', lb: 'Review Queue',      tab: 1, badge: '7' },
      { v: 'acc-dashboard', lb: 'Budget Management', tab: 2 },
      { v: 'reports',       lb: 'Reports' },
    ]
  },
  brandmgr: {
    label: 'Brand Manager', name: 'T. Ndlovu', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'bm-dashboard', lb: 'Dashboard',     tab: 0, badge: '5', alert: true },
      { v: 'bm-dashboard', lb: 'InnBucks Sales',tab: 1, badge: 'Live', live: true },
      { v: 'bm-dashboard', lb: 'Audit Log',     tab: 2 },
    ]
  },
  procurement: {
    label: 'Procurement', name: 'R. Chikwanda', brand: 'Head Office', color: '#6929c4', code: 'HO',
    nav: [
      { v: 'proc-dashboard', lb: 'Overview',         tab: 0 },
      { v: 'proc-dashboard', lb: 'Supplier Trends',  tab: 1 },
      { v: 'proc-dashboard', lb: 'Product Trends',   tab: 2 },
      { v: 'proc-dashboard', lb: 'Supplier Portal',  tab: 3, badge: '2' },
    ]
  },
  admin: {
    label: 'System Admin', name: 'S. Moyo', brand: 'Head Office', color: '#005f73', code: 'AD',
    nav: [
      { v: 'admin-dashboard', lb: 'Users & Invites',      tab: 0 },
      { v: 'admin-dashboard', lb: 'Roles & Permissions',  tab: 1 },
      { v: 'admin-dashboard', lb: 'System Audit',         tab: 2 },
    ]
  },
  executive: {
    label: 'Executive', name: 'D. Chinhoro', brand: 'Simbisa Group', color: '#161616', code: 'EX',
    nav: [
      { v: 'exec-dashboard', lb: 'Group Overview',   tab: 0 },
      { v: 'exec-dashboard', lb: 'Brand Breakdown',  tab: 1 },
      { v: 'exec-dashboard', lb: 'InnBucks Sales',   tab: 2, badge: 'Live', live: true },
      { v: 'exec-dashboard', lb: 'Supplier Trends',  tab: 3 },
      { v: 'reports',        lb: 'Reports' },
    ]
  }
};

export const DEMO_USERS = [
  { role: 'manager',     name: 'K. Mutasa',    brand: 'Chicken Inn — Sh-14', label: 'Shop Manager' },
  { role: 'accountant',  name: 'C. Mutandwa',  brand: 'Pizza Inn',           label: 'Brand Accountant' },
  { role: 'brandmgr',    name: 'T. Ndlovu',    brand: 'Chicken Inn',         label: 'Brand Manager' },
  { role: 'procurement', name: 'R. Chikwanda', brand: 'Head Office',         label: 'Procurement' },
  { role: 'admin',       name: 'S. Moyo',      brand: 'System Admin',        label: 'Admin' },
  { role: 'executive',   name: 'D. Chinhoro',  brand: 'Group CEO',           label: 'Executive' },
];

export const BRANDS = ['Chicken Inn','Pizza Inn','Creamy Inn',"Nando's",'Steers',"Roco Mamma's",'Ocean Basket','Hefelies',"Pastino's"];
