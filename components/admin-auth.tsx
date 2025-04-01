"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { LockKeyhole } from "lucide-react"

export function AdminAuth() {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in a real app, this would validate with a backend
    if (username === "admin" && password === "admin123") {
      // Store admin info in localStorage for demo purposes
      localStorage.setItem(
        "admin",
        JSON.stringify({
          username: "admin",
          isAdmin: true,
          lastLogin: new Date().toISOString(),
        }),
      )

      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard!",
      })

      setOpen(false)
      router.push("/admin")
    } else {
      toast({
        title: "Admin login failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
    }

    setIsLoggingIn(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LockKeyhole className="h-4 w-4" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
          <DialogDescription>Enter your credentials to access the admin dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdminLogin}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

