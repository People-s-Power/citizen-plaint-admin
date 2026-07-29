/**
 * Client-side mirror of the backend permission catalog
 * (`people-powApi-v5/src/admin/constants/admin-permissions.ts`).
 *
 * This copy exists purely so the UI can render instantly without waiting on a
 * round-trip, and so nav gating works offline/optimistically. The backend
 * remains the sole authority — never trust these checks for security.
 *
 * KEEP IN SYNC with the backend file when adding permissions.
 */

export const PERMISSION_WILDCARD = "*"

export const AdminPermission = {
  DashboardView: "dashboard.view",
  ContentView: "content.view",
  ContentModerate: "content.moderate",
  TasksView: "tasks.view",
  TasksManage: "tasks.manage",
  UsersView: "users.view",
  UsersManage: "users.manage",
  ReportsView: "reports.view",
  ReportsResolve: "reports.resolve",
  SubscriptionsView: "subscriptions.view",
  SubscriptionsManage: "subscriptions.manage",
  WithdrawalsView: "withdrawals.view",
  WithdrawalsApprove: "withdrawals.approve",
  HireRequestsView: "hire_requests.view",
  HireRequestsAssign: "hire_requests.assign",
  RemovalLogsView: "removal_logs.view",
  MessagingView: "messaging.view",
  MessagingSend: "messaging.send",
  AdminsView: "admins.view",
  AdminsInvite: "admins.invite",
  AdminsManageAccess: "admins.manage_access",
  AdminsRemove: "admins.remove",
  AuditView: "audit.view",
} as const

export type AdminPermissionKey =
  (typeof AdminPermission)[keyof typeof AdminPermission]

export const ALL_PERMISSIONS: string[] = Object.values(AdminPermission)

export interface PermissionDescriptor {
  key: string
  label: string
  description: string
  sensitive?: boolean
}

export interface PermissionGroup {
  key: string
  label: string
  description: string
  permissions: PermissionDescriptor[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Platform-wide metrics and summary data.",
    permissions: [
      {
        key: AdminPermission.DashboardView,
        label: "View dashboard",
        description: "See platform summary, counts and charts.",
      },
    ],
  },
  {
    key: "content",
    label: "Content",
    description: "Posts, petitions, events, adverts and victories.",
    permissions: [
      {
        key: AdminPermission.ContentView,
        label: "View content",
        description: "Browse all user-generated content.",
      },
      {
        key: AdminPermission.ContentModerate,
        label: "Moderate content",
        description: "Approve, reject or take down content.",
        sensitive: true,
      },
    ],
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Task assignment and tracking across organizations.",
    permissions: [
      {
        key: AdminPermission.TasksView,
        label: "View tasks",
        description: "See tasks created across the platform.",
      },
      {
        key: AdminPermission.TasksManage,
        label: "Manage tasks",
        description: "Create, edit, lock and reassign tasks.",
      },
    ],
  },
  {
    key: "users",
    label: "Users",
    description: "Platform member accounts.",
    permissions: [
      {
        key: AdminPermission.UsersView,
        label: "View users",
        description: "Browse and search user accounts.",
      },
      {
        key: AdminPermission.UsersManage,
        label: "Manage users",
        description: "Edit, suspend or deactivate user accounts.",
        sensitive: true,
      },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    description: "Abuse and content reports raised by users.",
    permissions: [
      {
        key: AdminPermission.ReportsView,
        label: "View reports",
        description: "Read reports submitted by users.",
      },
      {
        key: AdminPermission.ReportsResolve,
        label: "Resolve reports",
        description: "Action, dismiss or escalate reports.",
      },
    ],
  },
  {
    key: "billing",
    label: "Billing & Payouts",
    description: "Subscriptions and withdrawal requests.",
    permissions: [
      {
        key: AdminPermission.SubscriptionsView,
        label: "View subscriptions",
        description: "See plan and subscription data.",
      },
      {
        key: AdminPermission.SubscriptionsManage,
        label: "Manage subscriptions",
        description: "Change, cancel or refund subscriptions.",
        sensitive: true,
      },
      {
        key: AdminPermission.WithdrawalsView,
        label: "View withdrawals",
        description: "See withdrawal requests from users.",
      },
      {
        key: AdminPermission.WithdrawalsApprove,
        label: "Approve withdrawals",
        description: "Release funds to user bank accounts.",
        sensitive: true,
      },
    ],
  },
  {
    key: "talent",
    label: "Talent",
    description: "Professional hire requests and assignments.",
    permissions: [
      {
        key: AdminPermission.HireRequestsView,
        label: "View hire requests",
        description: "See incoming professional hire requests.",
      },
      {
        key: AdminPermission.HireRequestsAssign,
        label: "Assign professionals",
        description: "Assign or reassign professionals to clients.",
      },
      {
        key: AdminPermission.RemovalLogsView,
        label: "View removal logs",
        description: "Audit trail of professional removals.",
      },
    ],
  },
  {
    key: "comms",
    label: "Communications",
    description: "Email, WhatsApp and in-app messaging consoles.",
    permissions: [
      {
        key: AdminPermission.MessagingView,
        label: "View conversations",
        description: "Read messaging threads.",
      },
      {
        key: AdminPermission.MessagingSend,
        label: "Send messages",
        description: "Reply to and start conversations.",
      },
    ],
  },
  {
    key: "governance",
    label: "Governance",
    description: "Who can administer the platform.",
    permissions: [
      {
        key: AdminPermission.AdminsView,
        label: "View admins",
        description: "See the list of administrators and invites.",
      },
      {
        key: AdminPermission.AdminsInvite,
        label: "Invite admins",
        description: "Send admin invitations by email.",
        sensitive: true,
      },
      {
        key: AdminPermission.AdminsManageAccess,
        label: "Manage admin access",
        description: "Grant or revoke another admin's permissions.",
        sensitive: true,
      },
      {
        key: AdminPermission.AdminsRemove,
        label: "Suspend / remove admins",
        description: "Suspend, reactivate or delete administrators.",
        sensitive: true,
      },
      {
        key: AdminPermission.AuditView,
        label: "View audit log",
        description: "Read the admin activity audit trail.",
      },
    ],
  },
]

export const PERMISSION_LABELS: Record<string, string> =
  PERMISSION_GROUPS.reduce((acc, group) => {
    group.permissions.forEach((p) => {
      acc[p.key] = p.label
    })
    return acc
  }, {} as Record<string, string>)

export const AdminRole = {
  SuperAdmin: "super_admin",
  Admin: "admin",
  Support: "support",
  Analyst: "analyst",
  Custom: "custom",
} as const

export type AdminRoleKey = (typeof AdminRole)[keyof typeof AdminRole]

export interface RolePreset {
  key: AdminRoleKey
  label: string
  description: string
  permissions: string[]
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    key: AdminRole.SuperAdmin,
    label: "Super Admin",
    description:
      "Unrestricted access, including inviting and removing other admins. Grant sparingly.",
    permissions: [PERMISSION_WILDCARD],
  },
  {
    key: AdminRole.Admin,
    label: "Admin",
    description:
      "Day-to-day platform operations. Cannot manage other administrators.",
    permissions: [
      AdminPermission.DashboardView,
      AdminPermission.ContentView,
      AdminPermission.ContentModerate,
      AdminPermission.TasksView,
      AdminPermission.TasksManage,
      AdminPermission.UsersView,
      AdminPermission.UsersManage,
      AdminPermission.ReportsView,
      AdminPermission.ReportsResolve,
      AdminPermission.SubscriptionsView,
      AdminPermission.WithdrawalsView,
      AdminPermission.HireRequestsView,
      AdminPermission.HireRequestsAssign,
      AdminPermission.RemovalLogsView,
      AdminPermission.MessagingView,
      AdminPermission.MessagingSend,
      AdminPermission.AdminsView,
    ],
  },
  {
    key: AdminRole.Support,
    label: "Support",
    description:
      "Handles user reports, conversations and hire requests. No billing access.",
    permissions: [
      AdminPermission.DashboardView,
      AdminPermission.ContentView,
      AdminPermission.TasksView,
      AdminPermission.UsersView,
      AdminPermission.ReportsView,
      AdminPermission.ReportsResolve,
      AdminPermission.HireRequestsView,
      AdminPermission.MessagingView,
      AdminPermission.MessagingSend,
    ],
  },
  {
    key: AdminRole.Analyst,
    label: "Analyst",
    description: "Read-only access to metrics and operational data.",
    permissions: [
      AdminPermission.DashboardView,
      AdminPermission.ContentView,
      AdminPermission.TasksView,
      AdminPermission.UsersView,
      AdminPermission.ReportsView,
      AdminPermission.SubscriptionsView,
      AdminPermission.WithdrawalsView,
      AdminPermission.HireRequestsView,
      AdminPermission.RemovalLogsView,
    ],
  },
]

export function getRolePreset(role: string): RolePreset | undefined {
  return ROLE_PRESETS.find((r) => r.key === role)
}

export function roleLabel(role: string): string {
  return getRolePreset(role)?.label || "Custom"
}

/** Expand `*` into the full concrete permission list. */
export function expandPermissions(permissions: string[] = []): string[] {
  return permissions.includes(PERMISSION_WILDCARD)
    ? [...ALL_PERMISSIONS]
    : permissions
}

/**
 * "Any of" permission check. Mirrors backend `hasPermission`.
 * A `null`/`undefined` permission list means "not yet loaded" and returns false
 * so the UI fails closed rather than flashing forbidden controls.
 */
export function can(
  permissions: string[] | null | undefined,
  required: string | string[],
): boolean {
  if (!permissions) return false
  if (permissions.includes(PERMISSION_WILDCARD)) return true
  const needed = Array.isArray(required) ? required : [required]
  if (!needed.length) return true
  return needed.some((key) => permissions.includes(key))
}

/** Which preset does this exact permission set match? */
export function inferRole(permissions: string[] = []): AdminRoleKey {
  if (permissions.includes(PERMISSION_WILDCARD)) return AdminRole.SuperAdmin
  const sorted = [...permissions].sort().join("|")
  for (const preset of ROLE_PRESETS) {
    if (preset.key === AdminRole.SuperAdmin) continue
    if ([...preset.permissions].sort().join("|") === sorted) return preset.key
  }
  return AdminRole.Custom
}

export function permissionCount(permissions: string[] = []): number {
  return permissions.includes(PERMISSION_WILDCARD)
    ? ALL_PERMISSIONS.length
    : permissions.length
}
