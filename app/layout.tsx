import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NovaTalk - Meet New People Instantly",
  description:
    "Connect with strangers worldwide through video, voice, and text chat in seconds. Modern, safe, and premium random chat platform.",
  keywords: ["random chat", "stranger chat", "video chat", "omegle alternative", "meet new people"],
  openGraph: {
    title: "NovaTalk - Meet New People Instantly",
    description: "Connect with strangers worldwide through video, voice, and text chat.",
    type: "website",
    url: "https://novatalk.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaTalk - Meet New People Instantly",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
