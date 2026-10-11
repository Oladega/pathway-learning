import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Pathway · Learning OS",
  description:
    "A practical 52-week journey from product design to AI engineering.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
