/**
 * @dev Root layout component for the entire application
 * Features: global styles, authentication provider, metadata configuration
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/markdown.css";
import AuthProvider from "@/providers/auth-provider";

/**
 * @dev Inter font configuration for consistent typography
 */
const inter = Inter({ subsets: ["latin"] });

/**
 * @dev Global metadata configuration for SEO
 */
export const metadata: Metadata = {
  title: "DSAGPT Tutor",
  description: "Your AI-powered DSA learning companion",
};

/**
 * @dev Root layout component that wraps all pages
 * Provides authentication context and global styling
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}