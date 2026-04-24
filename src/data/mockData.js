export const ROLES = {
  manager: {
    label: 'Shop Manager', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'mgr-dashboard',   lb: 'Dashboard',    tab: 0 },
      { v: 'mgr-new-request', lb: 'New Request',  tab: 0 },
      { v: 'mgr-dashboard',   lb: 'My Requests',  tab: 0 },
      { v: 'reports',         lb: 'Reports' },
    ]
  },
  accountant: {
    label: 'Brand Accountant', brand: 'Pizza Inn', color: '#da1e28', code: 'PI',
    nav: [
      { v: 'acc-dashboard', lb: 'Dashboard',         tab: 0 },
      { v: 'acc-dashboard', lb: 'Review Queue',      tab: 1 },
      { v: 'acc-dashboard', lb: 'Budget Management', tab: 2 },
      { v: 'reports',       lb: 'Reports' },
    ]
  },
  brandmgr: {
    label: 'Brand Manager', brand: 'Chicken Inn', color: '#0f62fe', code: 'CI',
    nav: [
      { v: 'bm-dashboard', lb: 'Dashboard',     tab: 0 },
      { v: 'bm-dashboard', lb: 'InnBucks Sales',tab: 1, badge: 'Live', live: true },
      { v: 'reports',      lb: 'Reports' },
    ]
  },
  procurement: {
    label: 'Procurement', brand: 'Head Office', color: '#6929c4', code: 'HO',
    nav: [
      { v: 'proc-dashboard', lb: 'Overview',            tab: 0 },
      { v: 'proc-dashboard', lb: 'Supplier Analytics',  tab: 1 },
      { v: 'proc-dashboard', lb: 'Product Analytics',   tab: 2 },
      { v: 'proc-dashboard', lb: 'Supplier Portal',     tab: 3 },
      { v: 'reports',        lb: 'Reports' },
    ]
  },
  admin: {
    label: 'System Admin', brand: 'Head Office', color: '#005f73', code: 'AD',
    nav: [
      { v: 'admin-dashboard', lb: 'Users & Invites',      tab: 0 },
      { v: 'admin-dashboard', lb: 'Roles & Permissions',  tab: 1 },
      { v: 'admin-dashboard', lb: 'System Audit',         tab: 2 },
    ]
  },
  executive: {
    label: 'Executive', brand: 'Simbisa Group', color: '#161616', code: 'EX',
    nav: [
      { v: 'exec-dashboard', lb: 'Group Overview',     tab: 0 },
      { v: 'exec-dashboard', lb: 'Brand Breakdown',    tab: 1 },
      { v: 'exec-dashboard', lb: 'InnBucks Sales',     tab: 2, badge: 'Live', live: true },
      { v: 'exec-dashboard', lb: 'Supplier Analytics', tab: 3 },
      { v: 'reports',        lb: 'Reports' },
    ]
  }
};

export const BRANDS = ['Chicken Inn','Pizza Inn','Creamy Inn',"Nando's",'Steers',"Roco Mamma's",'Ocean Basket','Hefelies',"Pastino's"];
