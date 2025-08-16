export interface User {
	id: string;
	email: string;
	displayName?: string;
}

export interface Chat {
	id: string;
	user_id: string;
	title: string;
	created_at: string;
}

export interface Message {
	id: string;
	chat_id: string;
	query: string;
	response: string;
	isGenerating: boolean;
	isError: boolean;
	created_at: string;
}

export interface ChatWithMessages extends Chat {
	messages: Message[];
}