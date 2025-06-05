import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Navbar } from "@/components/custom/Navbar"
import { Sidebar } from "@/components/custom/Sidebar"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BillTrack Pro",
  description: "Modern bill management system"
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="bg-gray-50">
            {/* <Navbar /> */}
            {/* <Sidebar /> */}
            <main className="pt-20 pb-6 px-4">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}