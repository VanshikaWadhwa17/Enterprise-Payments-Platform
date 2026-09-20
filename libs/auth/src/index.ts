// Public API surface of @epp/auth.
// Authentication, route guards, and permission checks shared across MFEs.
// Exports are added here as the auth flows are implemented.

export * from './lib/authentication/auth.service';
export * from './lib/authentication/auth-api-url.token';
export * from './lib/permissions/permissions';
export * from './lib/route-guards/auth.guard';
export * from './lib/route-guards/guest.guard';
export * from './lib/route-guards/permission.guard';
export * from './lib/route-guards/root-redirect.guard';
