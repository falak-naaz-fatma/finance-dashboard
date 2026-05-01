"use client";
import { SessionProvider } from "next-auth/react";


import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        value={{
          dark: "dark",
          light: "light",
        }}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
