import React from 'react';
import { Message } from '../../types';
import './MessageItem.css';
import Markdown from 'markdown-to-jsx';

interface MessageItemProps {
	message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
	const isGenerating = message.isGenerating;

	return (
		<div className='space-y-4'>
			<div className='flex justify-end'>
				<p className='px-3 py-2 max-w-[70%] bg-gray-200 rounded-xl'>
					{message.query}
				</p>
			</div>
			{isGenerating ? (
				<div className="loader">
				</div>
			) : (
				<div className='flex'>
					<p className='md-content px-3 py-2 bg-slate-100 rounded-xl'>
						<Markdown>
							{message.response}
						</Markdown>
					</p>
				</div>
			)}
		</div>
	);
};