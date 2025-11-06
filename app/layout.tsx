import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Find CPA Accountants in Canada | Compare Rates & Save Money | findmeca',
  description: 'Find the best CPA accountants in Canada with findmeca. Compare rates, read reviews, and save thousands on accounting fees. Access our comprehensive directory of verified CPA firms across Toronto, Vancouver, Montreal, Calgary, and more.',
  keywords: 'CPA Canada, accountant Canada, CPA directory, find CPA, accounting services Canada, tax accountant, CPA firms, chartered accountant, CPA near me',
  openGraph: {
    title: 'Find CPA Accountants in Canada | Save Money on Accounting Fees',
    description: 'Compare CPA firms across Canada. Find verified accountants with reviews and ratings. Save thousands on accounting fees.',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find CPA Accountants in Canada | Save Money',
    description: 'Compare CPA firms and save thousands on accounting fees.',
  },
  alternates: {
    canonical: 'https://cpacanadadirectory.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

