import { z } from 'zod';

/**
 * Papéis da plataforma (Sócio247) — quem administra o backoffice.
 */
export const platformRoleSchema = z.enum(['platform_admin', 'platform_support']);
export type PlatformRole = z.infer<typeof platformRoleSchema>;

/**
 * Papéis dentro de um workspace (salão/barbearia/profissional).
 * owner: profissional dono do negócio (assinante).
 * staff: atendente/colaborador com acesso operacional à agenda.
 */
export const workspaceRoleSchema = z.enum(['workspace_owner', 'workspace_staff']);
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

/**
 * Custom claims gravados no token de autenticação do Firebase.
 * Usados pelas Security Rules para isolamento de tenant e autorização.
 */
export const authClaimsSchema = z.object({
  platformRole: platformRoleSchema.optional(),
  /** Mapa workspaceId -> papel do usuário naquele workspace. */
  workspaces: z.record(z.string(), workspaceRoleSchema).default({}),
});
export type AuthClaims = z.infer<typeof authClaimsSchema>;
