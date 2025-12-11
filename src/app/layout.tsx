import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NavigationProvider, NavigationLoader } from "@/context/NavigationContext";

export const metadata: Metadata = {
  title: "Task Calendar",
  description: "Organize your tasks with a beautiful calendar",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <ThemeProvider>
              <Suspense fallback={null}>
                <NavigationProvider>
                  <NavigationLoader />
                  {children}
                </NavigationProvider>
              </Suspense>
            </ThemeProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
