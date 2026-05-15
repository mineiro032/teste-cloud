import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PrivateSocial",
  description: "Rede social de criadores. Conteúdo exclusivo direto da fonte.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-neutral-950 text-white min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
