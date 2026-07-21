/** Campos denormalizados no Firestore para Security Rules compatíveis com list queries. */
export function tenantFirestoreFields(ownerId: string, workspaceId: string) {
  return {
    ownerId,
    workspaceId,
    workspaceStatus: 'active' as const,
  };
}
