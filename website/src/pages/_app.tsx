import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  hardhat,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [arbitrum, hardhat],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'FlashBank.net',
  projectId: 'flashbank-net-app', // Replace with your WalletConnect project ID
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
