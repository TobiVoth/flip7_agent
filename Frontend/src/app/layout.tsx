import type { Metadata, Viewport } from "next";
import { Cinzel, Oswald, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-cinzel",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FLIP 7 – KI Live-Assistent & Kartenzähler",
  description:
    "Interaktiver Flip 7 KI-Ratgeber im offiziellen Art-Deco Kartendesign für Smartphone, iPad und Laptop.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#191d42",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${cinzel.variable} ${oswald.variable} ${inter.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-[#e6d130] selection:text-[#232755]">
        {children}
      </body>
    </html>
  );
}
