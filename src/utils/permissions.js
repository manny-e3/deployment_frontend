// src/utils/permissions.js
// Exact Role-Based Access Control map supporting Super Admin, Admin, Deployer, and Viewer

const ALL = ['SUPER_ADMIN', 'ADMIN', 'DEPLOYER', 'VIEWER'];
const DEPLOYERS = ['SUPER_ADMIN', 'ADMIN', 'DEPLOYER'];
const ADMINS = ['SUPER_ADMIN', 'ADMIN'];
const SUPER_ADMINS = ['SUPER_ADMIN'];

export const PERMISSIONS = {
  'projects:view': ALL,
  'servers:view': ALL,
  'deployments:view': ALL,
  'deploy:create': DEPLOYERS,
  'deploy:cancel': DEPLOYERS,
  'deploy:rollback': DEPLOYERS,
  'projects:manage': ADMINS,
  'servers:manage': ADMINS,
  'users:manage': ADMINS,
  'users:onboard': ADMINS,
  'audit:view': ADMINS,
  'organization:manage': SUPER_ADMINS,
};

/**
 * Check if a user's role is authorized to perform an action.
 * @param {string} role - 'SUPER_ADMIN' | 'ADMIN' | 'DEPLOYER' | 'VIEWER'
 * @param {string} action - key in PERMISSIONS
 * @returns {boolean}
 */
export const can = (role, action) => {
  if (!role) return false;
  const normalized = role.toUpperCase();
  if (normalized === 'SUPER_ADMIN') return true;
  return PERMISSIONS[action]?.includes(normalized) ?? false;
};
