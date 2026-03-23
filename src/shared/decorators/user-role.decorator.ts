import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'generated/prisma/enums';

/**
 * Decorator that attaches one or more required roles to a route handler.
 *
 * Used in conjunction with `AuthRoleGuard`, which reads this metadata
 * and compares it against the authenticated user's role before allowing access.
 *
 * @param roles - One or more `ROLE` enum values that are permitted to access the route.
 *
 * @example
 * // Allow only admins
 * @Roles(ROLE.ADMIN)
 * @UseGuards(AuthRoleGuard)
 * @Get('students')
 * getAllStudents() { ... }
 *
 * @example
 * // Allow multiple roles
 * @Roles(ROLE.ADMIN, ROLE.INSTRUCTOR)
 * @UseGuards(AuthRoleGuard)
 * @Get('reports')
 * getReports() { ... }
 *
 * @see {@link AuthRoleGuard} for the guard that enforces this metadata.
 */
export const Roles = (...roles: ROLE[]) => SetMetadata('roles', roles);