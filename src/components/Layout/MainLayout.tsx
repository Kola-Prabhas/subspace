import React, { useState } from 'react';
import { useSignOut } from '@nhost/react';
import { LogOut } from 'lucide-react';
import { ChatList } from '../Chat/ChatList';
import { ChatView } from '../Chat/ChatView';

export const MainLayout: React.FC = () => {
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [selectedChatTitle, setSelectedChatTitle] = useState<string>('');
	const { signOut } = useSignOut();

	const handleSelectChat = (chatId: string, title: string) => {
		setSelectedChatId(chatId || null);
		setSelectedChatTitle(title);
	};

	const handleSignOut = () => {
		if (confirm('Are you sure you want to sign out?')) {
			signOut();
		}
	};

	return (
		<div className="h-screen flex bg-gray-50">
			{/* Sidebar */}
			<div className="flex flex-col">
				<ChatList
					selectedChatId={selectedChatId}
					onSelectChat={handleSelectChat}
				/>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col h-full">
				{/* Top Bar */}
				<div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end">
					<button
						onClick={handleSignOut}
						className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<LogOut className="w-4 h-4" />
						Sign Out
					</button>
				</div>

				{/* Chat View */}
				<div className="flex-1 min-h-0">  {/* 🔹 This min-h-0 is key */}
					<ChatView
						chatId={selectedChatId}
						chatTitle={selectedChatTitle}
						onSelectChat={handleSelectChat}
					/>
				</div>
			</div>
		</div>
	);
};