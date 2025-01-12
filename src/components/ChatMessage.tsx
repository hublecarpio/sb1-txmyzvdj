import React from 'react';
import { FileIcon, ImageIcon, UserCircle, Music } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <UserCircle className="w-8 h-8 text-gray-600" />
        </div>
        <div className={`rounded-lg p-3 ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          {message.contentType === 'text' && (
            <p className="break-words">{message.content}</p>
          )}
          {message.contentType === 'image' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </div>
              <img 
                src={message.content} 
                alt="Uploaded content"
                className="max-w-full rounded"
              />
            </div>
          )}
          {message.contentType === 'audio' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>Audio Message</span>
              </div>
              <audio controls className="max-w-full">
                <source src={message.content} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {message.contentType === 'file' && (
            <div className="flex items-center gap-2">
              <FileIcon className="w-4 h-4" />
              <a 
                href={message.content}
                download={message.fileName}
                className="underline"
              >
                {message.fileName || 'Download file'}
              </a>
            </div>
          )}
          <span className="text-xs opacity-70 block mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}