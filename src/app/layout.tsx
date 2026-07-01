import Script from 'next/script';
import { AppProviders } from './providers/AppProvider';
import { Toaster } from "@/components/ui/toaster";
import '@/app/globals.css';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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
    themeColor: '#2563eb',
};

export default function RootLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            {ADSENSE_CLIENT_ID && (
                <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
            )}
        </head>
        <body suppressHydrationWarning>
        {ADSENSE_CLIENT_ID && (
            <Script
                id="adsense-loader"
                async
                strategy="afterInteractive"
                crossOrigin="anonymous"
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            />
        )}
        <AppProviders>
            {children}
            <Toaster />
        </AppProviders>
        </body>
        </html>
    );
}