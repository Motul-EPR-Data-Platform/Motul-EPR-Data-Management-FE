"use client";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function RecyclerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 bg-gray-50 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

