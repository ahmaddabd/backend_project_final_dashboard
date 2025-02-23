import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  STORE_OWNER = "store_owner",
  STORE_MANAGER = "store_manager",
  STORE_STAFF = "store_staff",
  CUSTOMER = "customer",
}
