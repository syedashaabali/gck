import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gulmarg Cloud Kitchen | Fine-Dining Kashmiri Wazwan, Delivered",
  description:
    "Heritage Kashmiri Wazwan — slow-braised Rogan Josh, Gushtaba and Zafrani delicacies crafted fresh and delivered to your doorstep.",
};

export const viewport: Viewport = {
  themeColor: "#070709",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${jakarta.variable} dark`}
    >
      <body className="min-h-screen">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
