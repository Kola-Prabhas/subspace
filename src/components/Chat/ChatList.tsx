import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useUserData } from '@nhost/react';
import { Plus, MessageCircle, Trash2, Loader2, User } from 'lucide-react';
import { GET_USER_CHATS } from '../../graphql/queries';
import { DELETE_CHAT } from '../../graphql/mutations';
import { Chat } from '../../types';

interface ChatListProps {
	selectedChatId: string | null;
	onSelectChat: (chatId: string, title: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
	const user = useUserData();
	const { data, loading, refetch } = useQuery(GET_USER_CHATS, {
		skip: !user?.id,
	});

	const [deleteChat] = useMutation(DELETE_CHAT);

	const chats: Chat[] = data?.chats || [];

	const handleSelectNewChat = () => {
		onSelectChat('', '');
	};

	const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
		e.stopPropagation();

		if (confirm('Are you sure you want to delete this chat?')) {
			try {
				await deleteChat({ variables: { chatId } });
				if (selectedChatId === chatId) {
					onSelectChat('', '');
				}
				await refetch();
			} catch (error) {
				console.error('Error deleting chat:', error);
			}
		}
	};

	if (loading) {
		return (
			<div className="w-80 bg-gray-900 text-white flex items-center justify-center">
				<Loader2 className="w-6 h-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="w-80 bg-gray-900 text-white flex flex-col h-full">
			{/* Header */}
			<div className="p-4 border-b border-gray-700">
				<button
					onClick={handleSelectNewChat}
					className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
				>

					<Plus className="w-4 h-4" />
					New Chat
				</button>
			</div>

			{/* Chat List */}
			<div className="flex-1 overflow-y-auto p-2">
				{chats.length === 0 ? (
					<div className="text-center text-gray-400 mt-8">
						<MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p className="text-sm">No chats yet</p>
						<p className="text-xs mt-1">Create your first chat to get started</p>
					</div>
				) : (
					<div className="space-y-2">
						{chats.map((chat) => (
							<div
								key={chat.id}
								onClick={() => onSelectChat(chat.id, chat.title)}
								className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedChatId === chat.id
									? 'bg-blue-600 text-white'
									: 'hover:bg-gray-800 text-gray-300'
									}`}
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<MessageCircle className="w-4 h-4 flex-shrink-0" />
									<span className="truncate text-sm font-medium">
										{chat.title}
									</span>
								</div>
								<button
									onClick={(e) => handleDeleteChat(chat.id, e)}
									className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-600 transition-all ${selectedChatId === chat.id ? 'text-white' : 'text-gray-400'
										}`}
								>
									<Trash2 className="w-3 h-3" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* User Info */}
			<div className="p-4 border-t border-gray-700">
				<div className="flex items-center gap-3 text-sm">
					<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
						<User className="w-4 h-4" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="truncate font-medium">
							{user?.displayName || user?.email}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};