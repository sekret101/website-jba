"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Check, X, ArrowUpRight, ArrowDownRight, Eye, ImageIcon, AlertCircle } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"
import type { Transaction } from "@/contexts/site-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TransactionsManagement() {
  const { transactions, updateTransaction, currencySettings, setHasNewNotifications } = useSiteContext()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  // Use useEffect to mark notifications as read when the component mounts
  useEffect(() => {
    setHasNewNotifications(false)
  }, [setHasNewNotifications])

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setNotes(transaction.notes || "")
    setViewDialogOpen(true)
  }

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setReceiptDialogOpen(true)
  }

  const openConfirmDialog = (transaction: Transaction, action: "approve" | "reject") => {
    setSelectedTransaction(transaction)
    setConfirmAction(action)
    setConfirmDialogOpen(true)
  }

  const handleApproveTransaction = (transaction: Transaction) => {
    // Update transaction status
    updateTransaction(transaction.id, { status: "approved", notes })

    // If it's a deposit, update user balance
    if (transaction.type === "deposit") {
      const userData = localStorage.getItem(`user_${transaction.userId}`)
      if (userData) {
        const user = JSON.parse(userData)
        const newBalance = user.balance + transaction.amount
        localStorage.setItem(
          `user_${transaction.userId}`,
          JSON.stringify({
            ...user,
            balance: newBalance,
          }),
        )

        // Also update currentUser if this is the current user
        const currentUserData = localStorage.getItem("currentUser")
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData)
          if (currentUser.email === transaction.userId) {
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
    }
    // If it's a withdrawal, deduct from user balance
    else if (transaction.type === "withdraw") {
      const userData = localStorage.getItem(`user_${transaction.userId}`)
      if (userData) {
        const user = JSON.parse(userData)
        const newBalance = Math.max(0, user.balance - transaction.amount) // Ensure balance doesn't go below 0
        localStorage.setItem(
          `user_${transaction.userId}`,
          JSON.stringify({
            ...user,
            balance: newBalance,
          }),
        )

        // Also update currentUser if this is the current user
        const currentUserData = localStorage.getItem("currentUser")
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData)
          if (currentUser.email === transaction.userId) {
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
    }

    setViewDialogOpen(false)
    setConfirmDialogOpen(false)
    toast({
      title: "Transaction approved",
      description: `The ${transaction.type} transaction has been approved successfully.`,
    })
  }

  const handleRejectTransaction = (transaction: Transaction) => {
    // Update transaction status
    updateTransaction(transaction.id, { status: "rejected", notes })

    // If it's a withdrawal, refund the user
    if (transaction.type === "withdraw") {
      const userData = localStorage.getItem(`user_${transaction.userId}`)
      if (userData) {
        const user = JSON.parse(userData)
        const newBalance = user.balance + transaction.amount
        localStorage.setItem(
          `user_${transaction.userId}`,
          JSON.stringify({
            ...user,
            balance: newBalance,
          }),
        )

        // Also update currentUser if this is the current user
        const currentUserData = localStorage.getItem("currentUser")
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData)
          if (currentUser.email === transaction.userId) {
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
    }

    setViewDialogOpen(false)
    setConfirmDialogOpen(false)
    toast({
      title: "Transaction rejected",
      description: `The ${transaction.type} transaction has been rejected.`,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction Management</h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>Review and manage pending deposit and withdrawal requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => t.status === "pending")
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transaction.type === "deposit" ? (
                              <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {transaction.receiptImage ? (
                            <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(transaction)}>
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openConfirmDialog(transaction, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openConfirmDialog(transaction, "reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {transactions.filter((t) => t.status === "pending").length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No pending transactions.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Transactions</CardTitle>
              <CardDescription>View all deposit transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => t.type === "deposit")
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {transaction.receiptImage ? (
                            <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(transaction)}>
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          )}
                          {transaction.status === "approved" && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Approved
                            </Badge>
                          )}
                          {transaction.status === "rejected" && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {transactions.filter((t) => t.type === "deposit").length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No deposit transactions.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Transactions</CardTitle>
              <CardDescription>View all withdrawal transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => t.type === "withdraw")
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>
                          {currencySettings.symbol}
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{transaction.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          {transaction.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          )}
                          {transaction.status === "approved" && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Approved
                            </Badge>
                          )}
                          {transaction.status === "rejected" && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {transactions.filter((t) => t.type === "withdraw").length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No withdrawal transactions.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View all transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt/Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>{transaction.userName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {transaction.type === "deposit" ? (
                            <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {currencySettings.symbol}
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {transaction.type === "deposit" && transaction.receiptImage ? (
                          <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(transaction)}>
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          </Button>
                        ) : transaction.type === "withdraw" && transaction.phoneNumber ? (
                          <span className="text-sm">{transaction.phoneNumber}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.status === "pending" && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Pending
                          </Badge>
                        )}
                        {transaction.status === "approved" && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Approved
                          </Badge>
                        )}
                        {transaction.status === "rejected" && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No transactions.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Transaction Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View and manage transaction details.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedTransaction.timestamp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{selectedTransaction.userId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {currencySettings.symbol}
                    {selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedTransaction.type === "withdraw" && selectedTransaction.phoneNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{selectedTransaction.phoneNumber}</p>
                </div>
              )}

              {selectedTransaction.type === "deposit" && selectedTransaction.receiptImage && (
                <div>
                  <p className="text-sm text-muted-foreground">Receipt</p>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewDialogOpen(false)
                        setTimeout(() => {
                          handleViewReceipt(selectedTransaction)
                        }, 100)
                      }}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{selectedTransaction.status}</p>
              </div>

              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <Textarea
                  placeholder="Add notes about this transaction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {selectedTransaction && selectedTransaction.status === "pending" && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => openConfirmDialog(selectedTransaction, "reject")}
                >
                  Reject
                </Button>
                <Button type="button" onClick={() => openConfirmDialog(selectedTransaction, "approve")}>
                  Approve
                </Button>
              </>
            )}
            {selectedTransaction && selectedTransaction.status !== "pending" && (
              <Button
                type="button"
                onClick={() => {
                  updateTransaction(selectedTransaction.id, { notes })
                  setViewDialogOpen(false)
                  toast({
                    title: "Notes updated",
                    description: "Transaction notes have been updated.",
                  })
                }}
              >
                Update Notes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Image Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>View the uploaded payment receipt.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && selectedTransaction.receiptImage && (
            <div className="flex justify-center">
              <img
                src={selectedTransaction.receiptImage || "/placeholder.svg"}
                alt="Payment Receipt"
                className="max-h-[70vh] max-w-full object-contain rounded-md"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{confirmAction === "approve" ? "Approve Transaction" : "Reject Transaction"}</DialogTitle>
            <DialogDescription>
              {confirmAction === "approve"
                ? "Are you sure you want to approve this transaction?"
                : "Are you sure you want to reject this transaction?"}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="py-4">
              <Alert className={confirmAction === "approve" ? "bg-green-50" : "bg-red-50"}>
                <AlertCircle className={`h-4 w-4 ${confirmAction === "approve" ? "text-green-600" : "text-red-600"}`} />
                <AlertDescription className={confirmAction === "approve" ? "text-green-700" : "text-red-700"}>
                  {confirmAction === "approve" && selectedTransaction.type === "deposit" && (
                    <>
                      This will credit {currencySettings.symbol}
                      {selectedTransaction.amount.toFixed(2)} to the user's account.
                    </>
                  )}
                  {confirmAction === "approve" && selectedTransaction.type === "withdraw" && (
                    <>
                      This will confirm the withdrawal of {currencySettings.symbol}
                      {selectedTransaction.amount.toFixed(2)} from the user's account.
                    </>
                  )}
                  {confirmAction === "reject" && selectedTransaction.type === "deposit" && (
                    <>This will reject the deposit request. No funds will be added to the user's account.</>
                  )}
                  {confirmAction === "reject" && selectedTransaction.type === "withdraw" && (
                    <>
                      This will reject the withdrawal and return {currencySettings.symbol}
                      {selectedTransaction.amount.toFixed(2)} to the user's account.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <Label htmlFor="confirm-notes">Admin Notes</Label>
                <Textarea
                  id="confirm-notes"
                  placeholder="Add notes about this decision (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            {selectedTransaction && confirmAction === "approve" && (
              <Button type="button" variant="default" onClick={() => handleApproveTransaction(selectedTransaction)}>
                Confirm Approval
              </Button>
            )}
            {selectedTransaction && confirmAction === "reject" && (
              <Button type="button" variant="destructive" onClick={() => handleRejectTransaction(selectedTransaction)}>
                Confirm Rejection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

