"use client";

import { SignOutButton } from "@/components/sign-out-button";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export function AdminTopBar({ email, role }: { email: string; role: string }) {
  return (
    <header className="sticky top-0 z-[60] border-b border-sagaha-accent/10 bg-sagaha-night/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8 lg:pl-[calc(16rem+1.5rem)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <AdminBreadcrumbs />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-sagaha-mist/50 sm:inline">
            {email} · <span className="text-sagaha-accent/90">{role}</span>
          </span>
          <SignOutButton variant="admin" />
        </div>
      </div>
    </header>
  );
}
