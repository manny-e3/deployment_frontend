// src/utils/permissions.js
// Exact Role-Based Access Control map matching the backend server (utils/permissions.js)

const ALL = ['ADMIN', 'DEPLOYER', 'VIEWER'];
const DEPLOYERS = ['ADMIN', 'DEPLOYER'];
const ADMINS = ['ADMIN'];

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
  'audit:view': ADMINS,
};

/**
 * Check if a user's role is authorized to perform an action.
 * @param {string} role - 'ADMIN' | 'DEPLOYER' | 'VIEWER'
 * @param {string} action - key in PERMISSIONS
 * @returns {boolean}
 */
export const can = (role, action) => {
  if (!role) return false;
  return PERMISSIONS[action]?.includes(role.toUpperCase()) ?? false;
};
