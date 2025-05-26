import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ImageMark - Free Online Watermark Tool | Add Watermarks to Images",
  description:
    "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download. Protect your photos and images with professional watermarks.",
  keywords: [
    "watermark",
    "image watermark",
    "photo watermark",
    "batch watermark",
    "free watermark tool",
    "online watermark",
    "protect images",
    "logo watermark",
    "text watermark",
    "image protection",
  ],
  authors: [{ name: "ImageMark" }],
  creator: "ImageMark",
  publisher: "ImageMark",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imagemark.app",
    title: "ImageMark - Free Online Watermark Tool",
    description: "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.",
    siteName: "ImageMark",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ImageMark - Free Online Watermark Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageMark - Free Online Watermark Tool",
    description: "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.",
    images: ["/og-image.png"],
    creator: "@imagemark",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://imagemark.app",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0D9488" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
