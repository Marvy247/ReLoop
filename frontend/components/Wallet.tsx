'use client';

import { WalletButton } from '@vechain/dapp-kit-react';
import { useTheme } from 'next-themes';

export default function Wallet() {
  const { theme } = useTheme();

  return (
    <>
      <div className={theme === 'dark' ? 'dark-wallet-button' : 'light-wallet-button'}>
        <WalletButton />
      </div>
      <style jsx>{`
        .dark-wallet-button :global(button) {
          background-color: #1a202c; /* dark background */
          color: #f7fafc; /* light text */
        }
        .dark-wallet-button :global(.wallet-modal) {
          background-color: #2d3748; /* dark modal background */
          color: #f7fafc;
        }
        .light-wallet-button :global(button) {
          background-color: #edf2f7; /* light background */
          color: #1a202c; /* dark text */
        }
      `}</style>
    </>
  );
}
