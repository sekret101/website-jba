"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { BetHistory } from "@/components/bet-history"
import { TransactionStatus } from "@/components/transaction-status"
import { useSiteContext } from "@/contexts/site-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X, User, Shield, CreditCard, History } from "lucide-react"

interface UserData {
  name: string
  email: string
  balance: number
  isLoggedIn: boolean
  profileImage?: string | null
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { currencySettings } = useSiteContext()

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setName(parsedUser.name)
      setEmail(parsedUser.email)
      setProfileImage(parsedUser.profileImage || null)
    } else {
      // Redirect to home if not logged in
      router.push("/")
      toast({
        title: "Not logged in",
        description: "Please sign in to view your account.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }, [router, toast])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()

    // Update user data in localStorage
    if (user) {
      const updatedUser = {
        ...user,
        name,
        email,
        profileImage,
      }
      localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would validate the current password and update it
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    })

    // Reset form
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "The profile image must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string)
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const clearProfileImage = () => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading) {
    return <div className="container py-10">Loading...</div>
  }

  if (!user) {
    return null // Router will redirect
  }

  return (
    <div className="container py-6 md:py-10 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 gradient-text">My Account</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <Card className="card-hover-effect">
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="flex flex-col items-center mb-4 md:mb-6">
              <div className="relative group">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-bold mt-4">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">
                  {currencySettings.symbol}
                  {user.balance.toFixed(2)}
                </p>
              </div>
              <Separator />
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                  Back to Betting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 overflow-hidden">
          <Tabs defaultValue="bets" className="fade-in">
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start md:justify-center">
              <TabsTrigger value="bets" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <span>Betting History</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bets" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Betting History</CardTitle>
                  <CardDescription>View your recent bets and outcomes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetHistory />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your deposit and withdrawal history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionStatus />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your account information and profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Profile Picture</h3>
                        <div className="flex items-center gap-6">
                          <Avatar className="h-20 w-20 border-2 border-muted">
                            {profileImage ? (
                              <AvatarImage src={profileImage} alt={user.name} />
                            ) : (
                              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                                <Upload className="h-4 w-4 mr-2" />
                                {profileImage ? "Change Photo" : "Upload Photo"}
                              </Button>
                              {profileImage && (
                                <Button type="button" variant="outline" size="sm" onClick={clearProfileImage}>
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Recommended: Square JPG or PNG, max 5MB</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 shine-effect">
                      Update Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 shine-effect">
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

