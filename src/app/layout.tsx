import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImobIA",
  description: "Atendimento imobiliario com IA integrada ao WhatsApp."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
