import React, { useState } from 'react';
import { useSignUpEmailPassword, useSendVerificationEmail } from '@nhost/react';
import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

interface RegisterFormProps {
	onToggleMode: () => void;
}



export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const { signUpEmailPassword, isLoading, error } = useSignUpEmailPassword();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await signUpEmailPassword(email, password, {
			displayName: displayName.trim() || undefined,
		});


		if (!error && res.needsEmailVerification) {
			toast.success('Verification Email Sent. Please check your Spam Folder if not found',)

			setEmail('');
			setPassword('');
			setDisplayName('');
		}

	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-2xl shadow-xl p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Create account</h1>
					<p className="text-gray-600 mt-2">Get started with your AI assistant</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Display name (optional)
						</label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								value={displayName}
								disabled={isLoading}
								onChange={(e) => setDisplayName(e.target.value)}
								className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								placeholder="Enter your name"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email address
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="email"
								value={email}
								disabled={isLoading}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								placeholder="Enter your email"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type={showPassword ? 'text' : 'password'}
								value={password}
								disabled={isLoading}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								placeholder="Create a password"
								required
								minLength={6}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								disabled={isLoading}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>
						<p className="text-sm text-gray-500 mt-1">
							Password must be at least 6 characters long
						</p>
					</div>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
							{error.message}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Creating account...' : 'Create account'}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Already have an account?{' '}
						<button
							onClick={onToggleMode}
							className="text-blue-600 hover:text-blue-700 font-semibold"
						>
							Sign in
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};