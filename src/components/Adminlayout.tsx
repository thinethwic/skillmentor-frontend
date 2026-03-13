import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "../components/shared/admin-sidebar";
import { AdminRouteGuard } from "../components/shared/admin-route-guard";

export default function AdminLayout() {
  return (
    <AdminRouteGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage mentors, subjects, and bookings.
              </p>
            </div>
          </header>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminRouteGuard>
  );
}
