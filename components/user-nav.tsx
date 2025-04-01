"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, LogOut, Settings, User } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { useToast } from "@/hooks/use-toast"
import { useSiteContext } from "@/contexts/site-context"
import { useMobile } from "@/hooks/use-mobile"

interface UserData {
  name: string
  email: string
  balance: number
  isLoggedIn: boolean
  profileImage?: string | null
}

export function UserNav() {
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { currencySettings, transactions } = useSiteContext()
  const { isMobile } = useMobile()

  // Refresh user data when transactions change
  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [transactions])

  // Initial load
  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    if (user) {
      // Update user's login status in storage with proper prefix
      const updatedUser = {
        ...user,
        isLoggedIn: false,
      }
      localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))

      // Remove current user
      localStorage.removeItem("currentUser")
      setUser(null)

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!user) {
    return <AuthModal />
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">
            {currencySettings.symbol}
            {user.balance.toFixed(2)}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.name} />
              ) : (
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              {isMobile && (
                <p className="text-xs font-medium mt-1">
                  Balance: {currencySettings.symbol}
                  {user.balance.toFixed(2)}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account?tab=bets")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Betting History</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account?tab=security")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

