import axios from 'axios';

const baseURL = import.meta.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

// Debug logging — set NEXT_PUBLIC_API_DEBUG=false to silence. Default on.
const DEBUG = import.meta.env.NEXT_PUBLIC_API_DEBUG !== 'false';

if (DEBUG) {
  console.log(
    '%c[cvsApi] boot',
    'color:#0f62fe;font-weight:bold',
    { baseURL, origin: typeof window !== 'undefined' ? window.location.origin : null }
  );
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Redact obvious secrets from logs.
const redact = (v) => (typeof v === 'string' && v.length > 0 ? `${v.slice(0, 4)}…(${v.length})` : v);
const maskPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const clone = Array.isArray(data) ? [...data] : { ...data };
  for (const k of Object.keys(clone)) {
    if (/password|token|secret|authorization/i.test(k)) clone[k] = redact(clone[k]);
  }
  return clone;
};

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.metadata = { startedAt: performance.now() };
    if (DEBUG) {
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      console.groupCollapsed(
        `%c[cvsApi] → ${config.method?.toUpperCase()} ${fullUrl}`,
        'color:#0f62fe'
      );
      console.log('url     ', fullUrl);
      console.log('method  ', config.method?.toUpperCase());
      console.log('headers ', { ...config.headers, Authorization: token ? `Bearer ${redact(token)}` : undefined });
      if (config.params) console.log('params  ', config.params);
      if (config.data) console.log('body    ', maskPayload(config.data));
      console.groupEnd();
    }
    return config;
  },
  (error) => {
    console.error('[cvsApi] request setup failed', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      const ms = (performance.now() - (response.config.metadata?.startedAt || performance.now())).toFixed(0);
      console.log(
        `%c[cvsApi] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${ms}ms)`,
        'color:#24a148'
      );
    }
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const ms = cfg.metadata?.startedAt
      ? (performance.now() - cfg.metadata.startedAt).toFixed(0)
      : '?';
    const status = error.response?.status;
    const url = `${cfg.baseURL || ''}${cfg.url || ''}`;
    const label = status ? `HTTP ${status}` : (error.code || 'Network error');

    console.groupCollapsed(
      `%c[cvsApi] ✗ ${label} ${cfg.method?.toUpperCase() || ''} ${url} (${ms}ms)`,
      'color:#da1e28;font-weight:bold'
    );
    console.log('message     ', error.message);
    if (error.code) console.log('code        ', error.code);
    if (status) {
      console.log('status      ', status, error.response?.statusText);
      console.log('response    ', error.response?.data);
      console.log('resHeaders  ', error.response?.headers);
    } else {
      // Network / CORS / mixed-content / DNS — no response object.
      console.log('hint        ', 'No response received. Common causes: network offline, CORS block, mixed-content (HTTPS page → HTTP API), DNS failure, server unreachable.');
    }
    console.log('request     ', {
      method: cfg.method?.toUpperCase(),
      url,
      headers: cfg.headers,
      body: maskPayload(cfg.data),
    });
    if (error.stack) console.log('stack       ', error.stack);
    console.groupEnd();

    if (status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) =>
  api.post('/auth/login', data).then((r) => r.data);

export const getMyProfile = () =>
  api.get('/auth/me').then((r) => r.data);

export const changePassword = (data) =>
  api.post('/auth/change-password', data).then((r) => r.data);

export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data).then((r) => r.data);

export const logoutAll = () =>
  api.post('/auth/logout').then((r) => r.data);

export const acceptInvite = (data) =>
  api.post('/auth/accept-invite', data).then((r) => r.data);

// Completes a password reset from an email-link token.
// Payload: { email, token, password, password_confirmation }
export const completePasswordReset = (data) =>
  api.post('/auth/reset-password', data).then((r) => r.data);

// Unwrap Laravel's paginated { current_page, data: [...], ... } into just the array.
const unwrap = (r) => (Array.isArray(r.data?.data) ? r.data.data : r.data);

// Users
export const listUsers = () => api.get('/users').then(unwrap);
export const showUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const createUser = (data) => api.post('/users', data).then((r) => r.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data);
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, { status }).then((r) => r.data);
// Assign a role (+ optional brand/shop scope) to an existing user.
// Payload: { role_id, brand_id?, shop_id? }
export const assignUserRole = (userId, data) =>
  api.post(`/users/${userId}/assignments`, data).then((r) => r.data);

// Roles
export const listRoles = () => api.get('/roles').then(unwrap);
// Replace the permission set on a role. Payload: { permission_ids: [uuid, ...] }
export const syncRolePermissions = (roleId, permissionIds) =>
  api.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds }).then((r) => r.data);

// Permissions
export const listPermissions = () => api.get('/permissions').then(unwrap);

// Brands
export const listBrands = () => api.get('/brand-shop/brands').then(unwrap);
export const showBrand = (id) => api.get(`/brand-shop/brands/${id}`).then((r) => r.data);
export const createBrand = (data) => api.post('/brand-shop/brands', data).then((r) => r.data);
export const updateBrand = (id, data) => api.put(`/brand-shop/brands/${id}`, data).then((r) => r.data);
export const listShopsForBrand = (brandId) =>
  api.get(`/brand-shop/brands/${brandId}/shops`).then(unwrap);

// Shops
export const listShops = () => api.get('/brand-shop/shops').then(unwrap);
export const showShop = (id) => api.get(`/brand-shop/shops/${id}`).then((r) => r.data);
export const createShop = (data) => api.post('/brand-shop/shops', data).then((r) => r.data);
export const updateShop = (id, data) => api.put(`/brand-shop/shops/${id}`, data).then((r) => r.data);

// Invitations
export const listInvitations = () => api.get('/invitations').then(unwrap);
export const inviteUser = (data) => api.post('/invitations', data).then((r) => r.data);
export const showInvitation = (id) => api.get(`/invitations/${id}`).then((r) => r.data);
export const resendInvitation = (id) => api.post(`/invitations/${id}/resend`).then((r) => r.data);
export const revokeInvite = (id) => api.post(`/invitations/${id}/revoke`).then((r) => r.data);

// Procurement — Products
export const listProcurementProducts = () =>
  api.get('/procurement/products').then(unwrap);
export const showProcurementProduct = (id) =>
  api.get(`/procurement/products/${id}`).then((r) => r.data);
export const createProcurementProduct = (data) =>
  api.post('/procurement/products', data).then((r) => r.data);
export const updateProcurementProduct = (id, data) =>
  api.put(`/procurement/products/${id}`, data).then((r) => r.data);
export const deleteProcurementProduct = (id) =>
  api.delete(`/procurement/products/${id}`).then((r) => r.data);

// Procurement — Categories
export const listProcurementCategories = () =>
  api.get('/procurement/categories').then(unwrap);
export const showProcurementCategory = (id) =>
  api.get(`/procurement/categories/${id}`).then((r) => r.data);
export const createProcurementCategory = (data) =>
  api.post('/procurement/categories', data).then((r) => r.data);
export const updateProcurementCategory = (id, data) =>
  api.put(`/procurement/categories/${id}`, data).then((r) => r.data);
export const deleteProcurementCategory = (id) =>
  api.delete(`/procurement/categories/${id}`).then((r) => r.data);

// Procurement — Suppliers
export const listSuppliers = () => api.get('/procurement/suppliers').then(unwrap);
export const showSupplier = (id) =>
  api.get(`/procurement/suppliers/${id}`).then((r) => r.data);
export const createSupplier = (data) =>
  api.post('/procurement/suppliers', data).then((r) => r.data);
export const updateSupplier = (id, data) =>
  api.put(`/procurement/suppliers/${id}`, data).then((r) => r.data);
export const deleteSupplier = (id) =>
  api.delete(`/procurement/suppliers/${id}`).then((r) => r.data);

// Supplier workflow
export const approveSupplier = (id) =>
  api.post(`/procurement/suppliers/${id}/approve`).then((r) => r.data);
export const rejectSupplier = (id, reason) =>
  api.post(`/procurement/suppliers/${id}/reject`, { reason }).then((r) => r.data);
export const suspendSupplier = (id) =>
  api.post(`/procurement/suppliers/${id}/suspend`).then((r) => r.data);
export const reactivateSupplier = (id) =>
  api.post(`/procurement/suppliers/${id}/reactivate`).then((r) => r.data);

// Sync the brands a supplier is scoped to. Payload: { brand_ids: [uuid, ...] }
export const syncSupplierBrands = (id, brandIds) =>
  api
    .post(`/procurement/suppliers/${id}/brands`, { brand_ids: brandIds })
    .then((r) => r.data);

// Supplier documents
export const listSupplierDocuments = (supplierId) =>
  api.get(`/procurement/suppliers/${supplierId}/documents`).then(unwrap);

// Upload a supplier document. Accepts either a FormData instance or
// { document_type, title, file } — the latter is converted to FormData here.
// Content-Type is left unset so the browser sets the multipart boundary.
export const uploadSupplierDocument = (supplierId, payload) => {
  const form = payload instanceof FormData ? payload : (() => {
    const fd = new FormData();
    if (payload.document_type != null) fd.append('document_type', payload.document_type);
    if (payload.title != null) fd.append('title', payload.title);
    if (payload.file) fd.append('file', payload.file);
    return fd;
  })();
  return api
    .post(`/procurement/suppliers/${supplierId}/documents`, form, {
      headers: { 'Content-Type': undefined },
    })
    .then((r) => r.data);
};

export const approveSupplierDocument = (supplierId, documentId) =>
  api
    .post(`/procurement/suppliers/${supplierId}/documents/${documentId}/approve`)
    .then((r) => r.data);

export const rejectSupplierDocument = (supplierId, documentId, reason) =>
  api
    .post(`/procurement/suppliers/${supplierId}/documents/${documentId}/reject`, { reason })
    .then((r) => r.data);

export const deleteSupplierDocument = (supplierId, documentId) =>
  api
    .delete(`/procurement/suppliers/${supplierId}/documents/${documentId}`)
    .then((r) => r.data);

// Supplier ↔ Product links
export const listSupplierProducts = (supplierId) =>
  api.get(`/procurement/suppliers/${supplierId}/products`).then(unwrap);

export const linkSupplierProduct = (supplierId, productId) =>
  api
    .post(`/procurement/suppliers/${supplierId}/products`, { product_id: productId })
    .then((r) => r.data);

export const updateSupplierProduct = (supplierId, productId, data) =>
  api
    .put(`/procurement/suppliers/${supplierId}/products/${productId}`, data)
    .then((r) => r.data);

export const unlinkSupplierProduct = (supplierId, productId) =>
  api
    .delete(`/procurement/suppliers/${supplierId}/products/${productId}`)
    .then((r) => r.data);

export default api;
