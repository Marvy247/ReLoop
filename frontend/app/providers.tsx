'use client';

import { DAppKitProvider } from '@vechain/dapp-kit-react';
import { ThemeProvider } from 'next-themes';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const walletConnectOptions = {
        projectId: 'cb44e6bd7a2139350e8c0fb2d0fea8cb', // Get from https://cloud.walletconnect.com/sign-up
        metadata: {
            name: 'My dApp',
            description: 'My dApp description',
            url: window.location.origin,
            icons: [`${window.location.origin}/images/my-dapp-icon.png`]
        }
    };

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <DAppKitProvider
                node="https://testnet.vechain.org/"
                logLevel="DEBUG"
                usePersistence={true}
                requireCertificate={false}
                allowedWallets={['veworld']}
                walletConnectOptions={walletConnectOptions}
            >
                {children}
            </DAppKitProvider>
        </ThemeProvider>
    );
}