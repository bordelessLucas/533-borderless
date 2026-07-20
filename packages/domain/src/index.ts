// Shared
export * from './shared/primitives';
export * from './shared/roles';
export * from './shared/collections';

// Identity & tenant
export * from './user/user.schema';
export * from './workspace/workspace.schema';
export * from './workspace/member.schema';

// Operation (App do profissional)
export * from './service/service.schema';
export * from './client/client.schema';
export * from './appointment/appointment.schema';
export * from './availability/availability.schema';

// Billing (Sócio247 ↔ profissional)
export * from './billing/subscription.schema';

// Automation (profissional ↔ cliente final + push interno)
export * from './notification/notification.schema';
