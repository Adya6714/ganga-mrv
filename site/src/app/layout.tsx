import type { Metadata } from 'next'
import { DM_Serif_Display, Inter, Nunito_Sans } from 'next/font/google'
import './globals.css'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Project Ganga — Alt Carbon ERW MRV Pipeline',
  description:
    'A complete Enhanced Rock Weathering MRV pipeline built as a take-home assignment for Alt Carbon. ' +
    'Net CDR 39.49 t CO₂/ha · 95% CI [−104.06, 183.05] · Digital-twin coverage 95.0% at N=2.',
  openGraph: {
    title: 'Project Ganga — Alt Carbon ERW MRV Pipeline',
    description:
      'Net CDR 39.49 t/ha with CI crossing zero. Four independent statistical methods converge. Digital-twin correctness proof.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${inter.variable} ${nunitoSans.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
