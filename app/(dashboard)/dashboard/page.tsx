import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Header } from "@/components/header";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* <Header
        title={`Selamat Datang, ${session?.user?.name}`}
        description="Dashboard - Ringkasan Sistem"
      /> */}

      <DashboardClient />
    </div>
  );
}
