import { z } from 'zod';
import { auditSchema, emailSchema, phoneNumberSchema } from '../shared/primitives';
import { platformRoleSchema, workspaceRoleSchema } from '../shared/roles';

/**
 * Perfil global do usuário (`users/{uid}`). Espelha claims para leitura em app,
 * mas a autorização real vem sempre dos custom claims / Security Rules.
 */
export const userSchema = z
  .object({
    uid: z.string().min(1),
    displayName: z.string().trim().min(1).max(120),
    email: emailSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
    photoUrl: z.string().url().optional(),
    platformRole: platformRoleSchema.optional(),
    /** Workspaces dos quais o usuário participa e o papel em cada um. */
    workspaces: z.record(z.string(), workspaceRoleSchema).default({}),
    disabled: z.boolean().default(false),
  })
  .merge(auditSchema);
export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = userSchema
  .pick({ displayName: true, email: true, phoneNumber: true, photoUrl: true })
  .partial({ email: true, phoneNumber: true, photoUrl: true });
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
