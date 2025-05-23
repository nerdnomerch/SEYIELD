import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Twitter, Github, Linkedin, Send } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                <span className="font-bold text-white">E</span>
              </div>
              <span className="font-bold text-xl">SEYIELD</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              The first Buy Now Pay Never platform on SEI Network where you can shop using rewards from your deposits. Your original
              deposit stays intact.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/deposit" className="text-muted-foreground hover:text-primary transition-colors">
                  Deposit
                </Link>
              </li>
              <li>
                <Link href="/withdraw" className="text-muted-foreground hover:text-primary transition-colors">
                  Withdraw
                </Link>
              </li>
              <li>
                <Link href="/swap" className="text-muted-foreground hover:text-primary transition-colors">
                  Convert
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/faucet" className="text-muted-foreground hover:text-primary transition-colors">
                  Faucet
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="max-w-[220px]" />
              <Button
                size="icon"
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SEYIELD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
