import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import Providers from "./providers";

export const metadata = {
  title: "Spendly",
  description: "Smart spending tracker — track income, expenses and financial goals",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
