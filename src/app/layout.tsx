import type { Metadata } from "next";
import { Public_Sans, Fraunces, Space_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-svh flex flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
