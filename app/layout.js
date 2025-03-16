import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Snapgram - Share Your Moments",
  description: "A social media platform for sharing your favorite moments",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden">{children}</main>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

