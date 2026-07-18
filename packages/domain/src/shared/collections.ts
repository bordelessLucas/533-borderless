/**
 * Fonte única de verdade para os caminhos de coleções no Firestore.
 * Estrutura multi-tenant: quase tudo vive sob `workspaces/{workspaceId}`.
 */
export const COLLECTIONS = {
  platformAdmins: 'platformAdmins',
  users: 'users',
  workspaces: 'workspaces',
  subscriptions: 'subscriptions',
  webhookEvents: 'webhookEvents',
} as const;

export const WORKSPACE_SUBCOLLECTIONS = {
  members: 'members',
  services: 'services',
  clients: 'clients',
  appointments: 'appointments',
  availability: 'availability',
  timeBlocks: 'timeBlocks',
  dailySummaries: 'dailySummaries',
  notifications: 'notifications',
  deviceTokens: 'deviceTokens',
} as const;

export const workspacePath = (workspaceId: string) =>
  `${COLLECTIONS.workspaces}/${workspaceId}` as const;

export const workspaceSubPath = (
  workspaceId: string,
  sub: (typeof WORKSPACE_SUBCOLLECTIONS)[keyof typeof WORKSPACE_SUBCOLLECTIONS],
) => `${workspacePath(workspaceId)}/${sub}` as const;
