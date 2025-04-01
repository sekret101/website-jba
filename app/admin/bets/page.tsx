"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Eye, Award, AlertCircle } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"
import type { Bet } from "@/contexts/site-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BetsManagement() {
  const { bets, updateBet, currencySettings, bettingOptions } = useSiteContext()
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: string; option: string } | null>(null)
  const { toast } = useToast()

  const handleViewBet = (bet: Bet) => {
    setSelectedBet(bet)
    setViewDialogOpen(true)
  }

  // Modify the handleWinBet function to automatically credit the user's balance
  const handleWinBet = (bet: Bet) => {
    // Update bet status
    updateBet(bet.id, { status: "won" })

    // Update user balance with winnings
    const userData = localStorage.getItem(`user_${bet.userId}`)
    if (userData) {
      const user = JSON.parse(userData)
      const newBalance = user.balance + bet.potentialWin

      // Update in both places
      localStorage.setItem(
        `user_${bet.userId}`,
        JSON.stringify({
          ...user,
          balance: newBalance,
        }),
      )

      // Also update currentUser if this is the current user
      const currentUserData = localStorage.getItem("currentUser")
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData)
        if (currentUser.email === bet.userId) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...currentUser,
              balance: newBalance,
            }),
          )
        }
      }
    }

    setViewDialogOpen(false)
    toast({
      title: "Bet marked as won",
      description: `The bet has been marked as won and the user has been credited with ${currencySettings.symbol}${bet.potentialWin.toFixed(2)}.`,
    })
  }

  const handleLoseBet = (bet: Bet) => {
    // Update bet status
    updateBet(bet.id, { status: "lost" })

    setViewDialogOpen(false)
    toast({
      title: "Bet marked as lost",
      description: "The bet has been marked as lost.",
    })
  }

  const handleConfirmAllWinnings = (optionType: string, optionValue: string) => {
    setConfirmAction({ type: optionType, option: optionValue })
    setConfirmDialogOpen(true)
  }

  // Modify the processAllWinnings function to update both user storage locations
  const processAllWinnings = () => {
    if (!confirmAction) return

    const { type, option } = confirmAction

    // Find all pending bets for the selected option
    const pendingBets = bets.filter((bet) => {
      if (bet.status !== "pending") return false

      const betOption = bettingOptions.find((opt) => opt.id === bet.eventId)
      if (!betOption) return false

      if (type === "option1") {
        return bet.selection === betOption.option1
      } else {
        return bet.selection === betOption.option2
      }
    })

    // Process all these bets as wins
    let totalPayout = 0
    const affectedUsers = new Set()

    // First, update all bets
    pendingBets.forEach((bet) => {
      updateBet(bet.id, { status: "won" })
      totalPayout += bet.potentialWin
      affectedUsers.add(bet.userId)
    })

    // Then, update user balances
    affectedUsers.forEach((userId) => {
      const userData = localStorage.getItem(`user_${userId}`)
      if (userData) {
        const user = JSON.parse(userData)
        // Calculate total winnings for this user
        const userWinnings = pendingBets
          .filter((bet) => bet.userId === userId)
          .reduce((sum, bet) => sum + bet.potentialWin, 0)

        const newBalance = user.balance + userWinnings

        // Update in user storage
        localStorage.setItem(
          `user_${userId}`,
          JSON.stringify({
            ...user,
            balance: newBalance,
          }),
        )

        // Also update currentUser if this is the current user
        const currentUserData = localStorage.getItem("currentUser")
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData)
          if (currentUser.email === userId) {
            localStorage.setItem(
              "currentUser",
              JSON.stringify({
                ...currentUser,
                balance: newBalance,
              }),
            )
          }
        }
      }
    })

    setConfirmDialogOpen(false)

    toast({
      title: `All ${option} bets marked as won`,
      description: `${pendingBets.length} bets processed with a total payout of ${currencySettings.symbol}${totalPayout.toFixed(2)}.`,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bets Management</h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Bets</TabsTrigger>
          <TabsTrigger value="completed">Completed Bets</TabsTrigger>
          <TabsTrigger value="option1">Option 1 Bets</TabsTrigger>
          <TabsTrigger value="option2">Option 2 Bets</TabsTrigger>
          <TabsTrigger value="all">All Bets</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bets</CardTitle>
              <CardDescription>Manage bets that are waiting for results.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Potential Win</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets
                    .filter((b) => b.status === "pending")
                    .map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>{formatDate(bet.timestamp)}</TableCell>
                        <TableCell>{bet.userName}</TableCell>
                        <TableCell>{bet.eventTitle}</TableCell>
                        <TableCell>{bet.selection}</TableCell>
                        <TableCell>{bet.odds}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {bet.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {bet.potentialWin.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewBet(bet)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleWinBet(bet)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleLoseBet(bet)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bets.filter((b) => b.status === "pending").length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No pending bets.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Bets</CardTitle>
              <CardDescription>View all completed bets.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Returns</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets
                    .filter((b) => b.status !== "pending")
                    .map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>{formatDate(bet.timestamp)}</TableCell>
                        <TableCell>{bet.userName}</TableCell>
                        <TableCell>{bet.eventTitle}</TableCell>
                        <TableCell>{bet.selection}</TableCell>
                        <TableCell>{bet.odds}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {bet.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {bet.status === "won" && (
                            <Badge variant="default" className="bg-green-500">
                              Win
                            </Badge>
                          )}
                          {bet.status === "lost" && (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              Loss
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {bet.status === "won" ? `${currencySettings.symbol}${bet.potentialWin.toFixed(2)}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bets.filter((b) => b.status !== "pending").length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No completed bets.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="option1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Option 1 Bets</CardTitle>
                <CardDescription>View bets placed on first options.</CardDescription>
              </div>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const option1Bets = bets.filter((b) => {
                    const option = bettingOptions.find((opt) => opt.id === b.eventId)
                    return option && b.selection === option.option1 && b.status === "pending"
                  })

                  if (option1Bets.length === 0) {
                    toast({
                      title: "No pending bets",
                      description: "There are no pending bets for Option 1 to process.",
                      variant: "destructive",
                    })
                    return
                  }

                  // Find the first option1 name to display in confirmation
                  const firstOption = option1Bets[0]
                  const optionName = firstOption.selection

                  handleConfirmAllWinnings("option1", optionName)
                }}
              >
                <Award className="mr-2 h-4 w-4" />
                Release All Option 1 Winnings
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets
                    .filter((b) => {
                      const option = bettingOptions.find((opt) => opt.id === b.eventId)
                      return option && b.selection === option.option1
                    })
                    .map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>{formatDate(bet.timestamp)}</TableCell>
                        <TableCell>{bet.userName}</TableCell>
                        <TableCell>{bet.eventTitle}</TableCell>
                        <TableCell>{bet.selection}</TableCell>
                        <TableCell>{bet.odds}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {bet.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {bet.status === "pending" && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              Pending
                            </Badge>
                          )}
                          {bet.status === "won" && (
                            <Badge variant="default" className="bg-green-500">
                              Win
                            </Badge>
                          )}
                          {bet.status === "lost" && (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              Loss
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewBet(bet)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bets.filter((b) => {
                const option = bettingOptions.find((opt) => opt.id === b.eventId)
                return option && b.selection === option.option1
              }).length === 0 && <div className="text-center py-6 text-muted-foreground">No option 1 bets found.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="option2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Option 2 Bets</CardTitle>
                <CardDescription>View bets placed on second options.</CardDescription>
              </div>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const option2Bets = bets.filter((b) => {
                    const option = bettingOptions.find((opt) => opt.id === b.eventId)
                    return option && b.selection === option.option2 && b.status === "pending"
                  })

                  if (option2Bets.length === 0) {
                    toast({
                      title: "No pending bets",
                      description: "There are no pending bets for Option 2 to process.",
                      variant: "destructive",
                    })
                    return
                  }

                  // Find the first option2 name to display in confirmation
                  const firstOption = option2Bets[0]
                  const optionName = firstOption.selection

                  handleConfirmAllWinnings("option2", optionName)
                }}
              >
                <Award className="mr-2 h-4 w-4" />
                Release All Option 2 Winnings
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets
                    .filter((b) => {
                      const option = bettingOptions.find((opt) => opt.id === b.eventId)
                      return option && b.selection === option.option2
                    })
                    .map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>{formatDate(bet.timestamp)}</TableCell>
                        <TableCell>{bet.userName}</TableCell>
                        <TableCell>{bet.eventTitle}</TableCell>
                        <TableCell>{bet.selection}</TableCell>
                        <TableCell>{bet.odds}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {bet.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {bet.status === "pending" && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              Pending
                            </Badge>
                          )}
                          {bet.status === "won" && (
                            <Badge variant="default" className="bg-green-500">
                              Win
                            </Badge>
                          )}
                          {bet.status === "lost" && (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              Loss
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewBet(bet)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bets.filter((b) => {
                const option = bettingOptions.find((opt) => opt.id === b.eventId)
                return option && b.selection === option.option2
              }).length === 0 && <div className="text-center py-6 text-muted-foreground">No option 2 bets found.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Bets</CardTitle>
              <CardDescription>View all bets.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell>{formatDate(bet.timestamp)}</TableCell>
                      <TableCell>{bet.userName}</TableCell>
                      <TableCell>{bet.eventTitle}</TableCell>
                      <TableCell>{bet.selection}</TableCell>
                      <TableCell>{bet.odds}</TableCell>
                      <TableCell>
                        {currencySettings.symbol}
                        {bet.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {bet.status === "pending" && (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            Pending
                          </Badge>
                        )}
                        {bet.status === "won" && (
                          <Badge variant="default" className="bg-green-500">
                            Win
                          </Badge>
                        )}
                        {bet.status === "lost" && (
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            Loss
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewBet(bet)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {bets.length === 0 && <div className="text-center py-6 text-muted-foreground">No bets available.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Bet Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bet Details</DialogTitle>
            <DialogDescription>View and manage bet details.</DialogDescription>
          </DialogHeader>
          {selectedBet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bet ID</p>
                  <p className="font-medium">{selectedBet.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedBet.timestamp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedBet.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{selectedBet.userId}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Event</p>
                <p className="font-medium">{selectedBet.eventTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Selection</p>
                  <p className="font-medium">{selectedBet.selection}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Odds</p>
                  <p className="font-medium">{selectedBet.odds}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {currencySettings.symbol}
                    {selectedBet.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potential Win</p>
                  <p className="font-medium">
                    {currencySettings.symbol}
                    {selectedBet.potentialWin.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{selectedBet.status}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {selectedBet && selectedBet.status === "pending" && (
              <>
                <Button type="button" variant="destructive" onClick={() => handleLoseBet(selectedBet)}>
                  Mark as Lost
                </Button>
                <Button type="button" onClick={() => handleWinBet(selectedBet)}>
                  Mark as Won
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for Mass Winnings */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              You are about to mark all pending {confirmAction?.option} bets as won.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              This action will process all pending bets for {confirmAction?.option} as wins and credit users with their
              winnings. This cannot be undone.
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={processAllWinnings}
            >
              Confirm and Process Winnings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

