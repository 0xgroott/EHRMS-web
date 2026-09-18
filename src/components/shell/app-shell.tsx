import { Outlet } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export function AppShell() { return <SidebarProvider><AppSidebar/><SidebarInset><AppHeader/><main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8"><Outlet/></main></SidebarInset></SidebarProvider> }
