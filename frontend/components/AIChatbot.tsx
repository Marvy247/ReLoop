'use client';


import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, Bot } from 'lucide-react';

const mockResponses = [
  "Hello! How can I assist you with your Digital Twin today?",
  "Did you know? Recycling your product helps reduce carbon footprint significantly!",
  "You can mint a new Digital Twin NFT to track your product's lifecycle.",
  "B3TR rewards are given for sustainable recycling actions. Keep it up!",
  "Feel free to ask me about product lifecycle, rewards, or recycling process.",
];

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, `You: ${input}`]);
    setInput('');
    setIsTyping(true);
    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setMessages(prev => [...prev, `AI: ${randomResponse}`]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse"
            >
              <Bot className="w-7 h-7 text-white" />
            </Button>
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              AI
            </div>
          </div>
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <p className="text-sm text-gray-700 dark:text-gray-300">Ask me about sustainability!</p>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">AI Sustainability Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Welcome to ReLoop AI Assistant!</p>
                  <p className="text-xs text-gray-500">Ask me about digital twins, recycling, or sustainability.</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-sm p-3 rounded-lg max-w-[80%] ${
                  msg.startsWith('You:') 
                    ? 'bg-blue-500 text-white self-end ml-auto' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                } animate-in slide-in-from-bottom-2 duration-200`}>
                  {msg.startsWith('You:') ? msg.substring(4) : msg.substring(4)}
                </div>
              ))}
              {isTyping && (
                <div className="text-sm p-3 bg-white dark:bg-gray-800 rounded-lg max-w-[80%] animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex space-x-2 p-3 bg-white dark:bg-gray-800 rounded-b-lg">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-gray-300 dark:border-gray-600 focus:border-blue-500"
              />
              <Button onClick={handleSend} size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
