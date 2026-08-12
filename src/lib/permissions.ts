import { UserRole, Permission } from "@/types/user";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  manager: [
    "viewDashboard",
    "manageMembers",
    "approveJoinRequests",
    "manageMeals",
    "manageDeposits",
    "manageExpenses",
    "manageBazaar",
    "manageMonths",
    "manageReports",
    "manageSettings",
    "changeManager",
  ],
  member: [
    "viewDashboard",
  ],
};

/**
 * Check if a specific role possesses a permission
 */
export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const effectiveRole = (role === "owner" || role === "admin" || role === "manager") ? "manager" : "member";
  const permissions = ROLE_PERMISSIONS[effectiveRole as UserRole];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if user is managerial (manager)
 */
export function isManagerialRole(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

/**
 * Check if user is admin (manager)
 */
export function isAdminRole(role: string | undefined | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}
