import { ColorSchemeScript } from '@mantine/core';
import { AppProviders } from './providers/AppProvider';
import { Toaster } from "@/components/ui/toaster";
import '@/app/globals.css';

export const metadata = {
    title: 'DriveUnity - Multi-Cloud Drive Manager',
    description: 'Manage all your cloud drives in one unified, beautiful interface. Connect, organize, and access your files across multiple cloud storage platforms seamlessly.',
    keywords: 'cloud storage, drive manager, file management, multi-cloud, Google Drive, Dropbox, OneDrive',
    authors: [{ name: 'DriveUnity Team' }],
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
    openGraph: {
        title: 'DriveUnity - Multi-Cloud Drive Manager',
        description: 'Manage all your cloud drives in one unified interface',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DriveUnity - Multi-Cloud Drive Manager',
        description: 'Manage all your cloud drives in one unified interface',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#667eea',
};

export default function RootLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ColorSchemeScript />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body suppressHydrationWarning>
        <AppProviders>
            {children}
            <Toaster />
        </AppProviders>
        </body>
        </html>
    );
}