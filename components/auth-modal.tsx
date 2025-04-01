"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"

export function AuthModal() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const { toast } = useToast()
  const router = useRouter()

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState("")

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signUpError, setSignUpError] = useState("")

  // Reset errors when changing tabs
  useEffect(() => {
    setSignInError("")
    setSignUpError("")
  }, [activeTab])

  // Update the handleSignIn function to store user with the user_ prefix
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)
    setSignInError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get all users from localStorage
      const allUsers = getAllUsers()

      // Find user with matching email and password
      const user = allUsers.find((u) => u.email === signInEmail && u.password === signInPassword)

      if (user) {
        // Update user's login status
        const updatedUser = {
          ...user,
          isLoggedIn: true,
        }

        // Update in localStorage with proper prefix
        localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))

        // Set current user
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))

        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${user.name}!`,
        })

        setOpen(false)
        window.location.reload() // Refresh to update UI with logged in state
      } else {
        setSignInError("Invalid email or password. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setSignInError("An error occurred during sign in. Please try again.")
    } finally {
      setIsSigningIn(false)
    }
  }

  // Update the handleSignUp function to store user with the user_ prefix
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setSignUpError("")

    try {
      // Validate passwords match
      if (signUpPassword !== signUpConfirmPassword) {
        setSignUpError("Passwords don't match. Please try again.")
        setIsSigningUp(false)
        return
      }

      // Check if email already exists
      const allUsers = getAllUsers()
      if (allUsers.some((user) => user.email === signUpEmail)) {
        setSignUpError("Email already in use. Please use a different email.")
        setIsSigningUp(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create new user with 0 balance
      const newUser = {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword, // In a real app, this would be hashed
        balance: 0, // Starting balance is 0 pesos
        isLoggedIn: true,
        registeredAt: new Date().toISOString(),
        profileImage: null,
      }

      // Store in localStorage with proper prefix
      localStorage.setItem(`user_${signUpEmail}`, JSON.stringify(newUser))

      // Set as current user
      localStorage.setItem("currentUser", JSON.stringify(newUser))

      toast({
        title: "Account created successfully",
        description: "Welcome to JBA Betting Site! Your starting balance is ₱0.",
      })

      setOpen(false)
      window.location.reload() // Refresh to update UI with logged in state
    } catch (error) {
      console.error("Signup error:", error)
      setSignUpError("An error occurred during sign up. Please try again.")
    } finally {
      setIsSigningUp(false)
    }
  }

  // Helper function to get all users from localStorage
  const getAllUsers = () => {
    const users = []
    try {
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
    } catch (e) {
      console.error("Error accessing localStorage", e)
    }
    return users
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs md:text-sm flex items-center gap-1">
          <LogIn className="h-3 w-3 md:h-4 md:w-4" />
          <span>Sign In</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>Sign in to your account to place bets and manage your funds.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4 py-4">
                {signInError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    inputMode="email"
                    placeholder="your@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <Button variant="link" className="px-0 justify-start text-sm">
                  Forgot password?
                </Button>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSigningIn} className="w-full md:w-auto">
                  {isSigningIn ? "Signing in..." : "Sign In"}
                </Button>
              </DialogFooter>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Don't have an account? Click the Sign Up tab above.</p>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <DialogHeader>
              <DialogTitle>Create an Account</DialogTitle>
              <DialogDescription>Join JBA Betting Site to start betting on your favorite events.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4 py-4">
                {signUpError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signUpError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSigningUp} className="w-full md:w-auto">
                  {isSigningUp ? "Creating Account..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

