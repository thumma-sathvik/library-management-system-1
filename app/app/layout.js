import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

// Fallback font from Google (optional)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

// Setup Geist fonts
const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-geist',
})

const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-geist-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${inter.className}`}>
      <body>{children}</body>
    </html>
  )
}