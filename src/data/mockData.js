export const ROLES = {
  manager: {
    label: 'Shop Manager', name: 'K. Mutasa', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'mgr-dashboard', lb: 'Dashboard' },
      { v: 'mgr-new-request', lb: 'New Request' },
      { v: 'mgr-dashboard', lb: 'My Requests', badge: '3' },
    ]
  },
  accountant: {
    label: 'Brand Accountant', name: 'C. Mutandwa', brand: 'Pizza Inn', color: '#da1e28', code: 'PI',
    nav: [
      { v: 'acc-dashboard', lb: 'Dashboard', badge: '7', alert: true },
      { v: 'acc-dashboard', lb: 'Audit Log' },
    ]
  },
  brandmgr: {
    label: 'Brand Manager', name: 'T. Ndlovu', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'bm-dashboard', lb: 'Dashboard', badge: '5', alert: true },
      { v: 'bm-dashboard', lb: 'InnBucks Sales', badge: 'Live', live: true },
      { v: 'bm-dashboard', lb: 'Audit Log' },
    ]
  },
  procurement: {
    label: 'Procurement', name: 'R. Chikwanda', brand: 'Head Office', color: '#6929c4', code: 'HO',
    nav: [
      { v: 'proc-dashboard', lb: 'Procurement Dashboard' },
      { v: 'proc-dashboard', lb: 'Supplier Portal', badge: '2' },
      { v: 'proc-dashboard', lb: 'Audit Log' },
    ]
  },
  admin: {
    label: 'System Admin', name: 'S. Moyo', brand: 'Head Office', color: '#005f73', code: 'AD',
    nav: [
      { v: 'admin-dashboard', lb: 'Admin Dashboard' },
      { v: 'admin-dashboard', lb: 'Users & Invites' },
      { v: 'admin-dashboard', lb: 'System Audit' },
    ]
  },
  executive: {
    label: 'Executive', name: 'D. Chinhoro', brand: 'Simbisa Group', color: '#161616', code: 'EX',
    nav: [
      { v: 'exec-dashboard', lb: 'Executive Dashboard' },
      { v: 'exec-dashboard', lb: 'InnBucks Sales', badge: 'Live', live: true },
      { v: 'exec-dashboard', lb: 'KPIs & Analytics' },
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
