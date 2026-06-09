import React from 'react';
import Redirect from '../components/Redirect';

// The flash-loan app now lives at /flash (see pages/flash.tsx). Keep the bare domain root working
// by bouncing visitors to it. Swap this for a landing page if we ever want a dedicated home.
export default function Home() {
	return <Redirect to="/flash/" />;
}
