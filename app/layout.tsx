import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImpactQuest - Gamified Impact Platform",
  description: "Turn real-world impact into on-chain achievements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress third-party analytics errors in development
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = function(...args) {
                  const errorMsg = args[0]?.toString() || '';
                  // Suppress known third-party errors
                  if (
                    errorMsg.includes('Analytics SDK') ||
                    errorMsg.includes('cca-lite.coinbase.com') ||
                    errorMsg.includes('ERR_BLOCKED_BY_CLIENT') ||
                    errorMsg.includes('Reown Config')
                  ) {
                    return; // Silently ignore these errors
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
