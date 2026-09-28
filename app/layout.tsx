import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gundemsi.com"),

  title: {
    default: "GÜNDEMSİ | Gündeme değin.",
    template: "%s | GÜNDEMSİ",
  },

  description:
    "GÜNDEMSİ, gündemdeki son gelişmeleri ve önemli haberleri takip edebileceğiniz güncel haber platformudur.",

  applicationName: "GÜNDEMSİ",

  keywords: [
    "haber",
    "son dakika",
    "gündem",
    "Türkiye haberleri",
    "güncel haberler",
    "GÜNDEMSİ",
  ],

  authors: [{ name: "GÜNDEMSİ" }],
  creator: "GÜNDEMSİ",
  publisher: "GÜNDEMSİ",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "GÜNDEMSİ",
    title: "GÜNDEMSİ | Gündeme değin.",
    description:
      "GÜNDEMSİ, gündemdeki son gelişmeleri ve önemli haberleri takip edebileceğiniz güncel haber platformudur.",
  },

  twitter: {
    card: "summary_large_image",
    title: "GÜNDEMSİ | Gündeme değin.",
    description:
      "GÜNDEMSİ, gündemdeki son gelişmeleri ve önemli haberleri takip edebileceğiniz güncel haber platformudur.",
  },

  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  {children}
</body>
    </html>
  );
}