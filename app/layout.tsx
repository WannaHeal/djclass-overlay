import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DJ CLASS OBS Overlay',
  description: 'V-Archive DJ CLASS OBS Overlay Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
