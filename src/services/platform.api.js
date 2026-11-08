// src/services/platform.api.js
// Client API client for Platform Super Admin operations
import { api } from './api';

export const platformApi = {
  /** Get platform-wide KPIs, metrics, and recent activities */
  getOverview: () => api('/platform/overview'),

  /** List all organizations across platform */
  getOrganizations: (query) => api('/platform/organizations', { query }),

  /** Create new tenant organization */
  createOrganization: (body) => api('/platform/organizations', { method: 'POST', body }),

  /** Suspend or activate a tenant */
  toggleOrganizationStatus: (id, isActive) =>
    api(`/platform/organizations/${id}/status`, { method: 'PATCH', body: { isActive } }),

  /** List all platform users across all tenants */
  getUsers: (query) => api('/platform/users', { query }),

  /** Suspend or reactivate any user */
  toggleUserStatus: (id, isActive) =>
    api(`/platform/users/${id}/status`, { method: 'PATCH', body: { isActive } }),

  /** Elevate or revoke Super Admin privileges */
  toggleUserSuperAdmin: (id, isSuperAdmin) =>
    api(`/platform/users/${id}/super-admin`, { method: 'PATCH', body: { isSuperAdmin } }),

  /** Cross-tenant deployment stream */
  getDeployments: (query) => api('/platform/deployments', { query }),

  /** Server and queue infrastructure health */
  getSystemHealth: () => api('/platform/system-health'),

  /** List available database backups */
  getBackups: () => api('/platform/backups'),

  /** Trigger instant database backup */
  triggerBackup: () => api('/platform/backup', { method: 'POST' }),

  /** Platform-wide security audit logs */
  getAuditLogs: (query) => api('/platform/audit-logs', { query }),
};

