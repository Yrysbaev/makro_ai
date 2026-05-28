import './globals.css'

export const metadata = {
  title: 'Makro Sales Intelligence',
  description: 'AI-powered sales dashboard for wholesale food distribution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
