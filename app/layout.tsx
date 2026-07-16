import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

/** Landing page only — the app itself stays on the system stack via --font. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RigTrak",
  description: "RFID asset & compliance tracking for rigging gear.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
