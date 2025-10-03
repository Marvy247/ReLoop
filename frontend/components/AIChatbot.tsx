'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, Bot, Sparkles } from 'lucide-react';

const suggestedPrompts = [
  "How does recycling my phone help the environment?",
  "What are B3TR tokens?",
  "Tell me about the ReLoop project.",
  "What is a Digital Twin NFT?",
];

// A more sophisticated, self-contained AI simulation
const getFakeAiResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();

  if (input.includes("b3tr")) {
    return "B3TR (Best 3arth Token) is an ERC20 utility token on the VeChain blockchain. It serves as the primary incentive within the ReLoop ecosystem. You earn B3TR tokens as a reward for responsibly recycling products that have a Digital Twin NFT. This creates a tangible financial benefit for participating in the circular economy!";
  }
  if (input.includes("reloop")) {
    return "ReLoop is a decentralized platform built on VeChain that powers the circular economy. We create unique 'Digital Twin' NFTs for products, allowing for transparent tracking of their entire lifecycle. By recycling a product, you are rewarded with B3TR tokens, creating a system that benefits consumers, brands, and the planet.";
  }
  if (input.includes("digital twin")) {
    return "A Digital Twin NFT is a unique digital passport for a physical product, stored on the VeChain blockchain. It contains information about the product's origin, materials, and a complete, immutable history of its lifecycle events—from minting to recycling. This ensures transparency and traceability.";
  }
  if (input.includes("recycling") || input.includes("environment")) {
    return "Recycling products, like phones, has a massive positive impact! It conserves natural resources, reduces the need for raw material extraction, and saves energy. For example, recycling one million laptops saves the energy equivalent to the electricity used by more than 3,500 US homes in a year. By recycling through ReLoop, you ensure your old products are handled responsibly and you get rewarded for it!";
  }
  if (input.includes("hello") || input.includes("hi")) {
    return "Hello! I'm the ReLoop AI Assistant. How can I help you on your sustainability journey today? Feel free to ask me about Digital Twins, B3TR rewards, or the recycling process.";
  }

  return "I'm sorry, I can only answer questions about ReLoop, Digital Twins, B3TR tokens, and the recycling process. Please try asking one of the suggested prompts!";
};

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ author: 'You' | 'AI'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage = { author: 'You' as const, text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponseText = getFakeAiResponse(userMessage.text);
      const aiResponse = { author: 'AI' as const, text: aiResponseText };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50 group">
          <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <p className="text-sm text-gray-700 dark:text-gray-300">Have a question about sustainability? Ask our AI!</p>
            <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse"
          >
            <Bot className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 w-96 h-[600px] shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">AI Sustainability Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 p-0 min-h-0">
            <div className="overflow-y-auto space-y-4 p-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Welcome to the ReLoop AI Assistant!</p>
                  <p className="text-xs text-gray-500 mb-6">Ask me about digital twins, recycling, or sustainability.</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">Try these prompts:</p>
                    {suggestedPrompts.map((prompt, i) => (
                      <Button key={i} variant="outline" size="sm" className="w-full text-left" onClick={() => handlePromptClick(prompt)}>
                        <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-end gap-2 text-sm max-w-[85%] ${ 
                  msg.author === 'You' ? 'self-end ml-auto' : 'self-start' 
                }`}>
                   {msg.author === 'AI' && <Bot className="w-6 h-6 text-blue-500 flex-shrink-0 mb-1" />}
                  <div className={`p-3 rounded-lg ${ 
                    msg.author === 'You'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  } animate-in slide-in-from-bottom-2 duration-200`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-2 text-sm max-w-[85%] self-start">
                  <Bot className="w-6 h-6 text-blue-500 flex-shrink-0 mb-1" />
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg animate-pulse rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex space-x-2 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about sustainability..."
                className="flex-1 border-gray-300 dark:border-gray-600 focus:border-blue-500"
                disabled={isTyping}
              />
              <Button onClick={handleSend} size="icon" className="bg-blue-500 hover:bg-blue-600" disabled={isTyping || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
