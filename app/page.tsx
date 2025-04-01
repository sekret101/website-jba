"use client"

import Link from "next/link"
import { BettingCard } from "@/components/betting-card"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"
import { UserNav } from "@/components/user-nav"
import { AdminAuth } from "@/components/admin-auth"
import { useSiteContext } from "@/contexts/site-context"
import { useState } from "react"
import { Menu, TrendingUp, Trophy, Zap, Users, Wallet, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

export default function HomePage() {
  const { bettingOptions } = useSiteContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isMobile, isClient } = useMobile()

  // Filter only active betting options
  const activeBettingOptions = bettingOptions.filter((option) => option.active)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-md pulse-animation">
              <Trophy className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span className="text-lg md:text-xl font-bold gradient-text">JBA Betting</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Live Events</span>
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span>My Account</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <DepositModal />
              <WithdrawModal />
            </div>
            <UserNav />
            <AdminAuth />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-3 bg-background">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Live Events</span>
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>My Account</span>
              </Link>
              <div className="flex gap-2 pt-2">
                <DepositModal />
                <WithdrawModal />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <section className="container py-4 md:py-12">
          <div className="flex flex-col items-center text-center gap-3 md:gap-8 fade-in">
            <div className="space-y-2 md:space-y-4 max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight lg:text-5xl gradient-text">Live Betting</h1>
              <p className="text-sm md:text-xl text-muted-foreground">
                Place your bets on live events happening right now.
              </p>
            </div>

            <div className="mt-2">
              <Button size="sm" className="shine-effect text-sm md:text-base md:size-lg">
                <Zap className="mr-2 h-4 w-4" />
                Start Betting Now
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 md:mt-8 mb-3 md:mb-4">
            <h2 className="text-lg md:text-2xl font-bold gradient-text">Featured Events</h2>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Live Now
            </Badge>
          </div>

          {activeBettingOptions.length > 0 ? (
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
              {activeBettingOptions.map((option, index) => (
                <div key={option.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <BettingCard
                    id={option.id}
                    title={option.title}
                    description={option.description}
                    option1={option.option1}
                    option2={option.option2}
                    odds1={option.odds1}
                    odds2={option.odds2}
                    liveStream={option.liveStream}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 md:py-20 fade-in">
              <p className="text-base md:text-xl text-muted-foreground">No active betting options available.</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Check back later for new betting opportunities.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-4 md:py-6 bg-background">
        <div className="container flex flex-col items-center justify-between gap-2 md:gap-4 md:h-16 md:flex-row">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} JBA Betting Site. This is a demonstration platform only.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile bottom navigation - only render on client side */}
      {isClient && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center py-2 z-40 safe-bottom">
          <Link href="/" className="flex flex-col items-center text-xs">
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </Link>
          <DepositModal />
          <WithdrawModal />
          <Link href="/account" className="flex flex-col items-center text-xs">
            <Wallet className="h-5 w-5 mb-1" />
            <span>Account</span>
          </Link>
        </div>
      )}
    </div>
  )
}

