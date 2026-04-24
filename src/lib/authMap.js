// Translate the backend's auth/user payload into the shape the app uses
// internally. Backend returns role codes like "ADMIN", "SHOP_MANAGER" under
// access_context.roles[]; the UI keys ROLES by "admin", "manager", etc.

const ROLE_CODE_MAP = {
  ADMIN: 'admin',
  SYSTEM_ADMIN: 'admin',
  EXECUTIVE: 'executive',
  EXEC: 'executive',
  SHOP_MANAGER: 'manager',
  MANAGER: 'manager',
  BRAND_MANAGER: 'brandmgr',
  BRAND_MGR: 'brandmgr',
  BRANDMGR: 'brandmgr',
  BRAND_ACCOUNTANT: 'accountant',
  ACCOUNTANT: 'accountant',
  PROCUREMENT: 'procurement',
  PROCUREMENT_OFFICER: 'procurement',
};

export function mapRoleCode(code) {
  if (!code) return '';
  const upper = String(code).trim().toUpperCase();
  if (ROLE_CODE_MAP[upper]) return ROLE_CODE_MAP[upper];
  // Fallback: lowercase — if the backend happens to send an already-canonical key.
  return upper.toLowerCase();
}

export function pickPrimaryRoleCode(accessContext) {
  const roles = accessContext?.roles;
  if (!Array.isArray(roles) || roles.length === 0) return '';
  // Prefer a global role if present.
  const preferred = roles.find((r) => r?.scope_type === 'global') || roles[0];
  return preferred?.code || '';
}

// Normalise either a login response or a getMyProfile response into:
//   { token, roleCode, roleKey, user: { id, name, email }, accessContext }
export function normalizeAuth(payload) {
  const user = payload?.user || payload || {};
  const accessContext = payload?.access_context || payload?.accessContext || null;
  const roleCode = pickPrimaryRoleCode(accessContext) || user?.role || '';
  return {
    token: payload?.token || '',
    roleCode,
    roleKey: mapRoleCode(roleCode),
    user: {
      id: user.id || '',
      name: user.full_name || user.name || '',
      email: user.email || '',
    },
    accessContext,
  };
}
