import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "VISA Maceió — Sistema de Licenciamento Sanitário",
    template: "%s | VISA Maceió",
  },
  description:
    "Plataforma integrada de gestão de licenciamento, fiscalização e controle sanitário da Vigilância Sanitária de Maceió — Prefeitura Municipal.",
  keywords: [
    "vigilância sanitária",
    "licenciamento sanitário",
    "VISA Maceió",
    "alvará sanitário",
    "prefeitura maceió",
    "saúde pública",
  ],
  authors: [{ name: "Vigilância Sanitária — Prefeitura de Maceió" }],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "VISA Maceió — Sistema de Licenciamento Sanitário",
    description: "Plataforma de gestão de licenciamento e fiscalização sanitária da Prefeitura de Maceió.",
    type: "website",
    locale: "pt_BR",
  },
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
