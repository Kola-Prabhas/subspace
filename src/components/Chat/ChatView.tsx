import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useUserData } from '@nhost/react';
import { Loader2, MessageCircle } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { CREATE_MESSAGE } from '../../graphql/mutations';
import { CREATE_CHAT } from '../../graphql/mutations';
import { GET_CHAT_MESSAGES, GET_USER_CHATS } from '../../graphql/queries';
import { Message } from '../../types';
import { MessageInput } from './MessageInput';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/subscriptions';

interface ChatViewProps {
	chatId: string | null;
	chatTitle?: string;
	onSelectChat: (chatId: string, title: string) => void;
}


export const ChatView: React.FC<ChatViewProps> = ({ chatId, onSelectChat }) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const user = useUserData();

	const { refetch: refetchChats } = useQuery(GET_USER_CHATS, {
		skip: !user?.id,
	});

	const { data: initialData, loading} = useQuery(GET_CHAT_MESSAGES, {
		variables: { chatId },
		skip: !chatId,
	});

	const { data: subData } = useSubscription(MESSAGES_SUBSCRIPTION, {
		variables: { chatId},
		skip: !chatId,
		onSubscriptionData: ({ subscriptionData }) => {
			if (subscriptionData?.data) {
				setIsGenerating(false);
			}
		},
	});


	const [createChat, { loading: createLoading }] = useMutation(CREATE_CHAT);
	const [createMessage] = useMutation(CREATE_MESSAGE);
	// 	const initialMessages = initialData?.messages || [];
	// 	const newMessages = subData?.messages || [];

	// 	// Merge and deduplicate by id
	// 	const merged = [...initialMessages, ...newMessages].reduce<Message[]>((acc, msg) => {
	// 		if (!acc.some(m => m.id === msg.id)) {
	// 			acc.push(msg);
	// 		}
	// 		return acc;
	// 	}, []);

	// 	return merged;
	// }, [initialData, subData]);


	const messages: Message[] = useMemo(() => {
		const initialMessages = initialData?.messages || [];
		const newMessages = subData?.messages || [];

		// Merge and deduplicate by id
		const merged = [...initialMessages, ...newMessages].reduce<Message[]>((acc, msg) => {
			if (!acc.some(m => m.id === msg.id)) {
				acc.push(msg);
			}
			return acc;
		}, []);

		return merged;
	}, [initialData, subData]);


	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);


	const handleCreateChat = async (userMessage: string) => {
		if (!user?.id || createLoading) return;

		try {
			const result = await createChat({
				variables: {
					title: userMessage
				}
			});

			if (result.data?.insert_chats_one) {
				const newChat = result.data.insert_chats_one;
				onSelectChat(newChat.id, newChat.title);
				await refetchChats();
			}

			return result;
		} catch (error) {
			console.error('Error creating chat:', error);
		}
	};

	const sendMessage = async (content: string) => {
		if (!content.trim() || isGenerating) return;

		const userMessage = content.trim();
		if (!chatId) {
			const res = await handleCreateChat(userMessage);
			chatId = res?.data.insert_chats_one.id;
		}

		setIsGenerating(true);


		try {
			messages.push({
				id: 'sample',
				chat_id: '',
				query: userMessage,
				response: '',
				isGenerating: true,
				isError: false,
				created_at: ''
			});
			// Create user message
			await createMessage({
				variables: {
					chatId,
					query: userMessage,
				},
			});

		} catch (error) {
			console.error('Error sending message:', error);
		} 
	};

	const handleSubmit = (e: React.FormEvent, message: string) => {
		e.preventDefault();
		sendMessage(message);
	};


	return (
		<div className="max-w-4xl mx-auto flex-1 flex flex-col h-full">
			{/* Messages */}

			{!chatId && (
				<div className="flex-1 flex items-center justify-center bg-gray-50">
					<div className="text-center">
						<MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Welcome to AI Assistant
						</h2>
						<p className="text-gray-600">
							Start chatting to get instant answers
						</p>
					</div>
				</div>
			)}


			{chatId && (
				<div className="flex-1 overflow-y-auto scrollbar-hide">
					{loading ? (
						<div className="flex items-center justify-center h-32">
							<Loader2 className="w-6 h-6 animate-spin text-gray-400" />
						</div>
					) : (
						<div className="space-y-8 px-4 mt-4">
							{messages.map((msg) => (
								<MessageItem key={msg.id} message={msg} />
							))}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>
			)}	

			<MessageInput onSubmit={handleSubmit} isGenerating={isGenerating} />
		</div>
	);
};