import { z } from 'zod';
import { auditSchema } from '../shared/primitives';
import { workspaceRoleSchema } from '../shared/roles';

/**
 * Membro de um workspace (`workspaces/{id}/members/{uid}`).
 * Um membro que também atende (profissional) é marcado com `providesService`.
 */
export const workspaceMemberSchema = z
  .object({
    uid: z.string().min(1),
    workspaceId: z.string().min(1),
    role: workspaceRoleSchema,
    displayName: z.string().trim().min(1).max(120),
    /** Indica se este membro presta atendimento (aparece como recurso na agenda). */
    providesService: z.boolean().default(true),
    status: z.enum(['active', 'invited', 'disabled']).default('active'),
  })
  .merge(auditSchema);
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;

export const inviteMemberInputSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  displayName: z.string().trim().min(1).max(120),
  role: workspaceRoleSchema,
  providesService: z.boolean().default(true),
});
export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;
