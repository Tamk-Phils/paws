import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PushManager from "@/components/PushManager";
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
    default: "PawsomeBreed | Adopt. Rescue. Love.",
    template: "%s | PawsomeBreed"
  },
  description: "Connecting families with incredible Boxer and Rottweiler puppies from trusted individuals and rescues.",
  keywords: ["Boxer", "Rottweiler", "puppy adoption", "dog rescue", "PawsomeBreed", "adopt a puppy"],
  openGraph: {
    title: "PawsomeBreed",
    description: "Connecting families with incredible Boxer and Rottweiler puppies from trusted individuals and rescues.",
    siteName: "PawsomeBreed",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PawsomeBreed",
    description: "Connecting families with incredible Boxer and Rottweiler puppies.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <PushManager />
      </body>
    </html>
  );
}
