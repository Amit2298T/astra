import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
