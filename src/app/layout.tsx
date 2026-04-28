/*
IMPORTANT:
All code in this project must follow /docs/CURSOR_RULES.md.
Prefer simple working code over complex architecture.
Do not overengineer.
*/

import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const arkadiansSans = Inter({
  variable: "--font-arkadians-sans",
  subsets: ["latin"],
});

const arkadiansMono = JetBrains_Mono({
  variable: "--font-arkadians-mono",
  subsets: ["latin"],
});

const arkadiansDisplay = Playfair_Display({
  variable: "--font-arkadians-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Arkadians CRM",
  description: "The Arkadians AI Sales & Experience CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${arkadiansSans.variable} ${arkadiansMono.variable} ${arkadiansDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-navy">
        <div className="min-h-full flex">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar />
            <main className="flex-1 min-w-0 overflow-y-auto bg-[#FAFAFA]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
