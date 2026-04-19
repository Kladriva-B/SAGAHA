import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    redirect("/unauthorized");
  }
  return (
    <div className="min-h-screen bg-sagaha-night text-sagaha-mist">
      <Toaster richColors position="top-right" theme="dark" />
      <div className="flex min-h-screen">
        <AdminSidebar email={session.user.email ?? ""} role={session.user.role} />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <AdminTopBar email={session.user.email ?? ""} role={session.user.role} />
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
