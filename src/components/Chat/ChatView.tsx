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

	const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
	const pendingIdsRef = useRef<Set<string>>(new Set());

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const user = useUserData();

	const { refetch: refetchChats } = useQuery(GET_USER_CHATS, {
		skip: !user?.id,
	});

	const { data: initialData, loading } = useQuery(GET_CHAT_MESSAGES, {
		variables: { chatId },
		skip: !chatId,
	});

	const { data: subData } = useSubscription(MESSAGES_SUBSCRIPTION, {
		variables: { chatId },
		skip: !chatId,
	});

	const [createChat, { loading: createLoading }] = useMutation(CREATE_CHAT);
	const [createMessage] = useMutation(CREATE_MESSAGE);

	const messages: Message[] = useMemo(() => {
		const initialMessages: Message[] = initialData?.messages || [];
		const subMessages: Message[] = subData?.messages || [];

		const map = new Map<string, Message>();
		[...optimisticMessages, ...initialMessages, ...subMessages].forEach((m) => {
			map.set(m.id, m);
		});

		return Array.from(map.values()).sort((a, b) => {
			if (a.created_at && b.created_at) {
				return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			}
			return 0;
		});
	}, [initialData, subData, optimisticMessages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const updateIsGeneratingFromPending = () => {
		setIsGenerating(pendingIdsRef.current.size > 0);
	};

	useEffect(() => {
		if (!subData?.messages?.length) return;

		let changed = false;
		for (const msg of subData.messages as Message[]) {
			if (pendingIdsRef.current.has(msg.id) && !msg.isGenerating) {
				pendingIdsRef.current.delete(msg.id);

				setOptimisticMessages((prev) => prev.filter((m) => m.id !== msg.id));
				changed = true;
			} else if (!pendingIdsRef.current.has(msg.id) && !msg.isGenerating) {
				setOptimisticMessages((prev) => {
					const maybe = prev.find((om) => om.query === msg.query && om.isGenerating);
					if (maybe) {
						pendingIdsRef.current.delete(maybe.id);
						return prev.filter((m) => m.id !== maybe.id);
					}
					return prev;
				});
				changed = true;
			}
		}

		if (changed) updateIsGeneratingFromPending();
	}, [subData]);

	const handleCreateChat = async (userMessage: string) => {
		if (!user?.id || createLoading) return;
		try {
			const result = await createChat({
				variables: {
					title: userMessage,
				},
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
		if (!content.trim()) return;

		const userMessage = content.trim();

		// If no chatId, create chat first (don't reassign props — instead capture returned id)
		let currentChatId = chatId;
		if (!currentChatId) {
			const res = await handleCreateChat(userMessage);
			currentChatId = res?.data?.insert_chats_one?.id || null;
			if (!currentChatId) {
				console.error('Could not create chat before sending message');
				return;
			}
		}

		// Create optimistic message with a temporary id
		const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		const optimistic: Message = {
			id: tempId,
			chat_id: currentChatId,
			query: userMessage,
			response: '',
			isGenerating: true,
			isError: false,
			created_at: new Date().toISOString(),
		};

		// add optimistic message and mark as pending
		setOptimisticMessages((prev) => [...prev, optimistic]);
		pendingIdsRef.current.add(tempId);
		updateIsGeneratingFromPending();

		try {
			// Call mutation; include isGenerating: true so the DB row is inserted flagged as generating
			const result = await createMessage({
				variables: {
					chatId: currentChatId,
					query: userMessage,
					isGenerating: true, // if your mutation accepts this field
				},
			});

			// If backend returns the real id for the inserted row, replace the optimistic id
			const realId = result?.data?.insert_messages_one?.id;
			if (realId) {
				// replace optimistic message id with realId so subscription can match it exactly
				setOptimisticMessages((prev) =>
					prev.map((m) => (m.id === tempId ? { ...m, id: realId } : m))
				);
				// update pending set
				pendingIdsRef.current.delete(tempId);
				pendingIdsRef.current.add(realId);
				updateIsGeneratingFromPending();
			}
		} catch (error) {
			console.error('Error sending message:', error);
			// remove optimistic message on failure
			pendingIdsRef.current.delete(tempId);
			setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
			updateIsGeneratingFromPending();
		}
	};

	const handleSubmit = (e: React.FormEvent, message: string) => {
		e.preventDefault();
		sendMessage(message);
	};

	return (
		<div className="max-w-4xl mx-auto flex-1 flex flex-col h-full">
			{!chatId && (
				<div className="flex-1 flex items-center justify-center bg-gray-50">
					<div className="text-center">
						<MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h2>
						<p className="text-gray-600">Start chatting to get instant answers</p>
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
