import type { AppProps } from 'next/app';
import '../styles/globals.css';

import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet, base, sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'FlashBank.net',
  description: 'Revolutionary trustless flash loans with zero permanent risk',
  url: 'https://flashbank.net',
  icons: ['https://flashbank.net/logo.png'],
};

const networks = [sepolia, arbitrum, mainnet, base];

const wagmiAdapter = new WagmiAdapter({
	projectId,
	networks: networks as any, // Type assertion to bypass strict typing
	ssr: false, // Disable SSR to prevent hydration issues
	// Prefer Sepolia as initial chain if possible
	defaultChain: sepolia as any,
} as any);

const wagmiConfig = wagmiAdapter.wagmiConfig;

createAppKit({
	projectId,
	metadata,
	adapters: [wagmiAdapter],
	networks: networks as any, // Type assertion to bypass strict typing
	features: {
		analytics: true,
	},
	themeMode: 'light',
	allowUnsupportedChain: false,
	// Prefer Sepolia as default in the connect modal
	defaultNetwork: sepolia as any,
} as any);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <Component {...pageProps} />
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
