import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'generated/prisma/enums';

export const Roles = (...roles: ROLE[]) => SetMetadata('roles', roles);
