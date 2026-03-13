import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck2,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Create Subject", url: "/admin/subjects/create", icon: BookOpen },
  { title: "Subjects", url: "/admin/subjects", icon: GraduationCap },
  { title: "Mentors", url: "/admin/mentors", icon: Users },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck2 },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div>
          <h2 className="text-lg font-bold">Skill Mentor</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/admin"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
