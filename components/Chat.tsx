
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);

const AssistantAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-lime-400 flex-shrink-0 flex items-center justify-center">
        <span className="text-black font-bold text-lg select-none">GC</span>
    </div>
);


export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickReply = (reply: string) => {
      if (!isLoading) {
          onSendMessage(reply);
      }
  }
  
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex flex-col h-full w-full bg-black rounded-xl shadow-2xl border border-gray-700">
       <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm rounded-t-xl">
            <h3 className="font-bold text-white text-lg">Assistente Cativante</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar chat">
                <CloseIcon />
            </button>
        </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                 <AssistantAvatar />
              )}
              <div className={`p-4 rounded-2xl max-w-lg shadow-md ${message.role === 'user' ? 'bg-lime-400 text-black rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
               {message.role === 'user' && (
                 <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3">
               <AssistantAvatar />
                <div className="p-4 rounded-2xl max-w-lg bg-gray-800 text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {lastMessage?.role === 'assistant' && lastMessage.quickReplies && !isLoading && (
          <div className="p-4 border-t border-gray-700 flex flex-wrap gap-2">
              {lastMessage.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 bg-gray-800 hover:bg-lime-400 text-gray-200 hover:text-black rounded-full text-sm transition-colors"
                  >
                    {reply}
                  </button>
              ))}
          </div>
      )}

      <div className="p-4 border-t border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Faça a sua pergunta..."
            className="w-full bg-gray-900 border border-gray-600 rounded-full py-3 pl-5 pr-16 focus:outline-none focus:ring-2 focus:ring-lime-400 text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-lime-400 hover:bg-lime-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-full p-2 transition-colors"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
