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
  title: {
    default: "ASTRA — Explore the Universe in 3D",
    template: "%s | ASTRA",
  },
  description:
    "Journey from the Solar System to the Milky Way in an interactive 3D universe built for exploration and learning.",
  applicationName: "ASTRA",
  openGraph: {
    type: "website",
    siteName: "ASTRA",
    title: "ASTRA — Explore the Universe in 3D",
    description:
      "Journey from the Solar System to the Milky Way in an interactive 3D universe built for exploration and learning.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
