import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
	onSubmit: (e: React.FormEvent, message: string) => void;
	isGenerating: boolean;

}


export const MessageInput: React.FC<MessageInputProps> = ({ onSubmit, isGenerating }) => {
	const [message, setMessage] = useState('');

	return (
		<div className="bg-white border-t border-gray-200 p-4">
			<form onSubmit={(e) => {
				setMessage('');
				onSubmit(e, message);
			}} className="flex gap-4">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Type your message..."
					disabled={isGenerating}
					className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={!message.trim() || isGenerating}
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Send className="w-4 h-4" />
				</button>
			</form>
		</div>
	);
}