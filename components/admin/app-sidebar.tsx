"use client"

import * as React from "react"

import { NavDocuments } from "@/components/admin/nav-documents"
import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/ui/sidebar"
import { RiDashboardLine, RiListUnordered, RiBarChartLine, RiFolderLine, RiGroupLine, RiCameraLine, RiFileTextLine, RiSettingsLine, RiQuestionLine, RiSearchLine, RiDatabase2Line, RiFileChartLine, RiFileLine, RiCommandLine, RiToolsLine, RiMapPinLine, RiLogoutBoxLine } from "@remixicon/react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <RiDashboardLine
        />
      ),
    },
    {
      title: "Manajemen Produk",
      url: "/dashboard/produk",
      icon: (
        <RiListUnordered
        />
      ),
    },
    {
      title: "Manajemen Teknisi",
      url: "/dashboard/teknisi",
      icon: (
        <RiGroupLine
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <RiCameraLine
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <RiFileTextLine
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <RiFileTextLine
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <RiSettingsLine
        />
      ),
    },
    {
      title: "Logout",
      url: "/login",
      icon: (
        <RiLogoutBoxLine
        />
      ),
    },
  ],
  documents: [
    {
      name: "Servis Workshop",
      url: "/dashboard/servis-workshop",
      icon: (
        <RiToolsLine
        />
      ),
    },
    {
      name: "Servis On-Site",
      url: "/dashboard/servis-onsite",
      icon: (
        <RiMapPinLine
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <span className="text-base font-semibold">DASHBOARD ADMIN</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
