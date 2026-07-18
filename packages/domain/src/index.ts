// Shared
export * from './shared/primitives.js';
export * from './shared/roles.js';
export * from './shared/collections.js';

// Identity & tenant
export * from './user/user.schema.js';
export * from './workspace/workspace.schema.js';
export * from './workspace/member.schema.js';

// Operation (App do profissional)
export * from './service/service.schema.js';
export * from './client/client.schema.js';
export * from './appointment/appointment.schema.js';
export * from './availability/availability.schema.js';

// Billing (Sócio247 ↔ profissional)
export * from './billing/subscription.schema.js';

// Automation (profissional ↔ cliente final + push interno)
export * from './notification/notification.schema.js';
