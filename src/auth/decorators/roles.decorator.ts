import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

// => unique identifier for storing tand retriving role requiremnts as metadata on route handler

export const ROLES_KEY = 'roles';
//=> roles decorator marks the routes with the roles that are allowed to access them
//=> roles guard will later reads this metadata to check to if the user has permission
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
