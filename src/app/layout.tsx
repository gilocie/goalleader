import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { BrandingProvider } from '@/context/branding-context';

export const metadata: Metadata = {
  title: 'GoalLeader Dashboard',
  description: 'Productivity and project management dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <BrandingProvider>
            {children}
            <Toaster />
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
