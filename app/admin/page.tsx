"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"

export default function AdminDashboard() {
  const [accountCount, setAccountCount] = useState(0)
  const [loggedInCount, setLoggedInCount] = useState(0)

  useEffect(() => {
    // Get all users from localStorage
    const allUsers = getAllUsers()
    setAccountCount(allUsers.length)

    // Count logged in users
    const loggedIn = allUsers.filter((user) => user.isLoggedIn).length
    setLoggedInCount(loggedIn)
  }, [])

  // Update the getAllUsers function to properly get all users from localStorage
  const getAllUsers = () => {
    const users = []

    // Loop through all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("user_")) {
        try {
          const userData = localStorage.getItem(key)
          if (userData) {
            users.push(JSON.parse(userData))
          }
        } catch (e) {
          console.error("Error parsing user data", e)
        }
      }
    }

    return users
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-secondary text-secondary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountCount}</div>
            <p className="text-xs mt-1">Registered users on the platform</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loggedInCount}</div>
            <p className="text-xs mt-1">Currently logged in users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Welcome to the JBA Betting Site admin panel</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">Use the sidebar to navigate to different sections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

