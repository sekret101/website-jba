"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useSiteContext } from "@/contexts/site-context"

interface UserData {
  name: string
  email: string
  balance: number
  isLoggedIn: boolean
}

export function BetHistory() {
  const [user, setUser] = useState<UserData | null>(null)
  const { bets, currencySettings } = useSiteContext()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Filter bets for the current user
  const userBets = user ? bets.filter((bet) => bet.userId === user.email) : []

  // Sort bets by timestamp (newest first)
  const sortedBets = [...userBets].sort((a, b) => b.timestamp - a.timestamp)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // For mobile view, we'll use a different layout
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (isMobile) {
    return (
      <div className="space-y-4">
        {sortedBets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">No betting history available.</div>
        ) : (
          <div className="mobile-table">
            {sortedBets.map((bet) => (
              <div key={bet.id} className="mobile-table-row">
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Date:</span>
                  <span>{formatDate(bet.timestamp)}</span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Event:</span>
                  <span className="truncate max-w-[180px]">{bet.eventTitle}</span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Selection:</span>
                  <span className="truncate max-w-[120px]">{bet.selection}</span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Odds:</span>
                  <span>{bet.odds}</span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Stake:</span>
                  <span>
                    {currencySettings.symbol}
                    {bet.amount.toFixed(2)}
                  </span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Result:</span>
                  <span>
                    {bet.status === "won" && (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        Win
                      </Badge>
                    )}
                    {bet.status === "lost" && (
                      <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                        Loss
                      </Badge>
                    )}
                    {bet.status === "pending" && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                        Pending
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="mobile-table-cell">
                  <span className="mobile-table-label">Returns:</span>
                  <span>{bet.status === "won" ? `${currencySettings.symbol}${bet.potentialWin.toFixed(2)}` : "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Desktop view
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="min-w-full inline-block align-middle p-4 md:p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Selection</TableHead>
              <TableHead>Odds</TableHead>
              <TableHead>Stake</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Returns</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBets.map((bet) => (
              <TableRow key={bet.id}>
                <TableCell className="whitespace-nowrap">{formatDate(bet.timestamp)}</TableCell>
                <TableCell className="max-w-[120px] md:max-w-none truncate">{bet.eventTitle}</TableCell>
                <TableCell className="max-w-[100px] md:max-w-none truncate">{bet.selection}</TableCell>
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
                  {bet.status === "pending" && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {bet.status === "won" ? `${currencySettings.symbol}${bet.potentialWin.toFixed(2)}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sortedBets.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">No betting history available.</div>
        )}
      </div>
    </div>
  )
}

