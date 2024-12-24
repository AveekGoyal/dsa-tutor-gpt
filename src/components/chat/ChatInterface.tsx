'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowUpIcon, Code2, Lightbulb, MessageSquare, Sparkles, Bot, User } from 'lucide-react';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  stage?: string;
  createdAt: Date;
  isLoading?: boolean;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatInterfaceProps {
  sidebarCollapsed: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sidebarCollapsed }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');

  const loadingStages = [
    'Analyzing your message...',
    'Processing the context...',
    'Preparing response...',
    'Almost ready...'
  ];

  useEffect(() => {
    if (isThinking) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        setLoadingStage(loadingStages[currentIndex]);
        currentIndex = (currentIndex + 1) % loadingStages.length;
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    } else {
      // Reset the interface when no chat is selected
      setMessages([]);
      setCurrentChat(null);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        setCurrentChat(chat);
        setMessages(chat.messages || []);
      } else {
        console.error('Failed to fetch chat:', await response.text());
        if (response.status === 404) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      router.push('/dashboard');
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        router.push(`/dashboard?chatId=${newChat._id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      createdAt: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      // If this is the first message, update the chat title
      if (messages.length === 0) {
        const title = generateChatTitle(input.trim());
        const titleResponse = await fetch(`/api/chats/${chatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        
        if (!titleResponse.ok) {
          throw new Error('Failed to update chat title');
        }
        
        // Trigger a refresh of the chat list in sidebar
        const event = new CustomEvent('chatUpdated');
        window.dispatchEvent(event);
      }

      // Save user message
      const saveResponse = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save message');
      }

      // Create placeholder for AI response with loading state
      setIsThinking(true);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        createdAt: new Date(),
        isLoading: true
      };
      setMessages(prev => [...prev, aiMessage]);

      // Get AI response
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(newMessage).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          aiResponseText += chunk;

          // Update AI message with accumulated response and clear loading state
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessage.id
              ? { ...msg, content: aiResponseText, isLoading: false }
              : msg
          ));
        }
      }

      // Save complete AI response
      const aiSaveResponse = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { ...aiMessage, content: aiResponseText, isLoading: false }
        })
      });

      if (!aiSaveResponse.ok) {
        throw new Error('Failed to save AI response');
      }

      // Update current chat with latest messages
      await fetchChat(chatId);
      setIsThinking(false);
    } catch (error) {
      console.error('Failed to process message:', error);
      // Clear loading state even if there's an error
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessage.id
          ? { ...msg, isLoading: false, content: 'Sorry, there was an error generating the response.' }
          : msg
      ));
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Helper function to generate a chat title from the first message
  const generateChatTitle = (message: string): string => {
    // Remove code blocks and inline code
    const withoutCode = message.replace(/```[\s\S]*?```/g, '')
                              .replace(/`.*?`/g, '');
    
    // Remove extra whitespace and newlines
    const cleanText = withoutCode.replace(/\s+/g, ' ').trim();
    
    // Get first sentence or first N characters
    const firstSentence = cleanText.split(/[.!?]/, 1)[0].trim();
    
    if (firstSentence.length <= 50) {
      return firstSentence;
    }
    
    // If sentence is too long, take first 50 chars and add ellipsis
    return firstSentence.substring(0, 50) + '...';
  };

  const header = (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        Welcome to DSA GPTutor
      </h1>
      
      <p className="text-gray-600 text-center mb-8">
        Your AI-powered guide through Data Structures and Algorithms
      </p>

      <div className="w-full space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <MessageSquare size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">Share Your Problem</h2>
            <p className="text-sm text-gray-500">
              Describe the DSA problem you're working on, or paste the problem statement
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Code2 size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">Include Your Progress</h2>
            <p className="text-sm text-gray-500">
              Share any code you've written or approaches you've tried
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Lightbulb size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">Get Stage-by-Stage Guidance</h2>
            <p className="text-sm text-gray-500">
              Receive structured help through understanding, planning, and implementation
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Sparkles size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-900">Learn and Improve</h2>
            <p className="text-sm text-gray-500">
              Understand the concepts, patterns, and optimizations along the way
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Type your message below to begin ↓
      </div>
    </div>
  );

  return (
    <main className="mx-auto flex h-screen w-full max-w-[60rem] flex-col items-stretch">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? header : (
          <div className="flex flex-col space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex items-start max-w-[80%] space-x-2",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-6 h-6 mt-1 text-blue-500" />
                  ) : (
                    <User className="w-6 h-6 mt-1 text-gray-500" />
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2",
                      message.role === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                    )}
                    {message.isLoading && (
                      <div className="flex items-center mt-2">
                        <div className="animate-pulse mr-2">⚪</div>
                        <span className="text-sm text-gray-500 animate-fade-in-out">
                          {loadingStage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="mx-6 mb-6">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-xl border bg-white px-3 py-1.5 pr-8 text-sm focus-within:ring-1 focus-within:ring-blue-200"
        >
          <AutoResizeTextarea
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-1.5 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute bottom-1.5 right-2 rounded-full p-1 text-gray-400 hover:text-gray-600"
          >
            <ArrowUpIcon size={16} />
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChatInterface;
