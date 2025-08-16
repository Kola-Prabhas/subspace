import React from 'react';
import { NhostProvider, useAuthenticationStatus } from '@nhost/react';
import { ApolloProvider } from '@apollo/client';
import { nhost } from './lib/nhost';
import { apolloClient } from './lib/apollo';
import { AuthContainer } from './components/Auth/AuthContainer';
import { MainLayout } from './components/Layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
	const { isAuthenticated, isLoading } = useAuthenticationStatus();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return isAuthenticated ? <MainLayout /> : <AuthContainer />;
};

function App() {
	return (
		<NhostProvider nhost={nhost}>
			<ApolloProvider client={apolloClient}>
				<Toaster
					position="top-center"
					reverseOrder={false}
					gutter={8}
					containerClassName=""
					containerStyle={{}}
					toasterId="default"
					toastOptions={{
						className: '',
						duration: 5000,
						removeDelay: 1000,
						style: {
							background: '#363636',
							color: '#fff',
						},

						success: {
							duration: 6000,
							iconTheme: {
								primary: 'green',
								secondary: 'black',
							},
						},
					}}
				/>
				<AppContent />

			</ApolloProvider>
		</NhostProvider>
	);
}

export default App;