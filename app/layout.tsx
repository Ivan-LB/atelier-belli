import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atelier Belli',
  description: 'Created with react, tailwindcss and nextjs',
  generator: 'Next.js',
  icons: {
    icon: '/AtelierBelli.png'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
