import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GITTE Sewing Machines - Quality Machines for Every Sewer",
  description: "Shop quality sewing machines from GITTE and top brands. From beginners to professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
        <VisualEditsMessenger />
        <ErrorReporter />
        <Script id="parent-message-listener" strategy="afterInteractive">
          {`
            window.addEventListener('message', (event) => {
              if (event.data.type === 'OPEN_EXTERNAL_URL') {
                window.open(event.data.data.url, '_blank', 'noopener,noreferrer');
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}