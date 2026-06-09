import React from 'react';
import Redirect from '../components/Redirect';

// The P2P term-loan app moved from /flashbank-loan to /p2p (see pages/p2p.tsx). This stub keeps
// every previously shared/bookmarked /flashbank-loan link alive.
export default function FlashbankLoanRedirect() {
	return <Redirect to="/p2p/" />;
}
