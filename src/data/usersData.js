// Role definitions — configuration data, not mock data
export const ROLE_DEFINITIONS = [
  {
    role: 'ADMIN',
    count: '3 users',
    description: 'Full administrative control over servers, API keys, Git hooks, and directory permissions.',
    permissions: [
      { text: 'Manage destination servers & credentials', granted: true },
      { text: 'Create, configure & delete projects', granted: true },
      { text: 'Invite, promote & deactivate users', granted: true },
      { text: 'Inspect full diagnostic audit streams', granted: true },
    ],
  },
  {
    role: 'DEPLOYER',
    count: '8 users',
    description: 'Operational release authority. Can trigger pipelines, inspect live outputs, and roll back code.',
    permissions: [
      { text: 'Trigger & cancel release runs', granted: true },
      { text: 'Execute instant one-click rollbacks', granted: true },
      { text: 'Stream stdout/stderr build logs', granted: true },
      { text: 'Cannot alter SSH keys or delete repos', granted: false },
    ],
  },
  {
    role: 'VIEWER',
    count: '3 users',
    description: 'Auditing and telemetry observer. Read-only visibility without trigger capabilities.',
    permissions: [
      { text: 'Monitor pipeline status & timelines', granted: true },
      { text: 'Read deployment histories & artifacts', granted: true },
      { text: 'Cannot deploy, cancel or alter settings', granted: false },
    ],
  },
]
