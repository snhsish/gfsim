import type { Metadata } from "next";
import { Public_Sans, Fraunces, Space_Mono } from "next/font/google";
import "@/styles/globals.css";

const fontSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400"
});

export const metadata: Metadata = {
  title: "Girlfriend Simulator",
  description: "A relationship dynamics simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
