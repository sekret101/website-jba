"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Save, Smartphone } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"

export default function CurrencySettings() {
  const { currencySettings, setCurrencySettings } = useSiteContext()
  const [minDeposit, setMinDeposit] = useState(currencySettings.minDeposit)
  const [maxDeposit, setMaxDeposit] = useState(currencySettings.maxDeposit)
  const [minWithdraw, setMinWithdraw] = useState(currencySettings.minWithdraw)
  const [maxWithdraw, setMaxWithdraw] = useState(currencySettings.maxWithdraw)
  const [gcashNumber, setGcashNumber] = useState(currencySettings.gcashNumber)
  const { toast } = useToast()

  // Update local state when context changes
  useEffect(() => {
    setMinDeposit(currencySettings.minDeposit)
    setMaxDeposit(currencySettings.maxDeposit)
    setMinWithdraw(currencySettings.minWithdraw)
    setMaxWithdraw(currencySettings.maxWithdraw)
    setGcashNumber(currencySettings.gcashNumber)
  }, [currencySettings])

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate GCash number
    if (!gcashNumber || gcashNumber.length < 10) {
      toast({
        title: "Invalid GCash number",
        description: "Please enter a valid GCash number.",
        variant: "destructive",
      })
      return
    }

    // Update the context with new settings
    setCurrencySettings({
      ...currencySettings,
      minDeposit,
      maxDeposit,
      minWithdraw,
      maxWithdraw,
      gcashNumber,
    })

    toast({
      title: "Currency settings saved",
      description: "Your currency settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Currency Settings</h1>

      <form onSubmit={handleSaveSettings}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Philippine Peso (₱) Settings</CardTitle>
              <CardDescription>Configure the currency settings for your betting platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gcash-number" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    GCash Account Number
                  </Label>
                  <Input
                    id="gcash-number"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the GCash number that will be displayed to users for deposits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Limits</CardTitle>
              <CardDescription>Set minimum and maximum limits for deposits and withdrawals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min-deposit">Minimum Deposit (₱)</Label>
                    <Input
                      id="min-deposit"
                      type="number"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max-deposit">Maximum Deposit (₱)</Label>
                    <Input
                      id="max-deposit"
                      type="number"
                      value={maxDeposit}
                      onChange={(e) => setMaxDeposit(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="min-withdraw">Minimum Withdrawal (₱)</Label>
                    <Input
                      id="min-withdraw"
                      type="number"
                      value={minWithdraw}
                      onChange={(e) => setMinWithdraw(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max-withdraw">Maximum Withdrawal (₱)</Label>
                    <Input
                      id="max-withdraw"
                      type="number"
                      value={maxWithdraw}
                      onChange={(e) => setMaxWithdraw(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Currency Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

