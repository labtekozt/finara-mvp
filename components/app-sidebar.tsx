"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  Settings,
  LogOut,
  Calculator,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { hasPermission } from "@/lib/permissions"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "canAccessDashboard" as const,
  },
  {
    title: "Kasir",
    href: "/kasir",
    icon: ShoppingCart,
    permission: "canAccessKasir" as const,
  },
  {
    title: "Inventaris",
    href: "/inventaris",
    icon: Package,
    permission: "canAccessInventaris" as const,
  },
  {
    title: "Transaksi Barang",
    href: "/transaksi",
    icon: ArrowLeftRight,
    permission: "canAccessTransaksi" as const,
  },
  {
    title: "Akuntansi",
    href: "/akuntansi",
    icon: Calculator,
    permission: "canAccessAkuntansi" as const,
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
    permission: "canManageUsers" as const,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const filteredMenuItems = menuItems.filter(item => 
    session?.user?.role ? hasPermission(session.user.role, item.permission) : false
  )

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">FINARA</h2>
        <p className="text-xs text-muted-foreground">Sistem Manajemen Ritel</p>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {(item as any).subtitle && (
                      <span className="text-xs text-muted-foreground opacity-70">
                        {(item as any).subtitle}
                      </span>
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


