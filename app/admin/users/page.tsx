"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, UserCog, DollarSign, Search, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface User {
  name: string
  email: string
  password?: string
  balance: number
  isLoggedIn: boolean
  registeredAt?: string
}

interface AdminUser {
  username: string
  isAdmin: boolean
  lastLogin: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [adminSettingsOpen, setAdminSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Admin settings form
  const [adminUsername, setAdminUsername] = useState("")
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("")
  const [adminNewPassword, setAdminNewPassword] = useState("")
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("")

  // Edit user form
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editBalance, setEditBalance] = useState("")

  const { toast } = useToast()

  // Load users from localStorage
  const loadUsers = () => {
    const allUsers = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("user_")) {
        try {
          const userData = localStorage.getItem(key)
          if (userData) {
            allUsers.push(JSON.parse(userData))
          }
        } catch (e) {
          console.error("Error parsing user data", e)
        }
      }
    }
    setUsers(allUsers)
  }

  useEffect(() => {
    // Load users
    loadUsers()

    // Load admin user
    const adminData = localStorage.getItem("admin")
    if (adminData) {
      try {
        const admin = JSON.parse(adminData)
        setAdminUser(admin)
        setAdminUsername(admin.username)
      } catch (e) {
        console.error("Error parsing admin data", e)
      }
    }
  }, [])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditBalance(user.balance.toString())
    setEditDialogOpen(true)
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return

    const updatedUser = {
      ...selectedUser,
      name: editName,
      email: editEmail,
      balance: Number.parseFloat(editBalance),
    }

    // Update in state
    setUsers(users.map((user) => (user.email === selectedUser.email ? updatedUser : user)))

    // Update in localStorage
    localStorage.setItem(`user_${selectedUser.email}`, JSON.stringify(updatedUser))

    // If this is the current user, update that too
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser)
      if (parsedUser.email === selectedUser.email) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
    }

    setEditDialogOpen(false)
    toast({
      title: "User updated",
      description: "User information has been updated successfully.",
    })
  }

  const handleDeleteUser = (email: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      // Remove from state
      setUsers(users.filter((user) => user.email !== email))

      // Remove from localStorage
      localStorage.removeItem(`user_${email}`)

      // If this is the current user, remove that too
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser)
        if (parsedUser.email === email) {
          localStorage.removeItem("currentUser")
        }
      }

      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      })
    }
  }

  const handleResetBalance = (email: string) => {
    if (confirm("Are you sure you want to reset this user's balance to 0? This action cannot be undone.")) {
      // Find the user
      const user = users.find((user) => user.email === email)
      if (user) {
        // Reset balance to 0
        const updatedUser = {
          ...user,
          balance: 0,
        }

        // Update in state
        setUsers(users.map((u) => (u.email === email ? updatedUser : u)))

        // Update in localStorage
        localStorage.setItem(`user_${email}`, JSON.stringify(updatedUser))

        // If this is the current user, update that too
        const currentUser = localStorage.getItem("currentUser")
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser)
          if (parsedUser.email === email) {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          }
        }

        toast({
          title: "Balance reset",
          description: "User's balance has been reset to 0.",
        })
      }
    }
  }

  const handleUpdateAdminSettings = (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminUser) return

    // Validate current password (in a real app, this would check against a hashed password)
    if (adminCurrentPassword !== "admin123") {
      toast({
        title: "Incorrect password",
        description: "The current password you entered is incorrect.",
        variant: "destructive",
      })
      return
    }

    // Validate new password
    if (adminNewPassword && adminNewPassword !== adminConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    // Update admin user
    const updatedAdmin = {
      ...adminUser,
      username: adminUsername,
    }

    // Update in localStorage
    localStorage.setItem("admin", JSON.stringify(updatedAdmin))
    setAdminUser(updatedAdmin)

    toast({
      title: "Admin settings updated",
      description: "Your admin account settings have been updated successfully.",
    })

    // Reset form
    setAdminCurrentPassword("")
    setAdminNewPassword("")
    setAdminConfirmPassword("")
    setAdminSettingsOpen(false)
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setAdminSettingsOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Admin Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user accounts on the platform.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Balance (₱)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>₱{user.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      {user.isLoggedIn ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Offline</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.registeredAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleResetBalance(user.email)}>
                          <DollarSign className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.email)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {users.length === 0 ? "No users found" : "No matching users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Total users: {users.length} | Active users: {users.filter((u) => u.isLoggedIn).length}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-balance">Balance (₱)</Label>
              <Input
                id="edit-balance"
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Settings Dialog */}
      <Dialog open={adminSettingsOpen} onOpenChange={setAdminSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Account Settings</DialogTitle>
            <DialogDescription>Update your admin account credentials.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAdminSettings}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-current-password">Current Password</Label>
                <Input
                  id="admin-current-password"
                  type="password"
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-new-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="admin-new-password"
                  type="password"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-confirm-password">Confirm New Password</Label>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdminSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

