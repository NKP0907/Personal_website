import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "A Special Question for You ❤️",
  description: "I have something very special to ask you...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-romantic-gradient selection:bg-pink-300 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
