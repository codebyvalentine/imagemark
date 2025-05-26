import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

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
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "ImageMark - Free Online Watermark Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageMark - Free Online Watermark Tool",
    description: "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.",
    images: ["/android-chrome-512x512.png"],
    creator: "@imagemark",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://imagemark.app",
  },
  generator: "v0.dev",
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
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <meta name="theme-color" content="#0D9488" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Suspense>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
