"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, AlertCircle, Smartphone, Clock, Users, Award, Trophy, Lock } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "./auth-modal"

interface BettingCardProps {
  id: number
  title: string
  description: string
  option1: string
  option2: string
  odds1: string
  odds2: string
  liveStream: boolean
}

interface UserData {
  name: string
  email: string
  balance: number
  isLoggedIn: boolean
}

export function BettingCard({ id, title, description, option1, option2, odds1, odds2, liveStream }: BettingCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [betAmount, setBetAmount] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const { currencySettings, liveStreams, addBet, bets } = useSiteContext()
  const { toast } = useToast()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        setUser(null)
      }
    }
  }, [])

  // Reset insufficient funds error when amount changes
  useEffect(() => {
    if (insufficientFunds) {
      setInsufficientFunds(false)
    }
  }, [betAmount, insufficientFunds])

  const handleOptionSelect = (option: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setSelectedOption(option)
    setInsufficientFunds(false)
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow positive numbers
    if (value === "" || Number(value) >= 0) {
      setBetAmount(value)

      // Check if amount exceeds balance and show real-time error
      if (user && Number(value) > user.balance) {
        setInsufficientFunds(true)
      } else {
        setInsufficientFunds(false)
      }
    }
  }

  // Add a function to check if the user has already placed a bet on this event
  const userHasBet = user ? bets.some((bet) => bet.eventId === id && bet.userId === user.email) : false

  // Add a function to get the user's bet on this event
  const getUserBet = () => {
    if (!user) return null
    return bets.find((bet) => bet.eventId === id && bet.userId === user.email)
  }

  const handlePlaceBet = () => {
    if (!selectedOption || !betAmount || !user) {
      if (!user) {
        setShowAuthModal(true)
        return
      }

      toast({
        title: "Error",
        description: "Please select an option and enter a bet amount.",
        variant: "destructive",
      })
      return
    }

    // Check if user already has a bet on this event
    if (userHasBet) {
      toast({
        title: "Bet already placed",
        description: "You have already placed a bet on this event.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(betAmount)

    // Validate minimum bet amount
    if (amount < 10) {
      toast({
        title: "Minimum bet amount",
        description: "The minimum bet amount is ₱10.",
        variant: "destructive",
      })
      return
    }

    // Check if user has enough balance
    if (amount > user.balance) {
      setInsufficientFunds(true)
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      })
      return
    }

    // Calculate potential win
    const selectedOdds = selectedOption === option1 ? odds1 : odds2
    const potentialWin = amount * Number.parseFloat(selectedOdds)

    // Add bet to context
    addBet({
      userId: user.email,
      userName: user.name,
      eventId: id,
      eventTitle: title,
      selection: selectedOption,
      odds: selectedOption === option1 ? odds1 : odds2,
      amount: amount,
      potentialWin: potentialWin,
      status: "pending",
    })

    // Update user balance
    const newBalance = user.balance - amount
    const updatedUser = {
      ...user,
      balance: newBalance,
    }
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    setUser(updatedUser)

    toast({
      title: "Bet placed successfully",
      description: `You placed a bet of ₱${amount} on ${selectedOption}. Potential win: ₱${potentialWin.toFixed(2)}`,
    })

    // Reset form
    setSelectedOption(null)
    setBetAmount("")
  }

  const toggleVideo = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setIsPlaying(!isPlaying)
  }

  // Find the corresponding live stream if available
  const stream = liveStreams.find((s) => s.name === title && s.status === "live")

  // Calculate total bets on each option
  const option1Bets = bets.filter((bet) => bet.eventId === id && bet.selection === option1).length
  const option2Bets = bets.filter((bet) => bet.eventId === id && bet.selection === option2).length

  // Calculate total amount bet on each option
  const option1Amount = bets
    .filter((bet) => bet.eventId === id && bet.selection === option1)
    .reduce((sum, bet) => sum + bet.amount, 0)

  const option2Amount = bets
    .filter((bet) => bet.eventId === id && bet.selection === option2)
    .reduce((sum, bet) => sum + bet.amount, 0)

  return (
    <>
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">You need to sign in to place bets and watch live streams.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAuthModal(false)}>
                Cancel
              </Button>
              <AuthModal />
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative h-32 md:h-48 bg-secondary">
            {!isPlaying ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={toggleVideo}
                  disabled={!liveStream}
                >
                  {user ? <Play className="h-4 w-4 md:h-6 md:w-6" /> : <Lock className="h-4 w-4 md:h-6 md:w-6" />}
                </Button>
                <span className="mt-2 text-xs md:text-sm">
                  {!user
                    ? "Sign in to watch live stream"
                    : liveStream
                      ? "Click to watch live stream"
                      : "Live stream not available"}
                </span>
                {stream && user && (
                  <span className="mt-1 text-xs text-primary flex items-center">
                    <span className="h-2 w-2 rounded-full bg-primary mr-1"></span>
                    Live • {stream.viewers} viewers
                  </span>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white p-4">
                  <p className="text-sm md:text-base">Mobile live stream playing</p>
                  {stream && <p className="text-xs mb-2">Quality: {stream.quality}</p>}
                  <div className="flex items-center justify-center mt-2 text-xs">
                    <Smartphone className="h-3 w-3 mr-1" />
                    <span>Streamed from mobile device</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={toggleVideo}>
                    Stop Stream
                  </Button>
                </div>
              </div>
            )}
            {liveStream && <Badge className="absolute top-2 right-2 bg-red-500">LIVE</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
              <CardDescription className="mt-1 text-xs md:text-sm">{description}</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" /> Live Event
            </Badge>
          </div>

          <Separator className="my-3 md:my-4" />

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>{option1Bets + option2Bets} bets placed</span>
              </div>
              <div>
                Total pool: {currencySettings.symbol}
                {(option1Amount + option2Amount).toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="space-y-2">
                <Button
                  variant={selectedOption === option1 ? "default" : "outline"}
                  className="w-full justify-between h-auto py-2 md:py-3 px-2 md:px-3 text-xs md:text-sm"
                  onClick={() => handleOptionSelect(option1)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-xs md:text-base">{option1}</span>
                    <span className="text-xs text-muted-foreground">{option1Bets} bets</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm md:text-lg font-bold">{odds1}x</span>
                    <span className="text-xs text-muted-foreground">
                      {currencySettings.symbol}
                      {option1Amount.toFixed(0)} pool
                    </span>
                  </div>
                </Button>
                {selectedOption === option1 && (
                  <Badge
                    variant="outline"
                    className="w-full justify-center bg-primary/10 text-primary border-primary text-xs"
                  >
                    <Award className="h-3 w-3 mr-1" /> Selected
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant={selectedOption === option2 ? "default" : "outline"}
                  className="w-full justify-between h-auto py-2 md:py-3 px-2 md:px-3 text-xs md:text-sm"
                  onClick={() => handleOptionSelect(option2)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-xs md:text-base">{option2}</span>
                    <span className="text-xs text-muted-foreground">{option2Bets} bets</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm md:text-lg font-bold">{odds2}x</span>
                    <span className="text-xs text-muted-foreground">
                      {currencySettings.symbol}
                      {option2Amount.toFixed(0)} pool
                    </span>
                  </div>
                </Button>
                {selectedOption === option2 && (
                  <Badge
                    variant="outline"
                    className="w-full justify-center bg-primary/10 text-primary border-primary text-xs"
                  >
                    <Award className="h-3 w-3 mr-1" /> Selected
                  </Badge>
                )}
              </div>
            </div>

            {user && userHasBet && (
              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Trophy className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <p className="font-medium text-xs md:text-sm">Your Bet</p>
                </div>
                {(() => {
                  const userBet = getUserBet()
                  if (!userBet) return null
                  return (
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span>Selection:</span>
                        <span className="font-medium">{userBet.selection}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Odds:</span>
                        <span className="font-medium">{userBet.odds}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          {currencySettings.symbol}
                          {userBet.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potential Win:</span>
                        <span className="font-medium text-primary">
                          {currencySettings.symbol}
                          {userBet.potentialWin.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={`font-medium ${userBet.status === "pending" ? "text-yellow-500" : userBet.status === "won" ? "text-green-500" : "text-red-500"}`}
                        >
                          {userBet.status.charAt(0).toUpperCase() + userBet.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {!user && (
              <Alert variant="warning" className="mt-3 md:mt-4 py-2 text-xs md:text-sm">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <AlertDescription className="flex items-center justify-between w-full">
                  <span>Please sign in to place a bet on this event.</span>
                  <AuthModal />
                </AlertDescription>
              </Alert>
            )}

            {user && selectedOption && !userHasBet && (
              <div className="space-y-3 mt-3 md:mt-4 p-3 md:p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`bet-amount-${id}`} className="font-medium text-xs md:text-sm">
                    Your Bet Amount
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {currencySettings.symbol}
                    {user.balance.toFixed(2)}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Input
                    id={`bet-amount-${id}`}
                    placeholder="Enter amount"
                    type="number"
                    inputMode="decimal"
                    min="10"
                    max={user.balance.toString()}
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    className={`text-sm ${insufficientFunds ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!betAmount || insufficientFunds}
                    className="text-xs md:text-sm"
                  >
                    Place Bet
                  </Button>
                </div>

                {insufficientFunds && (
                  <Alert variant="destructive" className="py-2 mt-2 text-xs">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    <AlertDescription>Insufficient funds. Your balance: ₱{user.balance.toFixed(2)}</AlertDescription>
                  </Alert>
                )}

                {betAmount && !insufficientFunds && Number(betAmount) >= 10 && (
                  <div className="space-y-1 p-2 md:p-3 bg-background rounded-md text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span>Selection:</span>
                      <span className="font-medium">{selectedOption}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Odds:</span>
                      <span className="font-medium">{selectedOption === option1 ? odds1 : odds2}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bet Amount:</span>
                      <span className="font-medium">
                        {currencySettings.symbol}
                        {Number(betAmount).toFixed(2)}
                      </span>
                    </div>
                    <Separator className="my-1 md:my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Potential Win:</span>
                      <span className="text-primary">
                        {currencySettings.symbol}
                        {(Number(betAmount) * Number(selectedOption === option1 ? odds1 : odds2)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && userHasBet && !selectedOption && (
              <Alert className="mt-3 md:mt-4 py-2 text-xs md:text-sm">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <AlertDescription>You have already placed a bet on this event.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 px-3 py-2 md:px-6 md:py-3">
          <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updated just now</span>
            </div>
            <div>Min bet: {currencySettings.symbol}10.00</div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

