import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Check-in de Crachás - IIR Brasil",
  description: "Sistema de check-in de crachas para voluntarios IIR Brasil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
