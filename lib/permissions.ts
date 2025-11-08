import { UserRole } from "@prisma/client"

export const permissions = {
  KASIR: {
    canAccessKasir: true,
    canAccessInventaris: false,
    canAccessTransaksi: false,
    canAccessDashboard: true,
    canManageUsers: false,
    canAccessAkuntansi: false,
  },
  ADMIN: {
    canAccessKasir: true,
    canAccessInventaris: true,
    canAccessTransaksi: true,
    canAccessDashboard: true,
    canManageUsers: true,
    canAccessAkuntansi: true,
  },
  GUDANG: {
    canAccessKasir: false,
    canAccessInventaris: true,
    canAccessTransaksi: true,
    canAccessDashboard: true,
    canManageUsers: false,
    canAccessAkuntansi: false,
  },
  MANAJER: {
    canAccessKasir: true,
    canAccessInventaris: true,
    canAccessTransaksi: true,
    canAccessDashboard: true,
    canManageUsers: false,
    canAccessAkuntansi: true,
  },
}

export function hasPermission(role: UserRole, permission: keyof typeof permissions.ADMIN) {
  return permissions[role]?.[permission] ?? false
}

