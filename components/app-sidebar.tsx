"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  ClipboardCheck,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Scale,
  Lock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { hasPermission } from "@/lib/permissions";

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
    title: "Kalkulator Rabat",
    href: "/kalkulator-rabat",
    icon: Calculator,
    permission: "canAccessInventaris" as const,
  },
  {
    title: "Retur Pembelian",
    href: "/retur-pembelian",
    icon: RotateCcw,
    permission: "canAccessInventaris" as const,
  },
  {
    title: "Retur Penjualan",
    href: "/retur-penjualan",
    icon: RotateCcw,
    permission: "canAccessKasir" as const,
  },
  {
    title: "Akuntansi",
    href: "/akuntansi",
    icon: Calculator,
    permission: "canAccessAkuntansi" as const,
    submenu: [
      {
        title: "Dashboard",
        href: "/akuntansi",
        icon: TrendingUp,
      },
      {
        title: "Daftar Akun",
        href: "/akuntansi/akun",
        icon: Calculator,
      },
      {
        title: "Saldo Awal",
        href: "/akuntansi/saldo-awal",
        icon: Scale,
      },
      {
        title: "Jurnal",
        href: "/akuntansi/jurnal",
        icon: BookOpen,
      },
      {
        title: "Pengeluaran",
        href: "/akuntansi/pengeluaran",
        icon: FileText,
      },
      {
        title: "Buku Besar",
        href: "/akuntansi/buku-besar",
        icon: BookOpen,
      },
      {
        title: "Neraca Saldo",
        href: "/akuntansi/neraca-saldo",
        icon: Scale,
      },
      {
        title: "Laporan",
        href: "/akuntansi/laporan",
        icon: FileText,
      },
      {
        title: "Penutupan",
        href: "/akuntansi/penutupan",
        icon: Lock,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const filteredMenuItems = menuItems.filter((item) =>
    session?.user?.role
      ? hasPermission(session.user.role, item.permission)
      : false,
  );

  // Auto-open submenu if current path matches (only on mount)
  React.useEffect(() => {
    filteredMenuItems.forEach((item) => {
      if (item.submenu) {
        const isSubmenuActive = item.submenu.some((sub) =>
          pathname.startsWith(sub.href),
        );
        if (isSubmenuActive && openSubmenu === null) {
          setOpenSubmenu(item.href);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">FINARA</h2>
        <p className="text-xs text-muted-foreground">Sistem Manajemen Ritel</p>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {filteredMenuItems.map((item) => {
            if (item.submenu) {
              const isActive = pathname.startsWith(item.href);
              const isOpen = openSubmenu === item.href;

              return (
                <Collapsible
                  key={item.href}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setOpenSubmenu(open ? item.href : null)
                  }
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenSubmenu(isOpen ? null : item.href);
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronRight
                          className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
            <p className="text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {session?.user?.role}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
