"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { PlusCircle, Smartphone, Copy, Upload, X, Clock, LogIn } from "lucide-react"
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

export function DepositModal() {
  const [amount, setAmount] = useState("")
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleCopyNumber = () => {
    try {
      navigator.clipboard.writeText(currencySettings.gcashNumber)
      toast({
        title: "GCash number copied",
        description: "The GCash number has been copied to your clipboard.",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = currencySettings.gcashNumber
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        toast({
          title: "GCash number copied",
          description: "The GCash number has been copied to your clipboard.",
        })
      } catch (err) {
        console.error("Fallback copy failed:", err)
        toast({
          title: "Copy failed",
          description: "Please manually copy the GCash number.",
          variant: "destructive",
        })
      }
      document.body.removeChild(textArea)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "The receipt image must be less than 5MB.",
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

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptImage(event.target.result as string)
      }
    }
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the image file.",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setReceiptImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please sign in to deposit funds.",
        variant: "destructive",
      })
      return
    }

    if (!receiptImage) {
      toast({
        title: "Receipt image required",
        description: "Please upload a receipt image to verify your deposit.",
        variant: "destructive",
      })
      return
    }

    const depositAmount = Number.parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      })
      return
    }

    // Check minimum deposit
    if (depositAmount < currencySettings.minDeposit) {
      toast({
        title: "Minimum deposit",
        description: `The minimum deposit amount is ${currencySettings.symbol}${currencySettings.minDeposit}.`,
        variant: "destructive",
      })
      return
    }

    // Check maximum deposit
    if (depositAmount > currencySettings.maxDeposit) {
      toast({
        title: "Maximum deposit",
        description: `The maximum deposit amount is ${currencySettings.symbol}${currencySettings.maxDeposit}.`,
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Add transaction to context with pending status
      addTransaction({
        userId: user.email,
        userName: user.name,
        type: "deposit",
        amount: depositAmount,
        status: "pending", // Transaction starts as pending
        receiptImage: receiptImage,
      })

      // Simulate a short delay for processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Deposit request submitted",
        description: `Your deposit request of ${currencySettings.symbol}${depositAmount.toFixed(2)} is pending admin approval. Funds will be added to your account once approved.`,
      })

      setOpen(false)
      setAmount("")
      setReceiptImage(null)
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit request failed",
        description: "There was an error processing your deposit request. Please try again.",
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
        description: "Please sign in to deposit funds.",
        variant: "destructive",
      })
      return
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs md:text-sm h-9 md:h-10" disabled={!user}>
          {user ? (
            <>
              <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Deposit</span>
              <span className="inline md:hidden">Add</span>
            </>
          ) : (
            <>
              <LogIn className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">Sign In to Deposit</span>
              <span className="inline md:hidden">Sign In</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deposit via GCash</DialogTitle>
          <DialogDescription>Add funds to your account using GCash.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDeposit}>
          <div className="grid gap-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-xs md:text-sm">
                Deposits require admin approval before funds are credited to your account.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-2">
              <div className="flex flex-col items-center">
                <Smartphone className="h-8 w-8 md:h-10 md:w-10 text-blue-600 mb-2" />
                <span className="text-blue-600 font-semibold">GCash</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({currencySettings.symbol})</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={currencySettings.minDeposit.toString()}
                max={currencySettings.maxDeposit.toString()}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Minimum deposit: {currencySettings.symbol}
                {currencySettings.minDeposit}
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">GCash Number</Label>
                  <AlertDescription className="font-medium text-blue-600">
                    {currencySettings.gcashNumber}
                  </AlertDescription>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleCopyNumber} className="h-8 px-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="receipt-image">Upload Receipt Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt-image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-full">
                  {receiptImage ? (
                    <div className="relative border rounded-md overflow-hidden">
                      <img
                        src={receiptImage || "/placeholder.svg"}
                        alt="Receipt"
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-40 flex flex-col gap-2 justify-center items-center border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Upload a screenshot of your GCash payment receipt</p>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">How it works:</p>
              <ol className="list-decimal pl-4 space-y-1 text-xs md:text-sm">
                <li>Send the amount to the GCash number above</li>
                <li>Take a screenshot of your payment receipt</li>
                <li>Upload the receipt image</li>
                <li>Submit your deposit request</li>
                <li>Wait for admin approval (usually within 24 hours)</li>
                <li>Once approved, funds will be added to your account</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!amount || !receiptImage || isProcessing}
              className="w-full md:w-auto shine-effect"
            >
              {isProcessing ? "Processing..." : "Submit Deposit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

