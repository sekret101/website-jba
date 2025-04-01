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
import { BanknoteIcon, Smartphone, AlertCircle, Clock, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSiteContext } from "@/contexts/site-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  name: string
  email: string
  balance: number
  isLoggedIn: boolean
  profileImage?: string | null
}

export function WithdrawModal() {
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { currencySettings, addTransaction } = useSiteContext()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Clear error when amount or phone number changes
  useEffect(() => {
    if (error) setError(null)
  }, [amount, phoneNumber, error])

  const validatePhoneNumber = (number: string) => {
    // Basic validation for Philippine phone numbers
    const regex = /^(09|\+639)\d{9}$/
    return regex.test(number)
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please sign in to withdraw funds.",
        variant: "destructive",
      })
      return
    }

    // Validate phone number
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid GCash phone number (e.g., 09XXXXXXXXX or +639XXXXXXXXX).")
      return
    }

    const withdrawAmount = Number.parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount.")
      return
    }

    // Check if user has enough balance
    if (withdrawAmount > user.balance) {
      setError(`Insufficient funds. Your current balance is ${currencySettings.symbol}${user.balance.toFixed(2)}.`)
      return
    }

    // Check minimum withdrawal
    if (withdrawAmount < currencySettings.minWithdraw) {
      setError(`The minimum withdrawal amount is ${currencySettings.symbol}${currencySettings.minWithdraw}.`)
      return
    }

    // Check maximum withdrawal
    if (withdrawAmount > currencySettings.maxWithdraw) {
      setError(`The maximum withdrawal amount is ${currencySettings.symbol}${currencySettings.maxWithdraw}.`)
      return
    }

    setIsProcessing(true)

    try {
      // Add transaction to context with pending status
      addTransaction({
        userId: user.email,
        userName: user.name,
        type: "withdraw",
        amount: withdrawAmount,
        status: "pending", // Transaction starts as pending
        phoneNumber: phoneNumber,
      })

      // Simulate a short delay for processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // We don't update the user's balance here anymore - it will be updated when admin approves

      toast({
        title: "Withdrawal request submitted",
        description: `Your withdrawal request of ${currencySettings.symbol}${withdrawAmount.toFixed(2)} is pending admin approval. Funds will be deducted from your account once approved.`,
      })

      setOpen(false)
      setAmount("")
      setPhoneNumber("")
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal request failed",
        description: "There was an error processing your withdrawal request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      toast({
        title: "Not logged in",
        description: "Please sign in to withdraw funds.",
        variant: "destructive",
      })
      return
    }
    setOpen(newOpen)
    if (!newOpen) {
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs md:text-sm h-9 md:h-10" disabled={!user}>
          {user ? (
            <>
              <BanknoteIcon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Withdraw</span>
              <span className="inline md:hidden">Cash</span>
            </>
          ) : (
            <>
              <LogIn className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Sign In to Withdraw</span>
              <span className="inline md:hidden">Sign In</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Withdraw via GCash</DialogTitle>
          <DialogDescription>Withdraw your winnings to your GCash account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleWithdraw}>
          <div className="grid gap-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-xs md:text-sm">
                Withdrawals require admin approval. Funds will be deducted from your account only after approval.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-2">
              <div className="flex flex-col items-center">
                <Smartphone className="h-8 w-8 md:h-10 md:w-10 text-blue-600 mb-2" />
                <span className="text-blue-600 font-semibold">GCash</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="withdraw-amount">Amount ({currencySettings.symbol})</Label>
              <Input
                id="withdraw-amount"
                type="number"
                inputMode="decimal"
                min={currencySettings.minWithdraw.toString()}
                max={Math.min(currencySettings.maxWithdraw, user?.balance || 0).toString()}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Minimum: {currencySettings.symbol}
                  {currencySettings.minWithdraw}
                </span>
                <span className="text-muted-foreground">
                  Available: {currencySettings.symbol}
                  {user?.balance.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gcash-number">GCash Phone Number</Label>
              <Input
                id="gcash-number"
                type="tel"
                placeholder="09XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Enter the phone number linked to your GCash account</p>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Important information:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs md:text-sm">
                <li>Withdrawal requests require admin approval</li>
                <li>Funds will remain in your account until approved</li>
                <li>Processing time is typically within 24 hours</li>
                <li>
                  Minimum withdrawal amount is {currencySettings.symbol}
                  {currencySettings.minWithdraw}
                </li>
                <li>No fees for GCash withdrawals</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!amount || !phoneNumber || isProcessing}
              className="w-full md:w-auto shine-effect"
            >
              {isProcessing ? "Processing..." : "Submit Withdrawal Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

