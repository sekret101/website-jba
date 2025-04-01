"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Video,
  DollarSign,
  BarChart,
  LogOut,
  CreditCard,
  Ticket,
  Menu,
  X,
  Home,
} from "lucide-react"
import { AdminNotification } from "@/components/admin-notification"
import { useMobile } from "@/hooks/use-mobile"

interface AdminData {
  username: string
  isAdmin: boolean
  lastLogin: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { isMobile } = useMobile()

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem("admin")
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData))
      } catch (error) {
        console.error("Error parsing admin data:", error)
        router.push("/")
        toast({
          title: "Access denied",
          description: "You must be logged in as an admin to view this page.",
          variant: "destructive",
        })
      }
    } else {
      // Redirect to home if not logged in as admin
      router.push("/")
      toast({
        title: "Access denied",
        description: "You must be logged in as an admin to view this page.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem("admin")
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin dashboard.",
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!admin) {
    return null // Router will redirect
  }

  const navItems = [
    { href: "/admin", icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: "Dashboard" },
    { href: "/admin/transactions", icon: <CreditCard className="mr-2 h-4 w-4" />, label: "Transactions" },
    { href: "/admin/bets", icon: <Ticket className="mr-2 h-4 w-4" />, label: "Bets" },
    { href: "/admin/betting", icon: <BarChart className="mr-2 h-4 w-4" />, label: "Betting Options" },
    { href: "/admin/live-video", icon: <Video className="mr-2 h-4 w-4" />, label: "Live Video" },
    { href: "/admin/currency", icon: <DollarSign className="mr-2 h-4 w-4" />, label: "Currency Settings" },
    { href: "/admin/users", icon: <Users className="mr-2 h-4 w-4" />, label: "User Management" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-sidebar text-sidebar-foreground shadow-md">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">JBA Admin</span>
          </Link>
        </div>
        <div className="p-4">
          <p className="text-sm text-sidebar-foreground/70">Logged in as</p>
          <p className="font-medium text-white">{admin.username}</p>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="admin-sidebar-link">
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-4 w-64 px-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-sidebar text-sidebar-foreground shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white">JBA Admin</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)} className="text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-sm text-sidebar-foreground/70">Logged in as</p>
              <p className="font-medium text-white">{admin.username}</p>
            </div>
            <nav className="p-2 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setMobileSidebarOpen(false)} className="admin-sidebar-link">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-2 mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-sidebar-accent"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-3 md:p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-base md:text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <AdminNotification />
              <Link href="/" className="text-xs md:text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">View Site</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="p-2 md:p-6 overflow-auto">{children}</main>

        {/* Mobile Admin Navigation Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-sidebar text-white border-t border-sidebar-border flex justify-around items-center py-2 z-40 safe-bottom">
            <Link href="/admin" className="flex flex-col items-center text-xs">
              <LayoutDashboard className="h-5 w-5 mb-1" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/transactions" className="flex flex-col items-center text-xs">
              <CreditCard className="h-5 w-5 mb-1" />
              <span>Transactions</span>
            </Link>
            <Link href="/admin/betting" className="flex flex-col items-center text-xs">
              <BarChart className="h-5 w-5 mb-1" />
              <span>Betting</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center text-xs h-auto p-0 min-h-0 text-white"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 mb-1" />
              <span>Menu</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

