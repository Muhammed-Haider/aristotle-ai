import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aristotle — Learn with Reason",
  description: "AI-powered Socratic CS tutor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
