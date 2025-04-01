"use client"

import { Bell } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function AdminNotification() {
  const { transactions, hasNewNotifications, setHasNewNotifications } = useSiteContext()

  // Count pending transactions
  const pendingCount = transactions.filter((t) => t.status === "pending").length

  // Reset notification when component mounts
  useEffect(() => {
    if (pendingCount === 0) {
      setHasNewNotifications(false)
    }
  }, [pendingCount, setHasNewNotifications])

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {pendingCount}
        </span>
      )}
      {hasNewNotifications && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>}
    </Button>
  )
}

