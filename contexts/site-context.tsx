"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Define types for our context data
interface BettingOption {
  id: number
  title: string
  description: string
  option1: string
  option2: string
  odds1: string
  odds2: string
  active: boolean
  liveStream: boolean
}

interface LiveStream {
  id: number
  name: string
  url: string
  status: string
  viewers?: number
  quality: string
  scheduledTime?: string
}

interface CurrencySettings {
  currency: string
  symbol: string
  minDeposit: number
  maxDeposit: number
  minWithdraw: number
  maxWithdraw: number
  gcashNumber: string
}

export interface Transaction {
  id: string
  userId: string
  userName: string
  type: "deposit" | "withdraw"
  amount: number
  status: "pending" | "approved" | "rejected"
  phoneNumber?: string
  receiptImage?: string
  timestamp: number
  notes?: string
}

export interface Bet {
  id: string
  userId: string
  userName: string
  eventId: number
  eventTitle: string
  selection: string
  odds: string
  amount: number
  potentialWin: number
  status: "pending" | "won" | "lost"
  timestamp: number
  result?: string
}

interface SiteContextType {
  bettingOptions: BettingOption[]
  setBettingOptions: (options: BettingOption[]) => void
  liveStreams: LiveStream[]
  setLiveStreams: (streams: LiveStream[]) => void
  currencySettings: CurrencySettings
  setCurrencySettings: (settings: CurrencySettings) => void
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  bets: Bet[]
  setBets: (bets: Bet[]) => void
  addBet: (bet: Omit<Bet, "id" | "timestamp">) => void
  updateBet: (id: string, updates: Partial<Bet>) => void
  hasNewNotifications: boolean
  setHasNewNotifications: (value: boolean) => void
}

// Initial data
const initialBettingOptions: BettingOption[] = []

const initialLiveStreams: LiveStream[] = []

const initialCurrencySettings: CurrencySettings = {
  currency: "PHP",
  symbol: "₱",
  minDeposit: 50,
  maxDeposit: 50000,
  minWithdraw: 50,
  maxWithdraw: 25000,
  gcashNumber: "09123456789", // Default GCash number
}

// Create context
const SiteContext = createContext<SiteContextType | undefined>(undefined)

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Provider component
export function SiteProvider({ children }: { children: ReactNode }) {
  const [bettingOptions, setBettingOptions] = useState<BettingOption[]>(initialBettingOptions)
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(initialLiveStreams)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(initialCurrencySettings)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedBettingOptions = localStorage.getItem("bettingOptions")
    const storedLiveStreams = localStorage.getItem("liveStreams")
    const storedCurrencySettings = localStorage.getItem("currencySettings")
    const storedTransactions = localStorage.getItem("transactions")
    const storedBets = localStorage.getItem("bets")

    if (storedBettingOptions) {
      setBettingOptions(JSON.parse(storedBettingOptions))
    }
    if (storedLiveStreams) {
      setLiveStreams(JSON.parse(storedLiveStreams))
    }
    if (storedCurrencySettings) {
      setCurrencySettings(JSON.parse(storedCurrencySettings))
    }
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
    if (storedBets) {
      setBets(JSON.parse(storedBets))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bettingOptions", JSON.stringify(bettingOptions))
  }, [bettingOptions])

  useEffect(() => {
    localStorage.setItem("liveStreams", JSON.stringify(liveStreams))
  }, [liveStreams])

  useEffect(() => {
    localStorage.setItem("currencySettings", JSON.stringify(currencySettings))
  }, [currencySettings])

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("bets", JSON.stringify(bets))
  }, [bets])

  // Helper functions for transactions
  const addTransaction = (transaction: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      timestamp: Date.now(),
    }
    setTransactions((prev) => [...prev, newTransaction])
    setHasNewNotifications(true)
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === id ? { ...transaction, ...updates } : transaction)),
    )
  }

  // Helper functions for bets
  const addBet = (bet: Omit<Bet, "id" | "timestamp">) => {
    const newBet: Bet = {
      ...bet,
      id: generateId(),
      timestamp: Date.now(),
    }
    setBets((prev) => [...prev, newBet])
  }

  const updateBet = (id: string, updates: Partial<Bet>) => {
    setBets((prev) => prev.map((bet) => (bet.id === id ? { ...bet, ...updates } : bet)))
  }

  return (
    <SiteContext.Provider
      value={{
        bettingOptions,
        setBettingOptions,
        liveStreams,
        setLiveStreams,
        currencySettings,
        setCurrencySettings,
        transactions,
        setTransactions,
        addTransaction,
        updateTransaction,
        bets,
        setBets,
        addBet,
        updateBet,
        hasNewNotifications,
        setHasNewNotifications,
      }}
    >
      {children}
    </SiteContext.Provider>
  )
}

// Custom hook to use the context
export function useSiteContext() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error("useSiteContext must be used within a SiteProvider")
  }
  return context
}

