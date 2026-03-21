import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "VISA Maceió — Sistema de Licenciamento Sanitário",
  description: "Plataforma integrada de gestão de licenciamento, fiscalização e controle sanitário da Secretaria Municipal de Saúde de Maceió.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
