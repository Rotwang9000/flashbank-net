import React from 'react';
import { Zap, Coins } from 'lucide-react';

// Shared top navigation used by both products. The two products — the flash-loan
// Router and the peer-to-peer term Loans — are surfaced as a single, obvious switch
// so a visitor always knows the two halves of FlashBank and where they are.
//
// All page-specific behaviour (network switching, disconnecting) is passed in as
// props rather than reaching into page state, keeping this component self-contained.

export type NavProduct = 'flash' | 'loans';

export interface NavNetwork {
	id: number;
	name: string;
}

interface NavProps {
	active: NavProduct;
	networks: NavNetwork[];
	chainId: number;
	onSelectNetwork: (id: number) => void;
	isConnected: boolean;
	address?: string | null;
	onDisconnect: () => void;
}

const shortAddress = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

function ProductLink({ href, label, icon, current, accent }: {
	href: string;
	label: string;
	icon: React.ReactNode;
	current: boolean;
	accent: 'blue' | 'emerald';
}) {
	const activeClass = accent === 'blue' ? 'bg-white text-blue-700 shadow-sm' : 'bg-white text-emerald-700 shadow-sm';
	return (
		<a
			href={href}
			aria-current={current ? 'page' : undefined}
			className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${current ? activeClass : 'text-gray-500 hover:text-gray-800'}`}
		>
			{icon}
			<span>{label}</span>
		</a>
	);
}

export default function Nav({ active, networks, chainId, onSelectNetwork, isConnected, address, onDisconnect }: NavProps) {
	return (
		<header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
			<div className="container mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-x-4 gap-y-3 justify-between items-center">
				<a href="/" className="flex items-center gap-2.5 shrink-0">
					<div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
						<Zap className="h-5 w-5 text-white" />
					</div>
					<span className="text-lg font-bold text-gray-900 tracking-tight">
						Flash<span className="text-blue-600">Bank</span>
					</span>
				</a>

				<nav className="order-last w-full sm:order-none sm:w-auto flex justify-center">
					<div className="inline-flex bg-gray-100 rounded-xl p-1">
						<ProductLink href="/" label="Flash Loans" icon={<Zap className="h-4 w-4" />} current={active === 'flash'} accent="blue" />
						<ProductLink href="/flashbank-loan" label="P2P Loans" icon={<Coins className="h-4 w-4" />} current={active === 'loans'} accent="emerald" />
					</div>
				</nav>

				<div className="flex items-center gap-2 shrink-0">
					<div className="hidden md:flex bg-gray-100 rounded-full p-0.5">
						{networks.map((n) => (
							<button
								key={n.id}
								onClick={() => onSelectNetwork(n.id)}
								className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${n.id === chainId ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
							>
								{n.name}
							</button>
						))}
					</div>
					{isConnected && address ? (
						<div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
							<span className="w-2 h-2 rounded-full bg-emerald-500" />
							<span className="font-mono text-xs">{shortAddress(address)}</span>
							<button onClick={onDisconnect} className="text-gray-400 hover:text-gray-700 text-xs" aria-label="Disconnect wallet">✕</button>
						</div>
					) : (
						<appkit-connect-button />
					)}
				</div>
			</div>
		</header>
	);
}
