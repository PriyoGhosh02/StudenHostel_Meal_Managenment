import { UserRole, Permission } from "@/types/user";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
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
  admin: [
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
  manager: [
    "viewDashboard",
    "manageMeals",
    "manageDeposits",
    "manageExpenses",
    "manageBazaar",
    "manageMonths",
    "manageReports",
  ],
  member: [
    "viewDashboard",
  ],
};

/**
 * Check if a specific role possesses a permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if user is managerial (owner, admin, or manager)
 */
export function isManagerialRole(role: UserRole | undefined | null): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

/**
 * Check if user is admin (owner or admin)
 */
export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === "owner" || role === "admin";
}
