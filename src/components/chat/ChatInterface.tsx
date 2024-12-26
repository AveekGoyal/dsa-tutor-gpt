/**
 * @dev Main chat interface component that handles real-time chat interactions
 * Features: message handling, auto-scrolling, session management, markdown support
 */

'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowUpIcon, Code2, Lightbulb, MessageSquare, Sparkles, Bot, User } from 'lucide-react';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

/**
 * @dev Defines the structure for chat messages
 */
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  stage?: string;
  createdAt: Date;
  isLoading?: boolean;
}

/**
 * @dev Defines the structure for a complete chat session
 */
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
  const [isFetchingChat, setIsFetchingChat] = useState(false);
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

  /**
   * @dev Updates loading stage messages while AI is processing
   */
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

  /**
   * @dev Scrolls chat to bottom after new messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * @dev Fetches existing chat or resets interface for new chat
   */
  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    } else {
      setMessages([]);
      setCurrentChat(null);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * @dev Fetches chat history from the server
   */
  const fetchChat = async (chatId: string) => {
    setIsFetchingChat(true);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        cache: 'no-store'
      });
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
    } finally {
      setIsFetchingChat(false);
    }
  };

  /**
   * @dev Creates a new chat session
   */
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

  /**
   * @dev Handles message submission and AI response streaming
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      createdAt: new Date()
    };

    // Clear input and add message to UI
    setInput('');
    setMessages(prev => [...prev, newMessage]);

    // Create placeholder for AI response with loading state
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      createdAt: new Date(),
      isLoading: true
    };

    try {
      // If this is the first message, update chat title
      if (messages.length === 0) {
        const title = generateChatTitle(input.trim());
        const titleResponse = await fetch(`/api/chats/${chatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });

        if (titleResponse.ok) {
          // Trigger a refresh of the chat list in sidebar
          const event = new CustomEvent('chatUpdated');
          window.dispatchEvent(event);
        }
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

      // Add AI message placeholder to UI
      setIsThinking(true);
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

      // No need to fetch chat again since we already have the latest messages
      setIsThinking(false);
    } catch (error) {
      console.error('Failed to process message:', error);
      
      // Remove the AI message if it was added
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.id === aiMessage.id) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      
      setIsThinking(false);
    }
  };

  /**
   * @dev Handles keyboard events for message submission
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  /**
   * @dev Generates a chat title from the first message content
   */
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

      <div className="mt-8 flex flex-col items-center">
        <button
          onClick={createNewChat}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <MessageSquare size={16} />
          Start New Chat
        </button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto flex h-screen w-full max-w-[60rem] flex-col items-stretch">
      <div className="flex-1 overflow-y-auto p-4">
        {!chatId && messages.length === 0 ? header : (
          <div className="flex flex-col space-y-4 p-4">
            {isFetchingChat ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading chat...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.length === 0 && chatId && (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      New Chat Started
                    </h2>
                    <p className="text-gray-600">
                      Start typing your DSA question below to begin the discussion
                    </p>
                  </div>
                )}
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
              </>
            )}
          </div>
        )}
      </div>

      {chatId && (
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
              className="absolute bottom-2 right-2 rounded-full p-1 text-gray-400 hover:text-gray-600"
            >
              <ArrowUpIcon size={18} />
            </button>
          </form>
          <div className="text-xs text-muted-foreground text-center pt-2">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
       
      )}
    </main>
  );
};

export default ChatInterface;
